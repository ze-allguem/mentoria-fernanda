import { FormData } from '../../types';
import { motion } from 'framer-motion';
import { getEscolaridadeLabel, getConcorrenciaLabel, getTurnoLabel, getPagamentoLabel, formatDate } from '../../utils/helpers';

interface Props {
  data: FormData;
  onChange: (data: FormData) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

const paymentMethods = [
  { value: 'cartao', label: 'Cartão de Crédito', desc: 'Pagamento parcelado no cartão' },
  { value: 'cartao_pix', label: 'Cartão + Pix', desc: 'Entrada no Pix + restante no cartão' },
  { value: 'pix_vista', label: 'Pix à Vista', desc: 'Pagamento total via Pix com desconto' },
];

export function Step5Review({ data, onChange, errors }: Props) {
  const handleChange = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const sections = [
    {
      title: 'Identificação',
      items: [
        { label: 'Nome', value: data.nome },
        { label: 'Data de Nascimento', value: data.dataNascimento ? formatDate(data.dataNascimento) : '' },
        { label: 'Telefone', value: data.telefone },
        { label: 'Cidade/Estado', value: `${data.cidade} - ${data.estado}` },
        { label: 'E-mail', value: data.email },
      ],
    },
    {
      title: 'Escolaridade',
      items: [
        { label: 'Nível', value: getEscolaridadeLabel(data.escolaridade) },
        ...(data.cursoTecnico ? [{ label: 'Curso Técnico', value: data.cursoTecnicoNome }] : []),
        ...(data.cursoGraduacao ? [{ label: 'Graduação', value: data.cursoGraduacao }] : []),
      ],
    },
    {
      title: 'Concurso Alvo',
      items: [
        { label: 'Concurso', value: data.concursoPretendido },
        { label: 'Cargo', value: data.cargoPretendido },
        { label: 'Modalidade', value: getConcorrenciaLabel(data.modalidadeConcorrencia) },
        ...(data.notaCorte ? [{ label: 'Nota de Corte', value: data.notaCorte }] : []),
        ...(data.notaPrimeiro ? [{ label: 'Nota 1º Lugar', value: data.notaPrimeiro }] : []),
      ],
    },
    {
      title: 'Rotina de Estudos',
      items: [
        { label: 'Turnos', value: data.turnos.map((t) => getTurnoLabel(t)).join(', ') },
        { label: 'Horas/Dia', value: data.horasPorDia },
        { label: 'Concursos Feitos', value: data.quantosConcursos },
        { label: 'Maior Dificuldade', value: data.disciplinaMaiorDificuldade },
        { label: 'Maior Facilidade', value: data.disciplinaMaiorFacilidade },
        { label: 'Início dos Estudos', value: data.dataInicioEstudos ? formatDate(data.dataInicioEstudos) : '' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">{section.title}</h4>
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 divide-y divide-slate-200">
            {section.items
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="flex items-start justify-between px-4 py-2.5">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className="text-sm text-slate-900 text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
          </div>
        </div>
      ))}

      <fieldset>
        <legend className="label mb-3">
          Forma de Pagamento <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {paymentMethods.map((method) => (
            <motion.button
              key={method.value}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChange('formaPagamento', method.value)}
              className={`rounded-lg border-2 px-4 py-4 text-left transition-all ${
                data.formaPagamento === method.value
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              aria-pressed={data.formaPagamento === method.value}
            >
              <span
                className={`block text-sm font-semibold ${
                  data.formaPagamento === method.value ? 'text-indigo-700' : 'text-slate-700'
                }`}
              >
                {method.label}
              </span>
              <span
                className={`mt-0.5 block text-xs ${
                  data.formaPagamento === method.value ? 'text-indigo-500' : 'text-slate-400'
                }`}
              >
                {method.desc}
              </span>
            </motion.button>
          ))}
        </div>
        {errors.formaPagamento && <p className="mt-1 text-xs text-red-500">{errors.formaPagamento}</p>}
      </fieldset>
    </div>
  );
}
