import { FormData, Student, Receipt } from '../types';
import { saveStudents, saveReceipts, loadStudents, loadReceipts } from '../services/database';

const KEYS = {
  FORM_DRAFT: 'mentoria_form_draft',
  AUTH: 'mentoria_auth',
  ROLE: 'mentoria_role',
  LAST_ACTIVITY: 'mentoria_last_activity',
};

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/* ---------- Form Draft (localStorage) ---------- */

export function getFormDraft(): FormData | null {
  try {
    const data = localStorage.getItem(KEYS.FORM_DRAFT);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setFormDraft(data: FormData): void {
  localStorage.setItem(KEYS.FORM_DRAFT, JSON.stringify(data));
}

export function clearFormDraft(): void {
  localStorage.removeItem(KEYS.FORM_DRAFT);
}

/* ---------- Auth (localStorage) ---------- */

export type UserRole = 'admin' | 'viewer';

export function isMentorAuthenticated(): boolean {
  const auth = localStorage.getItem(KEYS.AUTH) === 'true';
  if (!auth) return false;
  const last = Number(localStorage.getItem(KEYS.LAST_ACTIVITY));
  if (last && Date.now() - last > SESSION_TIMEOUT_MS) {
    clearAuth();
    return false;
  }
  return true;
}

export function getUserRole(): UserRole | null {
  return localStorage.getItem(KEYS.ROLE) as UserRole | null;
}

export function isMentorViewer(): boolean {
  return getUserRole() === 'viewer';
}

export function isMentorAdmin(): boolean {
  return getUserRole() === 'admin';
}

export function setMentorAuth(value: boolean, role?: UserRole): void {
  localStorage.setItem(KEYS.AUTH, value ? 'true' : '');
  if (value && role) {
    localStorage.setItem(KEYS.ROLE, role);
    updateLastActivity();
  } else if (!value) {
    clearAuth();
  }
}

export function updateLastActivity(): void {
  localStorage.setItem(KEYS.LAST_ACTIVITY, String(Date.now()));
}

function clearAuth(): void {
  localStorage.removeItem(KEYS.AUTH);
  localStorage.removeItem(KEYS.ROLE);
  localStorage.removeItem(KEYS.LAST_ACTIVITY);
}

/* ---------- Seed ---------- */

const SAMPLE_RECEIPT_IMG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTdlZiIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNDc1NTY5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSBDb21wcm92YW50ZSBQSVggwqk8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmVmOiBQSVgtMDAxPC90ZXh0Pjwvc3ZnPg==';

export async function seedSampleData(): Promise<void> {
  const students = await loadStudents();
  const receipts = await loadReceipts();
  if (students.length > 0 || receipts.length > 0) return;

  const today = new Date().toISOString().split('T')[0];
  const sampleStudent: Student = {
    id: 'sample-1',
    code: 1,
    nome: 'Maria Silva',
    email: 'maria.silva@gmail.com',
    concursoPretendido: 'INSS',
    cargoPretendido: 'Técnico',
    dataEntrada: today,
    dataNascimento: '1995-06-15',
    telefone: '(11) 99999-8888',
    cidade: 'São Paulo',
    estado: 'SP',
    escolaridade: 'ensino_superior',
    modalidadeConcorrencia: 'ampla',
    turnos: ['manha', 'tarde'],
    horasPorDia: 6,
    quantosConcursos: 2,
    disciplinaMaiorDificuldade: 'Direito Administrativo',
    disciplinaMaiorFacilidade: 'Português',
    dataInicioEstudos: '2024-01-10',
    formaPagamento: 'pix_vista',
    statusPagamento: 'pago',
    planosRestantes: 2,
    planosEntregues: [
      { id: 'plano-1', dataEntrega: today, nomeConcurso: 'INSS' },
    ],
    prazoValidade: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    precoIndividual: 90,
  };

  const sampleReceipt: Receipt = {
    id: 'receipt-sample-1',
    imagem: SAMPLE_RECEIPT_IMG,
    dataPagamento: today,
    valor: 90,
    observacoes: 'Pagamento referente ao plano inicial',
    alunoIds: ['sample-1'],
    createdAt: new Date().toISOString(),
  };

  await saveStudents([sampleStudent]);
  await saveReceipts([sampleReceipt]);
}
