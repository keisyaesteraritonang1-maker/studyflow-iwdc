import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { createRequire } from 'module';
import { generateWithRetry } from './aiUtils.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export interface ExtractionResult {
  text: string;
  charCount: number;
  wordCount: number;
  pageCount?: number;
  extractionMethod: string;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimetype: string,
  filename: string,
  ai?: GoogleGenAI
): Promise<ExtractionResult> {
  const lowerName = filename.toLowerCase();

  // 1. Plain Text or Markdown
  if (
    mimetype.includes('text/') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.csv')
  ) {
    const text = buffer.toString('utf-8').trim();
    if (!text) {
      throw new Error('Dokumen teks kosong (tidak ada konten karakter).');
    }
    const words = text.split(/\s+/).filter(Boolean).length;
    return {
      text,
      charCount: text.length,
      wordCount: words,
      extractionMethod: 'plain-text',
    };
  }

  // 2. DOCX Document
  if (
    mimetype.includes('wordprocessingml') ||
    mimetype.includes('msword') ||
    lowerName.endsWith('.docx')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const rawText = (result.value || '').trim();
      if (!rawText) {
        throw new Error('Dokumen DOCX tidak memiliki teks atau tidak terbaca.');
      }
      const words = rawText.split(/\s+/).filter(Boolean).length;
      return {
        text: rawText,
        charCount: rawText.length,
        wordCount: words,
        extractionMethod: 'mammoth-docx',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal membaca dokumen DOCX: ${msg}`);
    }
  }

  // 3. PPTX Presentation
  if (
    mimetype.includes('presentationml') ||
    mimetype.includes('powerpoint') ||
    lowerName.endsWith('.pptx')
  ) {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const slideKeys = Object.keys(zip.files).filter((key) =>
        /^ppt\/slides\/slide\d+\.xml$/.test(key)
      );

      if (slideKeys.length === 0) {
        throw new Error('Tidak ditemukan slide presentasi pada file PPTX ini.');
      }

      // Sort slides in order: slide1.xml, slide2.xml, etc.
      slideKeys.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
        return numA - numB;
      });

      let extracted = '';
      for (let i = 0; i < slideKeys.length; i++) {
        const slideKey = slideKeys[i];
        const xml = await zip.files[slideKey].async('string');
        // Match all XML text tags: <a:t>...</a:t>
        const matches = xml.match(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g);
        if (matches) {
          const lines = matches
            .map((m) => m.replace(/<[^>]+>/g, '').trim())
            .filter(Boolean);
          if (lines.length > 0) {
            extracted += `[Slide ${i + 1}]\n` + lines.join('\n') + '\n\n';
          }
        }
      }

      extracted = extracted.trim();
      if (!extracted) {
        throw new Error('File presentasi PPTX tidak mengandung teks yang dapat diekstrak.');
      }

      const words = extracted.split(/\s+/).filter(Boolean).length;
      return {
        text: extracted,
        charCount: extracted.length,
        wordCount: words,
        pageCount: slideKeys.length,
        extractionMethod: 'jszip-pptx',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal membaca presentasi PPTX: ${msg}`);
    }
  }

  // 4. PDF Document
  if (mimetype === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const res = await parser.getText();
      let text = (res?.text || '').trim();

      // Clean up common PDF-parse artifact markers
      text = text.replace(/-- \d+ of \d+ --/g, '').trim();

      // If text extraction yielded almost nothing, it might be a scanned PDF
      if (text.length < 50 && ai) {
        // OCR via Gemini multimodal with retry
        try {
          const base64Data = buffer.toString('base64');
          const geminiRes = await generateWithRetry(() =>
            ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data,
                  },
                },
                'Ekstrak seluruh teks materi akademik dan perkuliahan yang ada di dalam dokumen PDF ini secara lengkap, runtut, dan akurat dalam bahasa aslinya tanpa memotong bagian penting.',
              ],
            })
          );
          const ocrText = (geminiRes.text || '').trim();
          if (ocrText.length > 50) {
            text = ocrText;
          }
        } catch {
          // If OCR failed, fall back to whatever text we got
        }
      }

      if (!text || text.length < 20) {
        throw new Error(
          'Dokumen PDF tidak memiliki teks yang terbaca. Pastikan dokumen bukan file rusak atau scan kosong.'
        );
      }

      const words = text.split(/\s+/).filter(Boolean).length;
      return {
        text,
        charCount: text.length,
        wordCount: words,
        pageCount: res?.total || 1,
        extractionMethod: 'pdf-parse',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal membaca dokumen PDF: ${msg}`);
    }
  }

  // 5. Image OCR (JPG, PNG) - for course contracts
  if (mimetype.startsWith('image/') || lowerName.match(/\.(jpg|jpeg|png|webp)$/)) {
    if (!ai) {
      throw new Error('Layanan AI diperlukan untuk membaca teks gambar.');
    }
    try {
      const base64Data = buffer.toString('base64');
      const validMime = mimetype.startsWith('image/') ? mimetype : 'image/jpeg';
      const geminiRes = await generateWithRetry(() =>
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: validMime,
                data: base64Data,
              },
            },
            'Ekstrak seluruh teks dari gambar silabus / kontrak perkuliahan / dokumen akademik ini secara lengkap dan terstruktur.',
          ],
        })
      );

      const extracted = (geminiRes.text || '').trim();
      if (!extracted || extracted.length < 15) {
        throw new Error('Gambar tidak terbaca atau tidak mengandung teks yang cukup.');
      }

      const words = extracted.split(/\s+/).filter(Boolean).length;
      return {
        text: extracted,
        charCount: extracted.length,
        wordCount: words,
        extractionMethod: 'gemini-vision-ocr',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal melakukan OCR pada gambar: ${msg}`);
    }
  }

  throw new Error(`Format file tidak didukung: ${mimetype || filename}. Gunakan PDF, PPTX, DOCX, TXT, atau gambar JPG/PNG.`);
}
