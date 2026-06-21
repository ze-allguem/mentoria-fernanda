import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Mail, Trash2, CheckCircle,
  Clock, AlertTriangle, Download, User, Image, FileText,
} from 'lucide-react';
import { Student, PlanoEntregue } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { loadStudents, saveStudents } from '../services/database';
import { isMentorViewer } from '../utils/storage';
import {
  generateId, formatDate, getPlanValue, formatCurrency, isExpired,
  getStatusColor, getStatusLabel, getEscolaridadeLabel, getConcorrenciaLabel,
  getTurnoLabel, getPagamentoLabel,
} from '../utils/helpers';
import { EmptyState } from '../components/ui/EmptyState';

export function StudentDetail() {
  const navigate = useNavigate();
  const viewer = isMentorViewer();
  const [students, setStudentsState] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  const studentId = window.location.hash.split('/aluno/')[1]?.split('?')[0] || '';
  const from = new URLSearchParams(window.location.hash.split('?')[1] || '').get('from') || '';

  useEffect(() => {
    loadStudents().then((all) => {
      setStudentsState(all);
      const found = all.find((s) => s.id === studentId);
      setStudent(found || null);
    });
  }, [studentId]);

  const handleBack = () => {
    if (from === 'respondents') navigate('respondents');
    else navigate('mentor');
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <EmptyState
          icon={<User className="h-10 w-10" />}
          title="Aluno não encontrado"
          description="O aluno que você procura não existe ou foi removido."
          action={
            <button onClick={() => navigate('mentor')} className="btn-primary">
              Voltar ao Painel
            </button>
          }
        />
      </div>
    );
  }

  const persistStudents = async (updated: Student[]) => {
    setStudentsState(updated);
    await saveStudents(updated);
  };

  const updateStudent = (updates: Partial<Student>) => {
    if (!student) return;
    const updated = students.map((s) =>
      s.id === student.id ? { ...s, ...updates } : s
    );
    const newStudent = { ...student, ...updates };
    setStudent(newStudent);
    persistStudents(updated);
  };

  const deleteStudent = async () => {
    const updated = students.filter((s) => s.id !== studentId);
    await persistStudents(updated);
    navigate('mentor');
  };

  const ensureThreePlans = (): PlanoEntregue[] => {
    const current = [...student.planosEntregues];
    while (current.length < 3) {
      current.push({ id: generateId(), dataEntrega: '', nomeConcurso: '' });
    }
    return current;
  };

  const updatePlano = (index: number, field: keyof PlanoEntregue, value: string) => {
    const plans = ensureThreePlans();
    plans[index] = { ...plans[index], [field]: value };
    const filled = plans.filter((p) => p.nomeConcurso || p.dataEntrega);
    updateStudent({
      planosEntregues: plans,
      planosRestantes: Math.max(0, 3 - filled.length),
    });
  };

  const expired = isExpired(student.prazoValidade);

  const handleSavePrice = () => {
    const val = Number(priceInput);
    if (val > 0) {
      updateStudent({ precoIndividual: val });
    }
    setEditingPrice(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
          <button onClick={handleBack} className="btn-ghost text-xs sm:text-sm">
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={`mailto:${student.email}`}
              className="btn-ghost text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2"
              title="Enviar e-mail"
            >
              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Enviar e-mail</span>
            </a>
            {!viewer && (
              <button onClick={deleteStudent} className="btn-danger text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2">
                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <div className="card !p-3 sm:!p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="relative shrink-0 group">
                {student.foto ? (
                  <>
                    <img
                      src={student.foto}
                      alt={student.nome}
                      className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                    />
                    <a
                      href={student.foto}
                      download={`${student.nome.replace(/\s+/g, '_')}_foto.jpg`}
                      className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-colors hover:bg-black/40 group"
                    >
                      <Download className="h-4 w-4 sm:h-6 sm:w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </>
                ) : (
                  <div className="flex h-14 w-14 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-lg sm:text-2xl font-bold text-indigo-700 shadow-sm border-2 border-slate-200">
                    {student.nome.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-slate-800 truncate">{student.nome}</h1>
                <p className="text-xs sm:text-sm text-slate-500 truncate">{student.email} · #{student.code}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Entrou em {formatDate(student.dataEntrada)}</p>
              </div>
              <div className="shrink-0">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold ${getStatusColor(student.statusPagamento)}`}>
                  {student.statusPagamento === 'pago' ? <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> :
                   student.statusPagamento === 'atrasado' ? <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> :
                   <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                  {getStatusLabel(student.statusPagamento)}
                </span>
              </div>
            </div>
            {student.foto && (
              <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                <Image className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Foto enviada pelo aluno
                <a
                  href={student.foto}
                  download={`${student.nome.replace(/\s+/g, '_')}_foto.jpg`}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Baixar foto
                </a>
              </div>
            )}
          </div>

          {/* Planos */}
          <div className="card !p-3 sm:!p-6">
            <h2 className="mb-3 sm:mb-4 text-sm sm:text-base font-bold text-slate-800">Controle de Planos</h2>
            <div className="grid gap-2 sm:gap-4 grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-2 sm:p-4 text-center border border-slate-200">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">Planos Restantes</p>
                <p className="mt-0.5 sm:mt-1 text-base sm:text-2xl font-bold text-indigo-600">{student.planosRestantes}</p>
                <p className="text-[8px] sm:text-[10px] text-slate-400">de 3 cobertos</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 sm:p-4 text-center border border-slate-200">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">Prazo de Validade</p>
                <p className={`mt-0.5 sm:mt-1 text-[11px] sm:text-sm font-bold ${expired ? 'text-red-600' : 'text-emerald-600'}`}>
                  {expired ? 'Expirado' : 'Ativo'}
                </p>
                <p className="text-[8px] sm:text-[10px] text-slate-400">até {formatDate(student.prazoValidade)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 sm:p-4 text-center border border-slate-200">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">Preço</p>
                {editingPrice ? (
                  <div className="mt-0.5 sm:mt-1 flex items-center justify-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="input-field w-16 sm:w-24 text-center text-[11px] sm:text-sm"
                      autoFocus
                    />
                    <button onClick={handleSavePrice} className="btn-primary text-[10px] sm:text-xs py-1 sm:py-1.5 px-1.5 sm:px-2">OK</button>
                  </div>
                ) : (
                  <p
                    className={`mt-0.5 sm:mt-1 text-sm sm:text-lg font-bold text-slate-800 ${viewer ? '' : 'cursor-pointer hover:text-indigo-600'}`}
                    onClick={() => { if (!viewer) { setPriceInput(String(student.precoIndividual)); setEditingPrice(true); } }}
                  >
                    {formatCurrency(student.precoIndividual)}
                  </p>
                )}
                {!viewer && <p className="text-[8px] sm:text-[10px] text-slate-400">clique p/ editar</p>}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              {([
                { label: '1\u00ba Plano (Inicial)', placeholder: 'Ex: Escrevente TJSP' },
                { label: '2\u00ba Plano (1\u00aa Altera\u00e7\u00e3o)', placeholder: 'Ex: AFT' },
                { label: '3\u00ba Plano (2\u00aa Altera\u00e7\u00e3o)', placeholder: 'Ex: INSS' },
              ] as const).map((slot, index) => {
                const plans = ensureThreePlans();
                const plano = plans[index];
                const isPreenchido = !!plano.nomeConcurso || !!plano.dataEntrega;
                return (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 sm:p-4 transition-colors ${
                      isPreenchido
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-indigo-100 text-[8px] sm:text-[10px] font-bold text-indigo-700">
                        {index + 1}
                      </span>
                      <span className="text-[11px] sm:text-sm font-semibold text-slate-700">{slot.label}</span>
                      {isPreenchido && (
                        <span className="rounded-full bg-emerald-100 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-medium text-emerald-700 ml-auto">
                          Entregue
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="text-[8px] sm:text-[10px] font-medium text-slate-400">Data de Entrega</label>
                        <input
                          type="date"
                          value={plano.dataEntrega}
                          onChange={(e) => updatePlano(index, 'dataEntrega', e.target.value)}
                          className="input-field text-[10px] sm:text-xs py-1 sm:py-1.5 mt-0.5"
                          readOnly={viewer}
                        />
                      </div>
                      <div>
                        <label className="text-[8px] sm:text-[10px] font-medium text-slate-400">Concurso Realizado</label>
                        <input
                          type="text"
                          value={plano.nomeConcurso}
                          onChange={(e) => updatePlano(index, 'nomeConcurso', e.target.value)}
                          className="input-field text-[10px] sm:text-xs py-1 sm:py-1.5 mt-0.5"
                          placeholder={slot.placeholder}
                          readOnly={viewer}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnóstico Completo */}
          <div className="card !p-3 sm:!p-6">
            <h2 className="mb-3 sm:mb-4 text-sm sm:text-base font-bold text-slate-800">Respostas do Diagnóstico</h2>
            <div className="space-y-4 sm:space-y-6">
              <Section title="Identificação">
                <Row label="Nome" value={student.nome} />
                <Row label="Nascimento" value={student.dataNascimento ? formatDate(student.dataNascimento) : '-'} />
                <Row label="Telefone" value={student.telefone || '-'} />
                <Row label="Cidade" value={student.cidade ? `${student.cidade} - ${student.estado}` : '-'} />
                <Row label="E-mail" value={student.email} />
              </Section>
              <Section title="Escolaridade">
                <Row label="Nível" value={getEscolaridadeLabel(student.escolaridade)} />
                {student.cursoTecnico && <Row label="Curso Técnico" value={student.cursoTecnicoNome || 'Sim'} />}
                {student.cursoGraduacao && <Row label="Graduação" value={student.cursoGraduacao} />}
              </Section>
              <Section title="Concurso Alvo">
                <Row label="Concurso" value={student.concursoPretendido} />
                <Row label="Cargo" value={student.cargoPretendido || '-'} />
                <Row label="Modalidade" value={getConcorrenciaLabel(student.modalidadeConcorrencia)} />
                {student.notaCorte !== undefined && <Row label="Nota de Corte" value={String(student.notaCorte)} />}
                {student.notaPrimeiro !== undefined && <Row label="Nota 1º Lugar" value={String(student.notaPrimeiro)} />}
              </Section>
              <Section title="Rotina de Estudos">
                <Row label="Turnos" value={student.turnos.map((t) => getTurnoLabel(t)).join(', ')} />
                <Row label="Horas/Dia" value={String(student.horasPorDia)} />
                <Row label="Concursos Feitos" value={String(student.quantosConcursos)} />
                <Row label="Maior Dificuldade" value={student.disciplinaMaiorDificuldade} />
                <Row label="Maior Facilidade" value={student.disciplinaMaiorFacilidade} />
                <Row label="Início dos Estudos" value={student.dataInicioEstudos ? formatDate(student.dataInicioEstudos) : '-'} />
              </Section>
              <Section title="Pagamento">
                <Row label="Forma" value={getPagamentoLabel(student.formaPagamento)} />
                <Row label="Status" value={getStatusLabel(student.statusPagamento)} />
                <Row label="Valor" value={formatCurrency(getPlanValue(student.dataEntrada))} />
                {student.dataPagamento && <Row label="Data Pagamento" value={formatDate(student.dataPagamento)} />}
              </Section>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200">
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-700">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Ver JSON completo
                </summary>
                <pre className="mt-2 sm:mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 sm:p-4 text-[10px] sm:text-xs text-slate-300">
                  {JSON.stringify(student, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-600">{title}</h3>
      <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between px-2.5 sm:px-4 py-1.5 sm:py-2.5">
      <span className="text-[11px] sm:text-sm font-medium text-slate-500">{label}</span>
      <span className="text-[11px] sm:text-sm text-slate-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
