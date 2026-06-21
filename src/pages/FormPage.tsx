import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Send, Home, FileText } from 'lucide-react';
import { FormData, FormStep, Student } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { getFormDraft, setFormDraft, clearFormDraft } from '../utils/storage';
import { loadStudents, saveStudents } from '../services/database';
import { generateId, addDays, getPlanValue, addMonths } from '../utils/helpers';
import { StepIndicator } from '../components/ui/StepIndicator';
import { ProgressBar } from '../components/ui/ProgressBar';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { Step1Identification } from '../components/form/Step1Identification';
import { Step2Education } from '../components/form/Step2Education';
import { Step3Target } from '../components/form/Step3Target';
import { Step4Routine } from '../components/form/Step4Routine';
import { Step5Review } from '../components/form/Step5Review';

const steps = [
  { number: 1 as FormStep, label: 'Identificação' },
  { number: 2 as FormStep, label: 'Escolaridade' },
  { number: 3 as FormStep, label: 'Concurso Alvo' },
  { number: 4 as FormStep, label: 'Rotina' },
  { number: 5 as FormStep, label: 'Revisão' },
];

const initialFormData: FormData = {
  nome: '',
  dataNascimento: '',
  telefone: '',
  cidade: '',
  estado: '',
  email: '',
  escolaridade: '',
  cursoTecnico: null,
  cursoTecnicoNome: '',
  cursoGraduacao: '',
  concursoPretendido: '',
  cargoPretendido: '',
  modalidadeConcorrencia: '',
  modalidadeOutro: '',
  notaCorte: '',
  notaPrimeiro: '',
  turnos: [],
  horasPorDia: '',
  quantosConcursos: '',
  disciplinaMaiorDificuldade: '',
  disciplinaMaiorFacilidade: '',
  dataInicioEstudos: '',
  formaPagamento: '',
  foto: '',
};

export function FormPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [data, setData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [estimatedDate, setEstimatedDate] = useState('');

  useEffect(() => {
    const draft = getFormDraft();
    if (draft) setData(draft);
  }, []);

  useEffect(() => {
    const hasData = Object.values(data).some((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (v === null) return false;
      return v !== '';
    });
    if (hasData) setFormDraft(data);
  }, [data]);

  const validateStep = useCallback((step: FormStep): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!data.nome.trim()) newErrors.nome = 'Nome é obrigatório';
      if (!data.dataNascimento) newErrors.dataNascimento = 'Data de nascimento é obrigatória';
      if (!data.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';
      if (!data.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
      if (!data.estado) newErrors.estado = 'Estado é obrigatório';
      if (!data.email.trim()) newErrors.email = 'E-mail é obrigatório';
      else if (!data.email.includes('@gmail.com')) newErrors.email = 'Deve ser um e-mail @gmail.com';
    }

    if (step === 2) {
      if (!data.escolaridade) newErrors.escolaridade = 'Selecione sua escolaridade';
    }

    if (step === 3) {
      if (!data.concursoPretendido.trim()) newErrors.concursoPretendido = 'Concurso é obrigatório';
      if (!data.cargoPretendido.trim()) newErrors.cargoPretendido = 'Cargo é obrigatório';
      if (!data.modalidadeConcorrencia) newErrors.modalidadeConcorrencia = 'Selecione a modalidade';
    }

    if (step === 4) {
      if (data.turnos.length === 0) newErrors.turnos = 'Selecione ao menos um turno';
      if (!data.horasPorDia || Number(data.horasPorDia) <= 0) newErrors.horasPorDia = 'Informe horas por dia';
      if (data.quantosConcursos === '' || Number(data.quantosConcursos) < 0) newErrors.quantosConcursos = 'Informe quantos concursos já fez';
      if (!data.disciplinaMaiorDificuldade.trim()) newErrors.disciplinaMaiorDificuldade = 'Campo obrigatório';
      if (!data.disciplinaMaiorFacilidade.trim()) newErrors.disciplinaMaiorFacilidade = 'Campo obrigatório';
      if (!data.dataInicioEstudos) newErrors.dataInicioEstudos = 'Data de início é obrigatória';
    }

    if (step === 5) {
      if (!data.formaPagamento) newErrors.formaPagamento = 'Selecione a forma de pagamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5) as FormStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as FormStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const today = new Date().toISOString().split('T')[0];
    const existing = await loadStudents();
    const nextCode = existing.length > 0 ? Math.max(...existing.map((s) => s.code)) + 1 : 1;
    const planValue = getPlanValue(today);

    const newStudent: Student = {
      id: generateId(),
      code: nextCode,
      nome: data.nome,
      dataNascimento: data.dataNascimento,
      telefone: data.telefone,
      cidade: data.cidade,
      estado: data.estado,
      email: data.email,
      escolaridade: (data.escolaridade || 'ensino_medio') as Student['escolaridade'],
      cursoTecnico: data.cursoTecnico || undefined,
      cursoTecnicoNome: data.cursoTecnicoNome || undefined,
      cursoGraduacao: data.cursoGraduacao || undefined,
      concursoPretendido: data.concursoPretendido,
      cargoPretendido: data.cargoPretendido,
      modalidadeConcorrencia: (data.modalidadeConcorrencia || 'ampla') as Student['modalidadeConcorrencia'],
      modalidadeOutro: data.modalidadeOutro || undefined,
      notaCorte: data.notaCorte ? Number(data.notaCorte) : undefined,
      notaPrimeiro: data.notaPrimeiro ? Number(data.notaPrimeiro) : undefined,
      turnos: data.turnos as Student['turnos'],
      horasPorDia: Number(data.horasPorDia),
      quantosConcursos: Number(data.quantosConcursos),
      disciplinaMaiorDificuldade: data.disciplinaMaiorDificuldade,
      disciplinaMaiorFacilidade: data.disciplinaMaiorFacilidade,
      dataInicioEstudos: data.dataInicioEstudos,
      formaPagamento: (data.formaPagamento || 'pix_vista') as Student['formaPagamento'],
      foto: data.foto || undefined,
      dataEntrada: today,
      statusPagamento: 'pendente',
      planosRestantes: 3,
      planosEntregues: [],
      prazoValidade: addMonths(today, 6),
      precoIndividual: planValue,
    };

    await saveStudents([...existing, newStudent]);
    clearFormDraft();

    const estimated = addDays(today, 7);
    setEstimatedDate(estimated);
    setSubmitting(false);
    setSubmitted(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Identification data={data} onChange={setData} errors={errors} />;
      case 2: return <Step2Education data={data} onChange={setData} errors={errors} />;
      case 3: return <Step3Target data={data} onChange={setData} errors={errors} />;
      case 4: return <Step4Routine data={data} onChange={setData} errors={errors} />;
      case 5: return <Step5Review data={data} onChange={setData} errors={errors} />;
      default: return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Formulário Enviado com Sucesso!</h2>
          <p className="mt-3 text-slate-600">
            Seu diagnóstico foi recebido. Você receberá seu plano de estudos personalizado até:
          </p>
          <div className="mt-4 inline-block rounded-lg bg-indigo-50 px-6 py-3 border border-indigo-200">
            <span className="text-lg font-bold text-indigo-700">
              {new Date(estimatedDate).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => { setSubmitted(false); setData(initialFormData); setCurrentStep(1); }} className="btn-primary">
              <FileText className="h-4 w-4" />
              Enviar Outro
            </button>
            <button onClick={() => navigate('')} className="btn-secondary">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/20">
      <LoadingOverlay show={submitting} message="Enviando formulário..." />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => navigate('')} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <FileText className="h-4 w-4" />
            Diagnóstico
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="w-full md:w-64 md:shrink-0">
            <div className="md:sticky md:top-6">
              <StepIndicator currentStep={currentStep} steps={steps} />
              <div className="mt-6 hidden md:block">
                <ProgressBar current={currentStep} total={5} />
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 md:hidden">
              <ProgressBar current={currentStep} total={5} />
            </div>

            <div className="card min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="btn-ghost disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </button>

              {currentStep < 5 ? (
                <button onClick={handleNext} className="btn-primary">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} className="btn-success shadow-lg shadow-emerald-200">
                  <Send className="h-4 w-4" />
                  Enviar Formulário
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
