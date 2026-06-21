export interface Student {
  id: string;
  code: number;
  nome: string;
  dataNascimento: string;
  telefone: string;
  cidade: string;
  estado: string;
  email: string;
  escolaridade: 'ensino_fundamental' | 'ensino_medio' | 'ensino_superior';
  cursoTecnico?: boolean;
  cursoTecnicoNome?: string;
  cursoGraduacao?: string;
  concursoPretendido: string;
  cargoPretendido: string;
  modalidadeConcorrencia: 'ampla' | 'negros_pardos' | 'pcd' | 'indigena' | 'quilombola' | 'outro';
  modalidadeOutro?: string;
  notaCorte?: number;
  notaPrimeiro?: number;
  turnos: ('manha' | 'tarde' | 'noite')[];
  horasPorDia: number;
  quantosConcursos: number;
  disciplinaMaiorDificuldade: string;
  disciplinaMaiorFacilidade: string;
  dataInicioEstudos: string;
  formaPagamento: 'cartao' | 'cartao_pix' | 'pix_vista';
  dataEntrada: string;
  statusPagamento: 'pendente' | 'pago' | 'atrasado';
  dataPagamento?: string;
  planosRestantes: number;
  planosEntregues: PlanoEntregue[];
  prazoValidade: string;
  precoIndividual: number;
  comprovanteId?: string;
  foto?: string;
}

export interface PlanoEntregue {
  id: string;
  dataEntrega: string;
  nomeConcurso: string;
}

export interface Receipt {
  id: string;
  imagem: string;
  dataPagamento: string;
  valor: number;
  observacoes?: string;
  alunoIds: string[];
  planoIds?: string[];
  planoLabel?: string;
  createdAt: string;
}

export interface Mentor {
  nome: string;
  email: string;
  senha: string;
}

export type FormStep = 1 | 2 | 3 | 4 | 5;

export interface FormData {
  nome: string;
  dataNascimento: string;
  telefone: string;
  cidade: string;
  estado: string;
  email: string;
  escolaridade: 'ensino_fundamental' | 'ensino_medio' | 'ensino_superior' | '';
  cursoTecnico: boolean | null;
  cursoTecnicoNome: string;
  cursoGraduacao: string;
  concursoPretendido: string;
  cargoPretendido: string;
  modalidadeConcorrencia: 'ampla' | 'negros_pardos' | 'pcd' | 'indigena' | 'quilombola' | 'outro' | '';
  modalidadeOutro: string;
  notaCorte: string;
  notaPrimeiro: string;
  turnos: string[];
  horasPorDia: string;
  quantosConcursos: string;
  disciplinaMaiorDificuldade: string;
  disciplinaMaiorFacilidade: string;
  dataInicioEstudos: string;
  formaPagamento: string;
  foto: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type FinanceFilter = 'todos' | 'pago' | 'pendente' | 'atrasado';
