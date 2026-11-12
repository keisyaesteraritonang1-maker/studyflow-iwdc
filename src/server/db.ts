import fs from 'fs';
import path from 'path';
import { CourseContract, LectureMaterial, QuizAttempt, UserProfile } from '../types';

interface DatabaseSchema {
  users: UserProfile[];
  materials: LectureMaterial[];
  quizAttempts: QuizAttempt[];
  contracts: CourseContract[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const DEFAULT_USER: UserProfile = {
  id: 'usr_ipb_demo',
  name: 'Keisya Ester Aritonang',
  email: 'keisyaesteraritonang1@gmail.com',
  university: 'IPB University (Institut Pertanian Bogor)',
  faculty: 'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)',
  major: 'Ilmu Komputer',
  studentId: 'G64220088',
};

// Initial realistic IPB materials
const SAMPLE_MATERIALS: LectureMaterial[] = [
  {
    id: 'mat_kom201_python',
    userId: 'usr_ipb_demo',
    title: 'KOM201 - Konsep Algoritma & Struktur Data Dasar (IPB FMIPA)',
    fileName: 'KOM201_Pertemuan_03_Algoritma_Python.pdf',
    fileSize: 345020,
    fileType: 'application/pdf',
    charCount: 4210,
    wordCount: 680,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    extractedText: `DEPARTEMEN ILMU KOMPUTER FMIPA IPB UNIVERSITY
Mata Kuliah: Algoritma dan Struktur Data (KOM201)
Modul 03: Konsep Dasar Algoritma, Notasi Asimtotik, dan Struktur Kontrol Python

1. PENGANTAR ALGORITMA
Algoritma adalah urutan langkah logis dan sistematis yang terdefinisi dengan jelas untuk menyelesaikan suatu masalah komputasi dalam jumlah langkah terhingga. Sifat utama algoritma yang baik:
- Finiteness: Berakhir setelah sejumlah langkah terbatas.
- Definiteness: Setiap langkah tidak ambigu dan memiliki interpretasi tunggal.
- Input & Output: Menerima nol atau lebih masukan serta menghasilkan minimal satu keluaran yang valid.
- Effectiveness: Setiap instruksi dapat dieksekusi secara nyata dalam waktu wajar.

2. NOTASI ASIMTOTIK & KOMPLEKSITAS WAKTU
Efisiensi algoritma diukur menggunakan Big-O Notation yang menggambarkan batas atas (upper bound) laju pertumbuhan waktu eksekusi terhadap ukuran masukan (n):
- O(1) - Waktu Konstan: Akses elemen array berdasarkan indeks.
- O(log n) - Waktu Logaritmik: Pencarian biner (Binary Search) pada data terurut.
- O(n) - Waktu Linier: Pencarian sekuensial (Linear Search) dan traversal elemen list.
- O(n log n) - Log-linier: Algoritma pengurutan efisien seperti Merge Sort dan Quick Sort rata-rata.
- O(n^2) - Waktu Kuadratik: Nested loop seperti Bubble Sort dan Insertion Sort.

3. STRUKTUR DATA ARRAY DAN LIST PYTHON
Di Python, list bersifat dinamis dan heterogen. Operasi append() memiliki kompleksitas amortized O(1), sedangkan penyisipan di awal atau tengah list (insert) memerlukan O(n) karena perlu pergeseran memori. Tuple bersifat immutable sehingga aman dari modifikasi tak disengaja dan membutuhkan memori lebih efisien. Dictionary dan Set diimplementasikan menggunakan hash table dengan waktu pencarian rata-rata O(1).

4. STRUKTUR KONTROL DAN REKURSI
Rekursi adalah teknik di mana fungsi memanggil dirinya sendiri untuk menyelesaikan sub-masalah yang lebih kecil. Syarat mutlak fungsi rekursif adalah memiliki Base Case (kondisi berhenti) agar tidak terjadi recursion depth limit atau stack overflow, serta Recursive Step yang mengarah menuju base case. Contoh klasik: faktorial dan deret Fibonacci. Rekursi tanpa memorisasi pada Fibonacci menghasilkan kompleksitas eksponensial O(2^n).

5. KESIMPULAN
Pemilihan algoritma dan struktur data yang tepat sangat menentukan skalabilitas sistem perangkat lunak. Mahasiswa Ilmu Komputer IPB diharapkan mampu menganalisis trade-off antara efisiensi waktu (time complexity) dan efisiensi ruang (space complexity).`,
    summary: {
      overview: 'Modul perkuliahan KOM201 Departemen Ilmu Komputer FMIPA IPB membahas fondasi esensial algoritma pemrograman, analisis efisiensi komputasi melalui notasi Big-O, perbandingan struktur data list/tuple/dictionary di Python, serta prinsip rekursi.',
      mainConcepts: [
        'Definisi dan empat karakteristik mutlak algoritma: finiteness, definiteness, input/output, dan effectiveness.',
        'Notasi asimtotik Big-O sebagai standar pengukuran kompleksitas waktu (time complexity) terhadap ukuran input n.',
        'Perbedaan karakteristik struktur data statis vs dinamis pada Python (List, Tuple, Dictionary, Set).',
        'Mekanisme fungsi rekursif yang membutuhkan Base Case dan Recursive Step untuk mencegah stack overflow.',
      ],
      importantDefinitions: [
        { term: 'Algoritma', definition: 'Urutan langkah logis dan sistematis yang terdefinisi dengan jelas untuk menyelesaikan suatu masalah komputasi dalam jumlah langkah terhingga.' },
        { term: 'Big-O Notation', definition: 'Representasi matematika untuk mendeskripsikan batas atas (upper bound) pertumbuhan waktu eksekusi algoritma saat ukuran input (n) mendekati tak hingga.' },
        { term: 'Base Case', definition: 'Kondisi terminasi pada fungsi rekursif yang menghentikan pemanggilan fungsi lebih lanjut dan mengembalikan nilai dasar.' },
        { term: 'Immutable', definition: 'Karakteristik objek data (seperti tuple pada Python) yang nilainya tidak dapat diubah setelah dibuat.' },
      ],
      subchapters: [
        { title: 'Sub-bab 1: Karakteristik Algoritma Komputasi', explanation: 'Menjelaskan empat syarat utama algoritma komputasi yang valid dan efektif dalam rekayasa perangkat lunak.' },
        { title: 'Sub-bab 2: Klasifikasi Notasi Asimtotik', explanation: 'Menguraikan hierarki efisiensi komputasi mulai dari O(1), O(log n), O(n), O(n log n), hingga O(n^2).' },
        { title: 'Sub-bab 3: Karakteristik Struktur Data Python', explanation: 'Analisis kompleksitas operasi pada List (O(1) append vs O(n) insert) dan pemanfaatan Hash Table pada Dictionary.' },
        { title: 'Sub-bab 4: Paradigma Rekursi dan Base Case', explanation: 'Prinsip divide-and-conquer pada rekursi dan bahaya pertumbuhan eksponensial tanpa teknik memorisasi.' },
      ],
      terminology: [
        { term: 'Time Complexity', meaning: 'Perkiraan jumlah waktu komputasi yang dibutuhkan algoritma sebagai fungsi dari ukuran input.' },
        { term: 'Space Complexity', meaning: 'Jumlah memori kerja tambahan yang dibutuhkan algoritma selama eksekusi.' },
        { term: 'Amortized O(1)', meaning: 'Biaya rata-rata per operasi pada rangkaian operasi berulang, meskipun operasi tertentu sesekali membutuhkan waktu O(n).' },
        { term: 'Stack Overflow', meaning: 'Kondisi error saat alokasi memori call stack habis akibat pemanggilan rekursif tanpa henti.' },
      ],
      keyPoints: [
        'Binary search hanya dapat diterapkan pada koleksi data yang sudah terurut dengan kompleksitas O(log n).',
        'Penyisipan elemen pada indeks awal list Python memakan biaya O(n) akibat realokasi pergeseran pointer.',
        'Dictionary Python menyediakan akses kunci-nilai dengan waktu rata-rata O(1) berkat algoritma hashing.',
        'Setiap fungsi rekursif wajib memiliki base case eksplisit.',
      ],
      finalConclusion: 'Penguasaan analisis algoritma dan struktur data merupakan pilar utama komputasi di IPB University. Mengembangkan kode yang benar secara fungsional harus dibarengi dengan efisiensi asimtotik agar dapat menangani skala data modern.'
    },
    questions: [
      {
        id: 'q1',
        questionText: 'Manakah karakteristik algoritma yang mensyaratkan bahwa setiap instruksi harus berakhir setelah sejumlah langkah terbatas?',
        type: 'multiple_choice',
        options: ['A. Effectiveness', 'B. Finiteness', 'C. Definiteness', 'D. Inputness'],
        correctAnswer: 'B',
        explanation: 'Finiteness berarti algoritma harus berakhir dan berhenti setelah melalui sejumlah langkah terhingga (finite steps).',
        topic: 'Karakteristik Algoritma',
        difficulty: 'easy'
      },
      {
        id: 'q2',
        questionText: 'Berapakah kompleksitas waktu algoritma pencarian biner (Binary Search) pada kumpulan data yang telah terurut?',
        type: 'multiple_choice',
        options: ['A. O(1)', 'B. O(n)', 'C. O(log n)', 'D. O(n^2)'],
        correctAnswer: 'C',
        explanation: 'Pencarian biner membagi ruang pencarian menjadi setengah pada setiap langkah, sehingga memiliki kompleksitas waktu O(log n).',
        topic: 'Notasi Asimtotik',
        difficulty: 'medium'
      },
      {
        id: 'q3',
        questionText: 'Operasi penyisipan elemen di awal list Python (insert di indeks 0) memiliki kompleksitas waktu O(n) karena membutuhkan pergeseran seluruh elemen memori ke kanan.',
        type: 'true_false',
        options: ['A. Benar', 'B. Salah'],
        correctAnswer: 'A',
        explanation: 'Benar. List di Python diimplementasikan sebagai dynamic array, sehingga menyisipkan data di posisi indeks 0 mengharuskan pergeseran seluruh elemen yang ada satu posisi ke kanan (O(n)).',
        topic: 'Struktur Data Python',
        difficulty: 'medium'
      },
      {
        id: 'q4',
        questionText: 'Apa yang akan terjadi jika sebuah fungsi rekursif dieksekusi tanpa memiliki Base Case yang valid?',
        type: 'multiple_choice',
        options: ['A. Nilai keluaran otomatis bernilai 0', 'B. Terjadi RecursionError atau Stack Overflow', 'C. Waktu eksekusi menjadi O(1)', 'D. Program beralih menjadi iterasi otomatis'],
        correctAnswer: 'B',
        explanation: 'Fungsi rekursif tanpa base case akan terus memanggil dirinya sendiri tanpa henti hingga melampaui batas kedalaman tumpukan memori (call stack) dan memicu Stack Overflow / RecursionError.',
        topic: 'Rekursi',
        difficulty: 'easy'
      },
      {
        id: 'q5',
        questionText: 'Pada struktur data Dictionary di Python, operasi pencarian nilai berdasarkan kuncinya (key lookup) pada kondisi rata-rata memiliki kompleksitas O(1) berkat implementasi Hash Table.',
        type: 'true_false',
        options: ['A. Benar', 'B. Salah'],
        correctAnswer: 'A',
        explanation: 'Benar. Dictionary di Python menggunakan hash table yang memetakan hash key ke bucket memori secara langsung, sehingga pencarian rata-rata bernilai konstan O(1).',
        topic: 'Struktur Data Python',
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'mat_bio100_metabolisme',
    userId: 'usr_ipb_demo',
    title: 'BIO100 - Biologi Sel dan Respirasi Seluler (IPB Biologi)',
    fileName: 'BIO100_Pertemuan_05_Respirasi_Sel.docx',
    fileSize: 289400,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    charCount: 3820,
    wordCount: 590,
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    extractedText: `DEPARTEMEN BIOLOGI FMIPA IPB UNIVERSITY
Mata Kuliah: Biologi Umum (BIO100)
Materi: Struktur Sel, Enzim, dan Jalur Respirasi Seluler Aerob

1. STRUKTUR SEL PROKARIOTIK VS EUKARIOTIK
Sel adalah unit struktural dan fungsional terkecil dari makhluk hidup. Sel terbagi menjadi dua golongan besar:
- Prokariotik: Tidak memiliki membran inti (nukleus sejati) dan organel bermembran. Materi genetik terkonsentrasi di nukleoid. Contoh: Bakteri dan Archaea.
- Eukariotik: Memiliki nukleus bermembran ganda yang membungkus kromosom, serta kompartemen organel seperti mitokondria, retikulum endoplasma, dan badan Golgi. Contoh: Tumbuhan, hewan, dan fungi.

2. MEKANISME KERJA ENZIM
Enzim adalah biokatalisator protein yang mempercepat laju reaksi biokimia spesifik dengan cara menurunkan energi aktivasi (Ea) tanpa mengalami perubahan permanen pada akhir reaksi.
- Sisi aktif enzim mengikat substrat spesifik membentuk kompleks enzim-substrat (teori Induced Fit).
- Faktor pembatas: Suhu, pH, konsentrasi substrat, dan keberadaan inhibitor kompetitif atau non-kompetitif.

3. TAHAPAN RESPIRASI SELULER AEROB
Respirasi seluler aerob mengubah satu molekul glukosa (C6H12O6) dan 6O2 menjadi 6CO2, 6H2O, dan energi ATP melalui 4 tahap utama:
a. Glikolisis:
   - Terjadi di sitoplasma sel.
   - Mengubah 1 glukosa (6C) menjadi 2 asam piruvat (3C).
   - Menghasilkan 2 ATP (net) dan 2 NADH. Tidak memerlukan oksigen.
b. Dekarboksilasi Oksidatif:
   - Terjadi di matriks mitokondria.
   - Mengubah 2 asam piruvat menjadi 2 Asetil Ko-A (2C) dan 2 CO2, menghasilkan 2 NADH.
c. Siklus Krebs (Siklus Asam Sitrat):
   - Terjadi di matriks mitokondria.
   - Menghasilkan 2 ATP, 6 NADH, 2 FADH2, dan melepaskan 4 CO2 per molekul glukosa awal.
d. Rantai Transpor Elektron & Kemiosmosis:
   - Terjadi di krista (membran dalam) mitokondria.
   - Menggunakan gradien proton (H+) yang dipompa oleh kompleks protein untuk menggerakkan enzim ATP Sintase.
   - Akseptor elektron terakhir adalah Oksigen (O2) yang direduksi menjadi H2O.
   - Menghasilkan sekitar 26-28 ATP, sehingga total ATP per glukosa sekitar 30-32 ATP.

4. KESIMPULAN
Respirasi aerob sangat efisien dalam mengekstraksi energi kimia makanan menjadi mata uang energi universal (ATP) yang menopang seluruh kerja biosintesis sel.`,
  }
];

// Realistic IPB course assessment contracts
const SAMPLE_CONTRACTS: CourseContract[] = [
  {
    id: 'cnt_kom201',
    userId: 'usr_ipb_demo',
    courseName: 'Algoritma dan Struktur Data',
    courseCode: 'KOM201',
    semester: 'Semester 3 (Ganjil)',
    academicYear: '2026/2027',
    components: [
      { id: 'c1', name: 'Presensi & Keaktifan Kuliah', weight: 10, isGraded: true, score: 95 },
      { id: 'c2', name: 'Tugas Pemrograman Mandiri', weight: 15, isGraded: true, score: 88 },
      { id: 'c3', name: 'Kuis Teori Mingguan', weight: 10, isGraded: true, score: 82 },
      { id: 'c4', name: 'Praktikum & Responsi Laboratorium', weight: 20, isGraded: false, score: null },
      { id: 'c5', name: 'Ujian Tengah Semester (UTS)', weight: 20, isGraded: true, score: 80 },
      { id: 'c6', name: 'Ujian Akhir Semester (UAS)', weight: 25, isGraded: false, score: null },
    ],
    gradeBoundaries: [
      { grade: 'A', minScore: 85 },
      { grade: 'AB', minScore: 80 },
      { grade: 'B', minScore: 75 },
      { grade: 'BC', minScore: 70 },
      { grade: 'C', minScore: 65 },
      { grade: 'D', minScore: 55 },
      { grade: 'E', minScore: 0 },
    ],
    targetGrade: 'A',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cnt_mat101',
    userId: 'usr_ipb_demo',
    courseName: 'Kalkulus I',
    courseCode: 'MAT101',
    semester: 'Semester 1 (Ganjil)',
    academicYear: '2026/2027',
    components: [
      { id: 'm1', name: 'Presensi & Kehadiran', weight: 10, isGraded: true, score: 100 },
      { id: 'm2', name: 'Tugas Mingguan (Problem Sets)', weight: 15, isGraded: true, score: 85 },
      { id: 'm3', name: 'Kuis Terjadwal', weight: 15, isGraded: true, score: 78 },
      { id: 'm4', name: 'Ujian Tengah Semester (UTS)', weight: 30, isGraded: true, score: 80 },
      { id: 'm5', name: 'Ujian Akhir Semester (UAS)', weight: 30, isGraded: false, score: null },
    ],
    gradeBoundaries: [
      { grade: 'A', minScore: 85 },
      { grade: 'AB', minScore: 80 },
      { grade: 'B', minScore: 75 },
      { grade: 'BC', minScore: 70 },
      { grade: 'C', minScore: 65 },
      { grade: 'D', minScore: 55 },
      { grade: 'E', minScore: 0 },
    ],
    targetGrade: 'A',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cnt_agb101',
    userId: 'usr_ipb_demo',
    courseName: 'Pengantar Manajemen Agribisnis',
    courseCode: 'AGB101',
    semester: 'Semester 2 (Genap)',
    academicYear: '2026/2027',
    components: [
      { id: 'a1', name: 'Partisipasi Diskusi Kelas', weight: 10, isGraded: true, score: 90 },
      { id: 'a2', name: 'Tugas Kelompok & Analisis Kasus', weight: 20, isGraded: false, score: null },
      { id: 'a3', name: 'Presentasi Proyek Rantai Pasok', weight: 10, isGraded: false, score: null },
      { id: 'a4', name: 'Ujian Tengah Semester (UTS)', weight: 30, isGraded: true, score: 76 },
      { id: 'a5', name: 'Ujian Akhir Semester (UAS)', weight: 30, isGraded: false, score: null },
    ],
    gradeBoundaries: [
      { grade: 'A', minScore: 85 },
      { grade: 'AB', minScore: 80 },
      { grade: 'B', minScore: 75 },
      { grade: 'BC', minScore: 70 },
      { grade: 'C', minScore: 65 },
      { grade: 'D', minScore: 55 },
      { grade: 'E', minScore: 0 },
    ],
    targetGrade: 'AB',
    updatedAt: new Date().toISOString(),
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [DEFAULT_USER],
          materials: parsed.materials?.length ? parsed.materials : SAMPLE_MATERIALS,
          quizAttempts: parsed.quizAttempts || [],
          contracts: parsed.contracts?.length ? parsed.contracts : SAMPLE_CONTRACTS,
        };
      }
    } catch (e) {
      console.warn('Error reading db.json, using defaults:', e);
    }

    const initial: DatabaseSchema = {
      users: [DEFAULT_USER],
      materials: SAMPLE_MATERIALS,
      quizAttempts: [],
      contracts: SAMPLE_CONTRACTS,
    };
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json:', e);
    }
  }

  getUser(id: string): UserProfile {
    const user = this.data.users.find(u => u.id === id);
    return user || DEFAULT_USER;
  }

  saveUser(user: UserProfile) {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      this.data.users.push(user);
    }
    this.saveDatabase();
  }

  // Materials
  getMaterials(userId: string): LectureMaterial[] {
    return this.data.materials.filter(m => m.userId === userId);
  }

  getMaterialById(id: string, userId: string): LectureMaterial | undefined {
    return this.data.materials.find(m => m.id === id && m.userId === userId);
  }

  saveMaterial(material: LectureMaterial): LectureMaterial {
    const idx = this.data.materials.findIndex(m => m.id === material.id);
    if (idx >= 0) {
      this.data.materials[idx] = material;
    } else {
      this.data.materials.unshift(material);
    }
    this.saveDatabase();
    return material;
  }

  deleteMaterial(id: string, userId: string): boolean {
    const initialLen = this.data.materials.length;
    this.data.materials = this.data.materials.filter(m => !(m.id === id && m.userId === userId));
    // also remove associated quiz attempts
    this.data.quizAttempts = this.data.quizAttempts.filter(q => q.materialId !== id);
    this.saveDatabase();
    return this.data.materials.length < initialLen;
  }

  // Quiz Attempts
  getQuizAttempts(userId: string, materialId?: string): QuizAttempt[] {
    return this.data.quizAttempts.filter(q => q.userId === userId && (!materialId || q.materialId === materialId));
  }

  saveQuizAttempt(attempt: QuizAttempt): QuizAttempt {
    this.data.quizAttempts.unshift(attempt);
    this.saveDatabase();
    return attempt;
  }

  // Course Contracts
  getContracts(userId: string): CourseContract[] {
    return this.data.contracts.filter(c => c.userId === userId);
  }

  getContractById(id: string, userId: string): CourseContract | undefined {
    return this.data.contracts.find(c => c.id === id && c.userId === userId);
  }

  saveContract(contract: CourseContract): CourseContract {
    const idx = this.data.contracts.findIndex(c => c.id === contract.id);
    if (idx >= 0) {
      this.data.contracts[idx] = contract;
    } else {
      this.data.contracts.unshift(contract);
    }
    this.saveDatabase();
    return contract;
  }

  deleteContract(id: string, userId: string): boolean {
    const initialLen = this.data.contracts.length;
    this.data.contracts = this.data.contracts.filter(c => !(c.id === id && c.userId === userId));
    this.saveDatabase();
    return this.data.contracts.length < initialLen;
  }

  resetToDefault(userId: string) {
    this.data.materials = SAMPLE_MATERIALS.map(m => ({ ...m, userId }));
    this.data.contracts = SAMPLE_CONTRACTS.map(c => ({ ...c, userId }));
    this.data.quizAttempts = [];
    this.saveDatabase();
  }
}

export const db = new DatabaseManager();
