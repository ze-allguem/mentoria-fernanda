import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, DollarSign, Receipt as ReceiptIcon, LogOut, Search, Trash2, Download,
  Plus, FileDown, ChevronLeft, AlertTriangle, Clock, CheckCircle, Banknote,
  X, Upload, Camera, Image, FileImage, Check,
} from 'lucide-react';
import { Student, Receipt, FinanceFilter, PlanoEntregue } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { setMentorAuth, seedSampleData, isMentorViewer } from '../utils/storage';
import { loadStudents, saveStudents, loadReceipts, saveReceipts } from '../services/database';
import {
  generateId, formatDate, getPlanValue, formatCurrency, getStatusColor, getStatusLabel, isExpired, getRemainingTime,
} from '../utils/helpers';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ToastContainer } from '../components/ui/Toast';
import { Toast } from '../types';

type Tab = 'alunos' | 'financeiro' | 'comprovantes';

const receiptPresets = [
  { name: 'Comprovante Pix 1', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTdlZiIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNDc1NTY5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSBDb21wcm92YW50ZSBQSVggUHJlc2V0IDEgwqk8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmVmOiBQSVgtMDAxPC90ZXh0Pjwvc3ZnPg==' },
  { name: 'Comprovante Pix 2', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RjZmNlOCIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMTY1YzQxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSBDb21wcm92YW50ZSBQSVggUHJlc2V0IDIgwqk8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzU5YzA3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmVmOiBQSVgtMDAyPC90ZXh0Pjwvc3ZnPg==' },
  { name: 'Comprovante Pix 3', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZlZjJjOCIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTI1YzFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSBDb21wcm92YW50ZSBQSVggUHJlc2V0IDMgwqk8L3RleHQ+PHRleHQgeD0iMjAwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2I3OTE0MyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmVmOiBQSVgtMDAzPC90ZXh0Pjwvc3ZnPg==' },
];

export function MentorPanel() {
  const navigate = useNavigate();
  const viewer = isMentorViewer();
  const [tab, setTab] = useState<Tab>('alunos');
  const [students, setStudentsState] = useState<Student[]>([]);
  const [receipts, setReceiptsState] = useState<Receipt[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FinanceFilter>('todos');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [showReceiptLightbox, setShowReceiptLightbox] = useState<Receipt | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  useEffect(() => {
    seedSampleData().then(() => {
      loadStudents().then(setStudentsState);
      loadReceipts().then(setReceiptsState);
    });
  }, []);

  const persistStudents = async (updated: Student[]) => {
    setStudentsState(updated);
    await saveStudents(updated);
  };

  const persistReceipts = async (updated: Receipt[]) => {
    setReceiptsState(updated);
    await saveReceipts(updated);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      return s.nome.toLowerCase().includes(q) ||
        s.concursoPretendido.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        String(s.code).includes(q);
    });
  }, [students, search]);

  const filteredFinance = useMemo(() => {
    let list = students;
    if (filterStatus === 'pago') list = list.filter((s) => s.statusPagamento === 'pago');
    else if (filterStatus === 'pendente') list = list.filter((s) => s.statusPagamento === 'pendente');
    else if (filterStatus === 'atrasado') list = list.filter((s) => s.statusPagamento === 'atrasado');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.nome.toLowerCase().includes(q) || String(s.code).includes(q));
    }
    return list;
  }, [students, search, filterStatus]);

  const financeKPIs = useMemo(() => {
    const totalStudents = students.length;
    const paid = students.filter((s) => s.statusPagamento === 'pago');
    const pending = students.filter((s) => s.statusPagamento === 'pendente');
    const late = students.filter((s) => s.statusPagamento === 'atrasado');
    const received = paid.reduce((acc, s) => acc + getPlanValue(s.dataEntrada), 0);
    const toReceive = pending.reduce((acc, s) => acc + getPlanValue(s.dataEntrada), 0);
    const lateAmount = late.reduce((acc, s) => acc + getPlanValue(s.dataEntrada), 0);
    const total = received + toReceive + lateAmount;
    return { totalStudents, paid: paid.length, pending: pending.length, late: late.length, received, toReceive, lateAmount, total };
  }, [students]);

  const receiptStats = useMemo(() => {
    const linkedIds = new Set(receipts.flatMap((r) => r.alunoIds));
    const totalValue = receipts.reduce((acc, r) => acc + r.valor, 0);
    return { total: receipts.length, totalValue, linkedStudents: linkedIds.size };
  }, [receipts]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const deleteSelected = async () => {
    const updated = students.filter((s) => !selectedIds.has(s.id));
    await persistStudents(updated);
    setSelectedIds(new Set());
    addToast('success', `${selectedIds.size} aluno(s) excluído(s)`);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(students, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alunos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = 'Código,Aluno,Data de Entrada,Valor,Status,Data Pagamento\n';
    const rows = filteredFinance.map((s) =>
      `"${s.code}","${s.nome}","${formatDate(s.dataEntrada)}","R$ ${getPlanValue(s.dataEntrada).toFixed(2)}","${getStatusLabel(s.statusPagamento)}","${s.dataPagamento ? formatDate(s.dataPagamento) : '-'}"`
    ).join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    setMentorAuth(false);
    navigate('');
  };

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentTarget, setNewStudentTarget] = useState('');

  const addManualStudent = async () => {
    if (!newStudentName.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const maxCode = students.length > 0 ? Math.max(...students.map((s) => s.code)) : 0;
    const newStudent: Student = {
      id: generateId(),
      code: maxCode + 1,
      nome: newStudentName,
      email: newStudentEmail || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      concursoPretendido: newStudentTarget || 'Não informado',
      cargoPretendido: '',
      dataEntrada: today,
      dataNascimento: '',
      telefone: '',
      cidade: '',
      estado: '',
      escolaridade: 'ensino_medio',
      modalidadeConcorrencia: 'ampla',
      turnos: [],
      horasPorDia: 0,
      quantosConcursos: 0,
      disciplinaMaiorDificuldade: '',
      disciplinaMaiorFacilidade: '',
      dataInicioEstudos: '',
      formaPagamento: 'pix_vista',
      statusPagamento: 'pendente',
      planosRestantes: 3,
      planosEntregues: [],
      prazoValidade: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
      precoIndividual: getPlanValue(today),
    };
    await persistStudents([...students, newStudent]);
    setShowAddStudent(false);
    setNewStudentName('');
    setNewStudentEmail('');
    setNewStudentTarget('');
    addToast('success', 'Aluno adicionado manualmente');
  };

  const [receiptImage, setReceiptImage] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptValue, setReceiptValue] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [receiptStudents, setReceiptStudents] = useState<string[]>([]);

  const handleReceiptSubmit = async () => {
    if (!receiptImage || !receiptDate || !receiptValue || receiptStudents.length === 0) {
      addToast('error', 'Preencha todos os campos obrigatórios');
      return;
    }
    const newReceipt: Receipt = {
      id: generateId(),
      imagem: receiptImage,
      dataPagamento: receiptDate,
      valor: Number(receiptValue),
      observacoes: receiptNotes || undefined,
      alunoIds: receiptStudents,
      createdAt: new Date().toISOString(),
    };
    const updatedStudents = students.map((s) =>
      receiptStudents.includes(s.id)
        ? { ...s, statusPagamento: 'pago' as const, dataPagamento: receiptDate, comprovanteId: newReceipt.id }
        : s
    );
    await Promise.all([
      persistStudents(updatedStudents),
      persistReceipts([...receipts, newReceipt]),
    ]);
    setShowReceiptForm(false);
    setReceiptImage('');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setReceiptValue('');
    setReceiptNotes('');
    setReceiptStudents([]);
    addToast('success', `Comprovante vinculado a ${receiptStudents.length} aluno(s)`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReceiptImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleReceiptStudent = (id: string) => {
    setReceiptStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-1 sm:gap-3 min-w-0">
            <button onClick={() => navigate('')} className="btn-ghost p-1 shrink-0">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-500 text-[10px] sm:text-xs font-bold text-white shadow">
              F
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate block">Mentoria Fernanda Concursos</span>
              <span className={`inline-block rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider ${viewer ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                {viewer ? 'Visualizador' : 'Mentor'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button onClick={() => navigate('respondents')} className="btn-ghost text-[10px] sm:text-xs text-slate-500 px-1.5 sm:px-2">
              <span className="hidden sm:inline">Respondentes</span>
              <span className="sm:hidden">Resp.</span>
            </button>
            <button onClick={() => navigate('receipts')} className="btn-ghost text-[10px] sm:text-xs text-slate-500 px-1.5 sm:px-2">
              <span className="hidden sm:inline">Comprovantes</span>
              <span className="sm:hidden">Comp.</span>
            </button>
            <button onClick={handleLogout} className="btn-ghost text-[10px] sm:text-sm text-red-600 hover:text-red-700 px-1.5 sm:px-2">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6">
          <nav className="flex gap-0.5 sm:gap-1 overflow-x-auto">
            {[
              { id: 'alunos' as Tab, label: 'Alunos', icon: Users, count: students.length },
              { id: 'financeiro' as Tab, label: 'Financeiro', icon: DollarSign },
              { id: 'comprovantes' as Tab, label: 'Comprovantes', icon: ReceiptIcon, count: receipts.length, href: 'receipts' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => (item as any).href ? navigate((item as any).href) : setTab(item.id)}
                className={`flex items-center gap-1 sm:gap-2 border-b-2 px-2.5 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-sm font-medium transition-colors shrink-0 ${
                  tab === item.id
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {item.label}
                {item.count !== undefined && (
                  <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold ${
                    tab === item.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6">
        {/* TAB 1: ALUNOS */}
        {tab === 'alunos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, concurso ou e-mail..."
                  className="input-field pl-9 sm:pl-10 text-xs sm:text-sm"
                />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
                {!viewer && selectedIds.size > 0 && (
                  <button onClick={deleteSelected} className="btn-danger text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
                    <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Excluir ({selectedIds.size})</span>
                    <span className="sm:hidden">{selectedIds.size}</span>
                  </button>
                )}
                <button onClick={exportJSON} className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">Exportar JSON</span>
                </button>
                {!viewer && (
                  <button onClick={() => setShowAddStudent(true)} className="btn-primary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Adicionar Aluno</span>
                  </button>
                )}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={<Users className="h-10 w-10" />}
                title="Nenhum aluno encontrado"
                description={search ? 'Tente alterar sua busca' : 'Nenhum aluno cadastrado ainda. Compartilhe o link do formulário!'}
                action={
                  !search ? (
                    <button onClick={() => navigate('')} className="btn-primary">
                      Copiar Link do Formulário
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div
                      onClick={() => navigate(`aluno/${student.id}`)}
                      className="card cursor-pointer group relative overflow-hidden p-3 sm:p-4"
                    >
                      <div className="absolute right-2 sm:right-3 top-2 sm:top-3 z-10">
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleSelect(student.id); }}
                          className={`flex h-4 w-4 sm:h-5 sm:w-5 cursor-pointer items-center justify-center rounded border-2 transition-colors ${
                            selectedIds.has(student.id)
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 bg-white group-hover:border-indigo-400'
                          }`}
                        >
                          {selectedIds.has(student.id) && (
                            <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-xs sm:text-sm font-bold text-indigo-700">
                          {student.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs sm:text-sm font-semibold text-slate-800">{student.nome}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500">
                            <span className="font-mono">#{student.code}</span>
                            {student.cargoPretendido && <span className="ml-1.5 text-slate-400">· {student.cargoPretendido}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-600">
                          <span className="truncate font-medium">{student.concursoPretendido}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-400">
                          <span>{formatDate(student.dataEntrada)}</span>
                          <span className="text-slate-300">·</span>
                          <span className={isExpired(student.prazoValidade) ? 'text-red-500' : 'text-slate-500'}>
                            {getRemainingTime(student.prazoValidade)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold ${getStatusColor(student.statusPagamento)}`}>
                            {getStatusLabel(student.statusPagamento)}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] sm:text-[10px] text-slate-400">
                              {student.planosRestantes}/{3} planos
                            </span>
                            {!viewer && student.planosRestantes > 0 && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const today = new Date().toISOString().split('T')[0];
                                  const newPlano: PlanoEntregue = { id: generateId(), dataEntrega: today, nomeConcurso: '' };
                                  const updated = students.map((s) =>
                                    s.id === student.id
                                      ? { ...s, planosEntregues: [...s.planosEntregues, newPlano], planosRestantes: s.planosRestantes - 1 }
                                      : s
                                  );
                                  await persistStudents(updated);
                                }}
                                className="text-[9px] sm:text-[10px] font-medium text-indigo-600 hover:text-indigo-800 px-1 py-0.5 rounded hover:bg-indigo-50 transition-colors"
                                title="Confirmar envio do plano"
                              >
                                Enviar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: FINANCEIRO */}
        {tab === 'financeiro' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { label: 'Recebido', value: formatCurrency(financeKPIs.received), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { label: 'A Receber', value: formatCurrency(financeKPIs.toReceive), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
              ].map((kpi) => (
                <div key={kpi.label} className={`rounded-xl border ${kpi.border} ${kpi.bg} p-2.5 sm:p-4`}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-[10px] sm:text-xs font-medium text-slate-500">{kpi.label}</span>
                    <kpi.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${kpi.color}`} />
                  </div>
                  <p className={`text-sm sm:text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="input-field pl-8 sm:pl-10 text-xs sm:text-sm w-full sm:w-52"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FinanceFilter)}
                  className="input-field text-xs sm:text-sm py-1.5 sm:py-2"
                >
                  <option value="todos">Todos</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
              <button onClick={exportCSV} className="btn-secondary text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 self-start sm:self-auto">
                <FileDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Exportar CSV
              </button>
            </div>

            {filteredFinance.length === 0 ? (
              <EmptyState
                icon={<DollarSign className="h-10 w-10" />}
                title="Nenhum registro financeiro"
                description="Registros aparecerão quando alunos forem cadastrados."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-slate-500">#</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-slate-500">Aluno</th>
                      <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-slate-500">Entrada</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-slate-500">Valor</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-slate-500">Status</th>
                      <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-slate-500">Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFinance.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => navigate(`aluno/${s.id}`)}
                        className="cursor-pointer transition-colors hover:bg-slate-50"
                      >
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-[10px] sm:text-xs text-slate-500">#{s.code}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-slate-800 truncate max-w-[80px] sm:max-w-none">{s.nome}</td>
                        <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-slate-600">{formatDate(s.dataEntrada)}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-slate-800 text-[11px] sm:text-sm">{formatCurrency(getPlanValue(s.dataEntrada))}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                          <span className={`inline-block rounded-full px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-[11px] font-semibold ${getStatusColor(s.statusPagamento)}`}>
                            {getStatusLabel(s.statusPagamento)}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-slate-600">{s.dataPagamento ? formatDate(s.dataPagamento) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: COMPROVANTES */}
        {tab === 'comprovantes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">Guias</p>
                <p className="mt-0.5 sm:mt-1 text-base sm:text-xl font-bold text-slate-800">{receiptStats.total}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">Faturamento</p>
                <p className="mt-0.5 sm:mt-1 text-base sm:text-xl font-bold text-emerald-600">{formatCurrency(receiptStats.totalValue)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-4">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">Vínculos</p>
                <p className="mt-0.5 sm:mt-1 text-base sm:text-xl font-bold text-indigo-600">{receiptStats.linkedStudents}</p>
              </div>
            </div>

            {!viewer && (
              <div className="mb-4">
                <button onClick={() => setShowReceiptForm(true)} className="btn-primary text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5">
                  <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Novo Comprovante
                </button>
              </div>
            )}

            {receipts.length === 0 ? (
              <EmptyState
                icon={<ReceiptIcon className="h-10 w-10" />}
                title="Nenhum comprovante cadastrado"
                description="Faça upload do primeiro comprovante Pix."
                action={!viewer ? (
                  <button onClick={() => setShowReceiptForm(true)} className="btn-primary">
                    <Upload className="h-4 w-4" />
                    Novo Comprovante
                  </button>
                ) : undefined}
              />
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {receipts.map((receipt) => {
                  const linkedStudents = students.filter((s) => receipt.alunoIds.includes(s.id));
                  return (
                    <motion.div
                      key={receipt.id}
                      initial={{ opacity: 0, y: 10 }}
                      className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="flex">
                        <div
                          className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 cursor-pointer bg-slate-100"
                          onClick={() => setShowReceiptLightbox(receipt)}
                        >
                          <img
                            src={receipt.imagem}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 p-2 sm:p-3">
                          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                            <span className="text-[10px] sm:text-xs text-slate-500">{formatDate(receipt.dataPagamento)}</span>
                            <span className="text-xs sm:text-sm font-bold text-emerald-600">{formatCurrency(receipt.valor)}</span>
                          </div>
                          {linkedStudents.length === 0 && (
                            <p className="text-[10px] sm:text-xs text-slate-400 italic">Sem vínculos</p>
                          )}
                          {linkedStudents.map((s) => (
                            <div key={s.id} className="flex items-center gap-1 sm:gap-2 py-0.5">
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-400 shrink-0" />
                              <span className="text-[10px] sm:text-xs font-semibold text-indigo-700 shrink-0">#{s.code}</span>
                              <span className="text-[10px] sm:text-xs text-slate-700 truncate">{s.nome}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`aluno/${s.id}`); }}
                                className="ml-auto shrink-0 text-[10px] text-indigo-500 hover:underline"
                              >
                                perfil
                              </button>
                            </div>
                          ))}
                          {receipt.observacoes && (
                            <p className="mt-1.5 text-[10px] text-slate-400 truncate">{receipt.observacoes}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal: Add Student */}
      <Modal open={showAddStudent} onClose={() => setShowAddStudent(false)} title="Adicionar Aluno Manualmente">
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5">Nome do Aluno *</label>
            <input type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="input-field" placeholder="Nome completo" />
          </div>
          <div>
            <label className="label mb-1.5">E-mail</label>
            <input type="email" value={newStudentEmail} onChange={(e) => setNewStudentEmail(e.target.value)} className="input-field" placeholder="email@gmail.com" />
          </div>
          <div>
            <label className="label mb-1.5">Concurso Alvo</label>
            <input type="text" value={newStudentTarget} onChange={(e) => setNewStudentTarget(e.target.value)} className="input-field" placeholder="Ex: INSS" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddStudent(false)} className="btn-secondary">Cancelar</button>
            <button onClick={addManualStudent} className="btn-primary">Adicionar</button>
          </div>
        </div>
      </Modal>

      {/* Modal: New Receipt */}
      <Modal open={showReceiptForm} onClose={() => setShowReceiptForm(false)} title="Novo Comprovante" size="lg">
        <div className="space-y-5">
          <div>
            <label className="label mb-2">Imagem do Comprovante *</label>
            <div className="flex flex-col gap-3">
              <div
                className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-indigo-400 hover:bg-indigo-50/30"
                onClick={() => document.getElementById('receipt-upload')?.click()}
              >
                {receiptImage ? (
                  <div className="relative w-full max-w-xs">
                    <img src={receiptImage} alt="Preview" className="max-h-48 w-full rounded-lg object-contain" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setReceiptImage(''); }}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-slate-400" />
                    <p className="text-sm font-medium text-slate-600">Clique para fazer upload</p>
                    <p className="text-xs text-slate-400">PNG, JPG ou WebP</p>
                  </>
                )}
                <input id="receipt-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">Ou use um preset de teste:</p>
                <div className="flex gap-2">
                  {receiptPresets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => setReceiptImage(preset.content)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      {i === 0 ? <Image className="h-3.5 w-3.5" /> : i === 1 ? <FileImage className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label mb-1.5">Data do Pagamento *</label>
              <input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label mb-1.5">Valor Total *</label>
              <input type="number" step="0.01" min="0" value={receiptValue} onChange={(e) => setReceiptValue(e.target.value)} className="input-field" placeholder="R$ 90,00" />
            </div>
          </div>

          <div>
            <label className="label mb-1.5">Observações</label>
            <textarea value={receiptNotes} onChange={(e) => setReceiptNotes(e.target.value)} className="input-field" rows={2} placeholder="Opcional" />
          </div>

            <div>
              <label className="label mb-2">Vincular Alunos *</label>
              <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 p-2">
                {students.filter((s) => s.statusPagamento !== 'pago').length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">Nenhum aluno pendente</p>
                ) : (
                  students.filter((s) => s.statusPagamento !== 'pago').map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={receiptStudents.includes(s.id)}
                      onChange={() => toggleReceiptStudent(s.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      #{s.code} — {s.nome}
                    </span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(s.statusPagamento)}`}>
                      {getStatusLabel(s.statusPagamento)}
                    </span>
                  </label>
                ))
              )}
              {students.filter((s) => s.statusPagamento === 'pago').length > 0 && (
                <p className="text-[10px] text-slate-400 pt-1 px-1">Alunos já pagos não aparecem na lista</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowReceiptForm(false)} className="btn-secondary">Cancelar</button>
            <button onClick={handleReceiptSubmit} className="btn-success">
              <Check className="h-4 w-4" />
              Salvar Comprovante
            </button>
          </div>
        </div>
      </Modal>

      {/* Lightbox */}
      <Modal open={showReceiptLightbox !== null} onClose={() => setShowReceiptLightbox(null)} size="full">
        {showReceiptLightbox && (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1">
              <img
                src={showReceiptLightbox.imagem}
                alt="Comprovante"
                className="w-full rounded-lg object-contain"
                style={{ maxHeight: '70vh' }}
              />
            </div>
            <div className="w-full lg:w-80 shrink-0 space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Detalhes do Comprovante</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Data</span>
                  <span className="font-medium text-slate-800">{formatDate(showReceiptLightbox.dataPagamento)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Valor</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(showReceiptLightbox.valor)}</span>
                </div>
                {showReceiptLightbox.observacoes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Obs</span>
                    <span className="text-slate-600">{showReceiptLightbox.observacoes}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Alunos Vinculados</p>
                {students.filter((s) => showReceiptLightbox.alunoIds.includes(s.id)).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 mb-1">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.nome}</p>
                      <p className="text-xs text-slate-500">#{s.code}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">{formatCurrency(getPlanValue(s.dataEntrada))}</span>
                  </div>
                ))}
              </div>
              <a
                href={showReceiptLightbox.imagem}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center"
              >
                <Download className="h-4 w-4" />
                Abrir em nova aba
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
