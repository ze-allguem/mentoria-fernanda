import { FormData } from '../../types';

interface Props {
  data: FormData;
  onChange: (data: FormData) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

const modalities = [
  { value: 'ampla', label: 'Ampla Concorrência' },
  { value: 'negros_pardos', label: 'Pessoa Negra/Pardos' },
  { value: 'pcd', label: 'PcD' },
  { value: 'indigena', label: 'Indígena' },
  { value: 'quilombola', label: 'Quilombola' },
  { value: 'outro', label: 'Outro' },
];

export function Step3Target({ data, onChange, errors }: Props) {
  const handleChange = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="concursoPretendido" className="label mb-1.5">
          Concurso pretendido <span className="text-red-500">*</span>
        </label>
        <input
          id="concursoPretendido"
          type="text"
          value={data.concursoPretendido}
          onChange={(e) => handleChange('concursoPretendido', e.target.value)}
          className="input-field"
          placeholder="Ex: INSS, Polícia Federal, Receita Federal..."
        />
        {errors.concursoPretendido && <p className="mt-1 text-xs text-red-500">{errors.concursoPretendido}</p>}
      </div>

      <div>
        <label htmlFor="cargoPretendido" className="label mb-1.5">
          Cargo pretendido <span className="text-red-500">*</span>
        </label>
        <input
          id="cargoPretendido"
          type="text"
          value={data.cargoPretendido}
          onChange={(e) => handleChange('cargoPretendido', e.target.value)}
          className="input-field"
          placeholder="Ex: Técnico, Analista, Agente..."
        />
        {errors.cargoPretendido && <p className="mt-1 text-xs text-red-500">{errors.cargoPretendido}</p>}
      </div>

      <fieldset>
        <legend className="label mb-3">
          Modalidade de concorrência <span className="text-red-500">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {modalities.map((mod) => (
            <button
              key={mod.value}
              type="button"
              onClick={() => handleChange('modalidadeConcorrencia', mod.value)}
              className={`rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                data.modalidadeConcorrencia === mod.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
              aria-pressed={data.modalidadeConcorrencia === mod.value}
            >
              {mod.label}
            </button>
          ))}
        </div>
        {errors.modalidadeConcorrencia && <p className="mt-1 text-xs text-red-500">{errors.modalidadeConcorrencia}</p>}
      </fieldset>

      {data.modalidadeConcorrencia === 'outro' && (
        <div>
          <label htmlFor="modalidadeOutro" className="label mb-1.5">Qual?</label>
          <input
            id="modalidadeOutro"
            type="text"
            value={data.modalidadeOutro}
            onChange={(e) => handleChange('modalidadeOutro', e.target.value)}
            className="input-field"
            placeholder="Especifique..."
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="notaCorte" className="label mb-1.5">Nota de corte (opcional)</label>
          <input
            id="notaCorte"
            type="number"
            step="0.01"
            value={data.notaCorte}
            onChange={(e) => handleChange('notaCorte', e.target.value)}
            className="input-field"
            placeholder="Ex: 75.5"
          />
        </div>
        <div>
          <label htmlFor="notaPrimeiro" className="label mb-1.5">Nota do 1º colocado (opcional)</label>
          <input
            id="notaPrimeiro"
            type="number"
            step="0.01"
            value={data.notaPrimeiro}
            onChange={(e) => handleChange('notaPrimeiro', e.target.value)}
            className="input-field"
            placeholder="Ex: 92.0"
          />
        </div>
      </div>
    </div>
  );
}
