import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './src/server/db.js';
import { extractTextFromBuffer } from './src/server/extractors.js';
import { generateWithRetry, generateWithFallback, isTransientError } from './src/server/aiUtils.js';
import {
  CourseContract,
  LectureMaterial,
  Question,
  QuestionConfig,
  QuizAttempt,
  SummarySection,
  UserProfile,
} from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Multer memory storage (up to 25MB file size)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Simple user resolution middleware
function getUserId(req: express.Request): string {
  const headerUserId = req.headers['x-user-id'] as string;
  return headerUserId || 'usr_ipb_demo';
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
app.get('/api/auth/me', (req, res) => {
  const userId = getUserId(req);
  const user = db.getUser(userId);
  res.json({ success: true, user });
});

app.post('/api/auth/login', (req, res) => {
  const { name, email, university, faculty, major, studentId } = req.body;
  const user: UserProfile = {
    id: `usr_${Date.now()}`,
    name: name || 'Mahasiswa IPB',
    email: email || 'student@apps.ipb.ac.id',
    university: university || 'IPB University',
    faculty: faculty || 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
    major: major || 'Ilmu Komputer',
    studentId: studentId || 'G64220088',
  };
  db.saveUser(user);
  res.json({ success: true, user });
});

// -------------------------------------------------------------
// MATERIALS & SMART PRACTICE ROUTES
// -------------------------------------------------------------
app.get('/api/materials', (req, res) => {
  const userId = getUserId(req);
  const materials = db.getMaterials(userId);
  res.json({ success: true, materials });
});

app.get('/api/materials/:id', (req, res) => {
  const userId = getUserId(req);
  const material = db.getMaterialById(req.params.id, userId);
  if (!material) {
    return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });
  }
  res.json({ success: true, material });
});

app.post('/api/materials/upload', upload.single('file'), async (req, res) => {
  try {
    const userId = getUserId(req);
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diunggah. Silakan pilih dokumen PDF, PPTX, DOCX, atau TXT.',
      });
    }

    const originalName = file.originalname || 'document.txt';
    const mimetype = file.mimetype || 'application/octet-stream';

    // Extract actual text using specialized library
    const extraction = await extractTextFromBuffer(file.buffer, mimetype, originalName, ai);

    if (!extraction.text || extraction.text.trim().length < 20) {
      return res.status(422).json({
        success: false,
        message: 'Gagal mengekstrak teks: Dokumen tidak mengandung teks yang cukup atau file terenkripsi/rusak.',
      });
    }

    const titleCandidate = originalName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const newMaterial: LectureMaterial = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: titleCandidate,
      fileName: originalName,
      fileSize: file.size,
      fileType: mimetype,
      charCount: extraction.charCount,
      wordCount: extraction.wordCount,
      extractedText: extraction.text,
      uploadedAt: new Date().toISOString(),
    };

    db.saveMaterial(newMaterial);

    res.json({
      success: true,
      material: newMaterial,
      message: `Berhasil mengekstrak ${extraction.wordCount.toLocaleString()} kata dari "${originalName}".`,
    });
  } catch (error: unknown) {
    console.error('File upload extraction error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message: msg });
  }
});

app.delete('/api/materials/:id', (req, res) => {
  const userId = getUserId(req);
  const success = db.deleteMaterial(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Materi tidak ditemukan atau sudah dihapus.' });
  }
  res.json({ success: true, message: 'Materi kuliah berhasil dihapus.' });
});

app.post('/api/materials/reset-sample', (req, res) => {
  const userId = getUserId(req);
  db.resetToDefault(userId);
  const materials = db.getMaterials(userId);
  res.json({ success: true, materials, message: 'Contoh materi IPB berhasil dimuat ulang.' });
});

// Summarize Material
app.post('/api/materials/:id/summarize', async (req, res) => {
  try {
    const userId = getUserId(req);
    const material = db.getMaterialById(req.params.id, userId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });
    }

    if (!material.extractedText || material.extractedText.length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Teks dokumen tidak valid untuk dianalisis oleh AI.',
      });
    }

    // Limit text chunking to ~30,000 chars for optimal context preservation
    const contextText = material.extractedText.slice(0, 30000);

    const systemInstruction = `Anda adalah asisten akademik cerdas untuk mahasiswa universitas Indonesia, khususnya mahasiswa IPB University.
Tugas Anda adalah membaca teks materi kuliah berikut ini secara seksama dan menghasilkan rangkuman terstruktur yang sangat rapi, akurat secara akademis, dan mudah dipahami.

PANDUAN KETAT:
- Gunakan Bahasa Indonesia akademis yang lugas dan jelas.
- HANYA gunakan informasi yang benar-benar ada di dalam dokumen. JANGAN mengarang atau menambah informasi fiktif di luar materi.
- Buat rangkuman mencakup 7 bagian utama:
  1. overview: Ringkasan umum materi perkuliahan (1-2 paragraf komprehensif).
  2. mainConcepts: Daftar konsep utama (array string, minimal 4 butir).
  3. importantDefinitions: Definisi penting (array objek term dan definition, minimal 4 butir).
  4. subchapters: Penjelasan setiap sub-bab materi (array objek title dan explanation).
  5. terminology: Glosarium istilah penting dan artinya (array objek term dan meaning, minimal 4 butir).
  6. keyPoints: Poin-poin kunci yang wajib diingat (array string, minimal 4 butir).
  7. finalConclusion: Kesimpulan akhir intisari materi kuliah (1 paragraf mendalam).`;

    const prompt = `Berikut adalah materi kuliah "${material.title}" (${material.fileName}):\n\n${contextText}\n\nBuatlah rangkuman akademik terstruktur sesuai format JSON yang ditentukan.`;

    const aiResponse = await generateWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING },
              mainConcepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              importantDefinitions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                  },
                  required: ['term', 'definition'],
                },
              },
              subchapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['title', 'explanation'],
                },
              },
              terminology: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                  },
                  required: ['term', 'meaning'],
                },
              },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              finalConclusion: { type: Type.STRING },
            },
            required: [
              'overview',
              'mainConcepts',
              'importantDefinitions',
              'subchapters',
              'terminology',
              'keyPoints',
              'finalConclusion',
            ],
          },
        },
      })
    );

    const summaryText = aiResponse.text;
    if (!summaryText) {
      throw new Error('Gagal menerima respons rangkuman dari model AI.');
    }

    const summary: SummarySection = JSON.parse(summaryText);
    material.summary = summary;
    db.saveMaterial(material);

    res.json({ success: true, summary, message: 'Rangkuman materi berhasil digenerate!' });
  } catch (error: unknown) {
    console.error('Summarize error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message: `Gagal membuat rangkuman: ${msg}` });
  }
});

// Generate Practice Questions
app.post('/api/materials/:id/questions', async (req, res) => {
  try {
    const userId = getUserId(req);
    const material = db.getMaterialById(req.params.id, userId);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });
    }

    const config: QuestionConfig = {
      count: Number(req.body.count) || 5,
      difficulty: req.body.difficulty || 'medium',
      type: req.body.type || 'multiple_choice',
    };

    // Cap count to valid steps
    const validCounts = [5, 10, 15, 20, 30, 50];
    const targetCount = validCounts.includes(config.count) ? config.count : 5;

    const contextText = material.extractedText.slice(0, 30000);

    const difficultyDescriptions = {
      easy: 'Tingkat Mudah: Menguji pemahaman dasar, terminologi, dan definisi langsung dari teks.',
      medium: 'Tingkat Sedang: Menguji pemahaman konseptual, penerapan praktis, dan alur sebab-akibat.',
      hard: 'Tingkat Sulit: Menguji pemikiran analitis, penalaran mendalam, evaluasi kasus, dan keterkaitan antarkonsep.',
    };

    const typeDescription =
      config.type === 'multiple_choice'
        ? 'Pilihan Ganda dengan 4 opsi jawaban: "A. ...", "B. ...", "C. ...", "D. ...". HANYA 1 OPSI YANG BENAR.'
        : 'Benar atau Salah (True / False) dengan 2 opsi: "A. Benar", "B. Salah".';

    const systemInstruction = `Anda adalah dosen dan pembuat soal evaluasi akademik profesional untuk mahasiswa universitas Indonesia.
Buatlah tepat ${targetCount} butir latihan soal akademik berdasarkan HANYA dokumen materi kuliah yang disediakan.

ATURAN GENERASI SOAL KETAT:
1. Setiap soal WAJIB berdasar langsung pada materi dokumen (grounded in the source text).
2. Dilarang membuat soal umum di luar konteks dokumen.
3. Hindari soal duplikat.
4. Pastikan kunci jawaban (correctAnswer) benar dan tidak ambigu.
5. Sediakan penjelasan (explanation) akademis yang logis dan konsisten dengan materi.
6. Tipe Soal: ${typeDescription}
7. Tingkat Kesulitan: ${difficultyDescriptions[config.difficulty]}
8. Bahasa: Bahasa Indonesia yang baku dan akademis.`;

    const prompt = `Berikut materi kuliah "${material.title}":\n\n${contextText}\n\nHasilkan tepat ${targetCount} soal latihan dengan tingkat kesulitan "${config.difficulty}" dan tipe "${config.type}".`;

    // Generate with primary model (gemini-3.8-flash) and fallback model (gemini-3.1-flash-lite)
    // with exponential backoff [2000, 4000, 8000] and 3 max retries
    const aiResponse = await generateWithFallback(
      async (modelName) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['multiple_choice', 'true_false'] },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING, enum: ['A', 'B', 'C', 'D'] },
                  explanation: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
                },
                required: [
                  'id',
                  'questionText',
                  'type',
                  'options',
                  'correctAnswer',
                  'explanation',
                  'topic',
                  'difficulty',
                ],
              },
            },
          },
        });
      },
      ['gemini-3.8-flash', 'gemini-3.1-flash-lite'],
      { retries: 3, delays: [2000, 4000, 8000] }
    );

    const responseText = aiResponse.text;
    if (!responseText) {
      throw new Error('Gagal menerima daftar soal dari model AI.');
    }

    const generatedQuestions: Question[] = JSON.parse(responseText);

    // Deduplication: prevent duplicate questions by questionText
    const seenTexts = new Set<string>();
    const deduplicated: Question[] = [];

    for (let idx = 0; idx < generatedQuestions.length; idx++) {
      const q = generatedQuestions[idx];
      const normalizedText = (q.questionText || '').trim().toLowerCase();
      if (!normalizedText || seenTexts.has(normalizedText)) {
        continue; // skip duplicate question
      }
      seenTexts.add(normalizedText);

      deduplicated.push({
        ...q,
        id: `q_${material.id}_${Date.now()}_${idx + 1}`,
        type: config.type,
        difficulty: config.difficulty,
      });
    }

    if (deduplicated.length === 0) {
      throw new Error('Tidak ada butir soal valid yang dapat dihasilkan dari dokumen ini.');
    }

    material.questions = deduplicated;
    db.saveMaterial(material);

    res.json({
      success: true,
      questions: deduplicated,
      message: `Berhasil mengenerate ${deduplicated.length} butir soal latihan.`,
    });
  } catch (error: unknown) {
    console.error('Question generation error:', error);
    const msg = error instanceof Error ? error.message : String(error);

    if (isTransientError(error)) {
      return res.status(503).json({
        success: false,
        isTransient: true,
        message:
          'Layanan AI sedang mengalami lonjakan permintaan (High Demand). Silakan coba beberapa saat lagi atau pilih jumlah soal yang lebih sedikit.',
      });
    }

    res.status(500).json({ success: false, message: `Gagal membuat soal: ${msg}` });
  }
});

// Evaluate Quiz Attempt
app.post('/api/quizzes/evaluate', (req, res) => {
  try {
    const userId = getUserId(req);
    const { materialId, answers, questionsSnapshot } = req.body;

    const material = db.getMaterialById(materialId, userId);
    const questions: Question[] = questionsSnapshot || material?.questions || [];

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Data soal tidak ditemukan.' });
    }

    let correctCount = 0;
    const evaluatedAnswers: QuizAttempt['answers'] = [];
    const topicPerformance: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      const userSelected = (answers[q.id] || '').trim().toUpperCase();
      const isCorrect = userSelected === q.correctAnswer.toUpperCase();
      if (isCorrect) correctCount++;

      evaluatedAnswers.push({
        questionId: q.id,
        selectedAnswer: userSelected,
        isCorrect,
      });

      const topicName = q.topic || 'Umum';
      if (!topicPerformance[topicName]) {
        topicPerformance[topicName] = { total: 0, correct: 0 };
      }
      topicPerformance[topicName].total++;
      if (isCorrect) topicPerformance[topicName].correct++;
    });

    const totalQuestions = questions.length;
    const incorrectCount = totalQuestions - correctCount;
    // Score = (Correct Answers / Total Questions) * 100
    const rawScore = (correctCount / totalQuestions) * 100;
    const score = Math.round(rawScore * 100) / 100;

    const strongTopics: string[] = [];
    const weakTopics: string[] = [];
    const studyRecommendations: string[] = [];

    Object.entries(topicPerformance).forEach(([topic, stats]) => {
      const pct = (stats.correct / stats.total) * 100;
      if (pct >= 70) {
        strongTopics.push(topic);
      } else {
        weakTopics.push(topic);
        studyRecommendations.push(
          `Pelajari kembali konsep pada materi "${topic}". Anda menjawab benar ${stats.correct} dari ${stats.total} soal.`
        );
      }
    });

    if (studyRecommendations.length === 0) {
      studyRecommendations.push(
        'Luar biasa! Penguasaan materi Anda sangat baik di semua topik. Pertahankan pemahaman ini untuk persiapan ujian.'
      );
    }

    const attempt: QuizAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      materialId,
      materialTitle: material?.title || 'Latihan Mandiri',
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      score,
      percentage: score,
      answers: evaluatedAnswers,
      questionsSnapshot: questions,
      evaluatedAt: new Date().toISOString(),
      evaluation: {
        strongTopics: strongTopics.length ? strongTopics : ['Pemahaman Dasar'],
        weakTopics,
        studyRecommendations,
      },
    };

    db.saveQuizAttempt(attempt);

    res.json({ success: true, attempt });
  } catch (error: unknown) {
    console.error('Quiz evaluation error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message: `Gagal mengevaluasi kuis: ${msg}` });
  }
});

app.get('/api/quizzes/attempts', (req, res) => {
  const userId = getUserId(req);
  const materialId = req.query.materialId as string | undefined;
  const attempts = db.getQuizAttempts(userId, materialId);
  res.json({ success: true, attempts });
});

// -------------------------------------------------------------
// COURSE CONTRACT & GRADE PREDICTOR ROUTES
// -------------------------------------------------------------
app.get('/api/contracts', (req, res) => {
  const userId = getUserId(req);
  const contracts = db.getContracts(userId);
  res.json({ success: true, contracts });
});

app.get('/api/contracts/:id', (req, res) => {
  const userId = getUserId(req);
  const contract = db.getContractById(req.params.id, userId);
  if (!contract) {
    return res.status(404).json({ success: false, message: 'Kontrak kuliah tidak ditemukan.' });
  }
  res.json({ success: true, contract });
});

app.post('/api/contracts', (req, res) => {
  const userId = getUserId(req);
  const data = req.body;

  const contract: CourseContract = {
    id: data.id || `cnt_${Date.now()}`,
    userId,
    courseName: data.courseName || 'Mata Kuliah Baru',
    courseCode: data.courseCode || 'KUL101',
    semester: data.semester || 'Semester Ganjil',
    academicYear: data.academicYear || '2026/2027',
    components: data.components || [],
    gradeBoundaries: data.gradeBoundaries || [
      { grade: 'A', minScore: 85 },
      { grade: 'AB', minScore: 80 },
      { grade: 'B', minScore: 75 },
      { grade: 'BC', minScore: 70 },
      { grade: 'C', minScore: 65 },
      { grade: 'D', minScore: 55 },
      { grade: 'E', minScore: 0 },
    ],
    targetGrade: data.targetGrade || 'A',
    customTargetScore: data.customTargetScore,
    updatedAt: new Date().toISOString(),
  };

  db.saveContract(contract);
  res.json({ success: true, contract, message: 'Kontrak kuliah berhasil disimpan.' });
});

app.delete('/api/contracts/:id', (req, res) => {
  const userId = getUserId(req);
  const success = db.deleteContract(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ success: false, message: 'Kontrak tidak ditemukan.' });
  }
  res.json({ success: true, message: 'Kontrak kuliah berhasil dihapus.' });
});

// Parse uploaded course contract document or image
app.post('/api/contracts/parse-file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Silakan pilih file kontrak kuliah (PDF, DOCX, JPG, atau PNG).',
      });
    }

    const originalName = file.originalname;
    const mimetype = file.mimetype || '';

    let extractedText = '';

    if (mimetype.startsWith('image/')) {
      // Vision OCR via Gemini with retry
      const base64Data = file.buffer.toString('base64');
      const ocrRes = await generateWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: mimetype,
                data: base64Data,
              },
            },
            'Ekstrak seluruh teks tabel komponen penilaian dan batas nilai huruf dari silabus/kontrak kuliah ini secara presisi.',
          ],
        })
      );
      extractedText = ocrRes.text || '';
    } else {
      const extraction = await extractTextFromBuffer(file.buffer, mimetype, originalName, ai);
      extractedText = extraction.text;
    }

    if (!extractedText || extractedText.length < 15) {
      return res.status(422).json({
        success: false,
        message: 'Gagal mengekstrak informasi penilaian dari dokumen yang diunggah.',
      });
    }

    // Pass to Gemini to structure into course components & boundaries
    const systemInstruction = `Anda adalah sistem pengekstraksi kontrak perkuliahan (Syllabus / Course Assessment Contract) universitas.
Tugas Anda adalah membaca teks dokumen kontrak kuliah dan mengekstrak komponen penilaian akademik serta batas nilai huruf.

PANDUAN:
1. courseName: Nama mata kuliah (misal: "Kalkulus I", "Algoritma Pemrograman").
2. courseCode: Kode mata kuliah jika ada (misal: "KOM201").
3. semester: Semester perkuliahan.
4. components: Daftar komponen evaluasi nilai beserta bobot persentasenya (angka 0-100).
   Contoh: Tugas (15), Kuis (10), Praktikum (20), UTS (25), UAS (30).
   PENTING: Usahakan total bobot berjumlah tepat 100 jika dokumen menyediakannya.
5. gradeBoundaries: Ambang batas minimum nilai untuk setiap predikat huruf:
   Default standar IPB/Nasional:
   A >= 85, AB >= 80, B >= 75, BC >= 70, C >= 65, D >= 55, E >= 0.
   Jika di dokumen tertulis batas spesifik, gunakan batas dari dokumen.`;

    const aiResponse = await generateWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Berikut isi dokumen kontrak kuliah:\n\n${extractedText.slice(0, 15000)}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              courseName: { type: Type.STRING },
              courseCode: { type: Type.STRING },
              semester: { type: Type.STRING },
              academicYear: { type: Type.STRING },
              components: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                  },
                  required: ['name', 'weight'],
                },
              },
              gradeBoundaries: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    grade: { type: Type.STRING },
                    minScore: { type: Type.NUMBER },
                  },
                  required: ['grade', 'minScore'],
                },
              },
            },
            required: ['courseName', 'components', 'gradeBoundaries'],
          },
        },
      })
    );

    const parsedJson = JSON.parse(aiResponse.text || '{}');

    // Format components with initial progressive state (all un-graded by default so student enters them)
    const formattedComponents = (parsedJson.components || []).map((c: { name: string; weight: number }, idx: number) => ({
      id: `c_${idx + 1}`,
      name: c.name,
      weight: Number(c.weight) || 0,
      isGraded: false,
      score: null,
    }));

    res.json({
      success: true,
      extractedData: {
        courseName: parsedJson.courseName || 'Mata Kuliah',
        courseCode: parsedJson.courseCode || '',
        semester: parsedJson.semester || 'Semester Ganjil',
        academicYear: parsedJson.academicYear || '2026/2027',
        components: formattedComponents,
        gradeBoundaries: parsedJson.gradeBoundaries || [
          { grade: 'A', minScore: 85 },
          { grade: 'AB', minScore: 80 },
          { grade: 'B', minScore: 75 },
          { grade: 'BC', minScore: 70 },
          { grade: 'C', minScore: 65 },
          { grade: 'D', minScore: 55 },
          { grade: 'E', minScore: 0 },
        ],
      },
      message: 'Kontrak kuliah berhasil diekstrak! Silakan tinjau dan konfirmasi pada tabel di bawah sebelum digunakan.',
    });
  } catch (error: unknown) {
    console.error('Contract parse error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, message: `Gagal membaca kontrak: ${msg}` });
  }
});

// Reset sample contracts
app.post('/api/contracts/reset-sample', (req, res) => {
  const userId = getUserId(req);
  db.resetToDefault(userId);
  const contracts = db.getContracts(userId);
  res.json({ success: true, contracts, message: 'Contoh kontrak kuliah IPB berhasil dimuat ulang.' });
});

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC SERVE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start StudyFlow server:', err);
  process.exit(1);
});
