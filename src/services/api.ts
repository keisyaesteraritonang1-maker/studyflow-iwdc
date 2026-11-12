import {
  CourseContract,
  LectureMaterial,
  Question,
  QuestionConfig,
  QuizAttempt,
  SummarySection,
  UserProfile,
} from '../types';

const API_BASE = '/api';

// Stored user ID key
const USER_KEY = 'studyflow_user_id';

export function getStoredUserId(): string {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = 'usr_ipb_demo';
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

export function setStoredUserId(id: string) {
  localStorage.setItem(USER_KEY, id);
}

function getHeaders(isFormData = false): HeadersInit {
  const headers: Record<string, string> = {
    'x-user-id': getStoredUserId(),
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.user;
  },

  async login(user: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.user?.id) {
      setStoredUserId(data.user.id);
    }
    return data.user;
  },

  // Materials (Smart Practice)
  async getMaterials(): Promise<LectureMaterial[]> {
    const res = await fetch(`${API_BASE}/materials`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.materials || [];
  },

  async getMaterial(id: string): Promise<LectureMaterial> {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Materi tidak ditemukan');
    return data.material;
  },

  async uploadMaterial(file: File): Promise<{ material: LectureMaterial; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/materials/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Gagal mengunggah dan mengekstrak dokumen.');
    }
    return { material: data.material, message: data.message };
  },

  async deleteMaterial(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gagal menghapus materi.');
  },

  async resetSampleMaterials(): Promise<LectureMaterial[]> {
    const res = await fetch(`${API_BASE}/materials/reset-sample`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.materials || [];
  },

  async generateSummary(materialId: string): Promise<SummarySection> {
    const res = await fetch(`${API_BASE}/materials/${materialId}/summarize`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gagal membuat rangkuman AI.');
    return data.summary;
  },

  async generateQuestions(
    materialId: string,
    config: QuestionConfig,
    onRetryStatus?: (status: {
      attempt: number;
      maxRetries: number;
      delaySeconds: number;
      message: string;
    }) => void
  ): Promise<Question[]> {
    const maxRetries = 3;
    const delays = [2000, 4000, 8000];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/materials/${materialId}/questions`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(config),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 503 || res.status === 429 || data?.isTransient) {
          if (attempt < maxRetries) {
            const delayMs = delays[attempt] || 8000;
            const delaySec = Math.round(delayMs / 1000);
            if (onRetryStatus) {
              onRetryStatus({
                attempt: attempt + 1,
                maxRetries,
                delaySeconds: delaySec,
                message: `Server AI sedang mengalami high demand. Mencoba ulang (Percobaan ${attempt + 1}/${maxRetries} dalam ${delaySec}s)...`,
              });
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          } else {
            throw new Error(
              data.message ||
                'Layanan AI sedang mengalami lonjakan permintaan (High Demand). Silakan coba beberapa saat lagi atau pilih jumlah soal yang lebih sedikit.'
            );
          }
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal membuat butir latihan soal.');
        }

        return data.questions || [];
      } catch (err: unknown) {
        if (attempt < maxRetries) {
          const delayMs = delays[attempt] || 8000;
          const delaySec = Math.round(delayMs / 1000);
          if (onRetryStatus) {
            onRetryStatus({
              attempt: attempt + 1,
              maxRetries,
              delaySeconds: delaySec,
              message: `Jaringan sedang sibuk. Mencoba ulang (Percobaan ${attempt + 1}/${maxRetries} dalam ${delaySec}s)...`,
            });
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('demand') ||
          msg.includes('Failed to fetch') ||
          msg.includes('NetworkError')
        ) {
          throw new Error(
            'Layanan AI sedang mengalami lonjakan permintaan (High Demand). Silakan coba beberapa saat lagi atau pilih jumlah soal yang lebih sedikit.'
          );
        }
        throw new Error(msg || 'Gagal membuat butir latihan soal.');
      }
    }

    throw new Error(
      'Layanan AI sedang mengalami lonjakan permintaan (High Demand). Silakan coba beberapa saat lagi atau pilih jumlah soal yang lebih sedikit.'
    );
  },

  // Quizzes
  async evaluateQuiz(
    materialId: string,
    answers: Record<string, string>,
    questionsSnapshot: Question[]
  ): Promise<QuizAttempt> {
    const res = await fetch(`${API_BASE}/quizzes/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ materialId, answers, questionsSnapshot }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gagal mengevaluasi kuis.');
    return data.attempt;
  },

  async getQuizAttempts(materialId?: string): Promise<QuizAttempt[]> {
    const url = materialId
      ? `${API_BASE}/quizzes/attempts?materialId=${encodeURIComponent(materialId)}`
      : `${API_BASE}/quizzes/attempts`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.attempts || [];
  },

  // Contracts (Grade Predictor)
  async getContracts(): Promise<CourseContract[]> {
    const res = await fetch(`${API_BASE}/contracts`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.contracts || [];
  },

  async saveContract(contract: Partial<CourseContract>): Promise<CourseContract> {
    const res = await fetch(`${API_BASE}/contracts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contract),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gagal menyimpan kontrak kuliah.');
    return data.contract;
  },

  async deleteContract(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/contracts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gagal menghapus kontrak.');
  },

  async parseContractFile(file: File): Promise<{
    extractedData: Omit<CourseContract, 'id' | 'userId' | 'updatedAt'>;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/contracts/parse-file`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Gagal membaca dan mengekstrak kontrak kuliah.');
    }
    return { extractedData: data.extractedData, message: data.message };
  },

  async resetSampleContracts(): Promise<CourseContract[]> {
    const res = await fetch(`${API_BASE}/contracts/reset-sample`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.contracts || [];
  },
};
