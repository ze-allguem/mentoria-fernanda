import { FormData } from '../../types';
import { motion } from 'framer-motion';

interface Props {
  data: FormData;
  onChange: (data: FormData) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

const shifts = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
];

export function Step4Routine({ data, onChange, errors }: Props) {
  const handleChange = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const toggleTurno = (turno: string) => {
    const current = data.turnos;
    const updated = current.includes(turno)
      ? current.filter((t) => t !== turno)
      : [...current, turno];
    onChange({ ...data, turnos: updated });
  };

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="label mb-3">
          Turnos disponíveis <span className="text-red-500">*</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {shifts.map((shift) => (
            <motion.button
              key={shift.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleTurno(shift.value)}
              className={`rounded-lg border-2 px-5 py-2.5 text-sm font-medium transition-all ${
                data.turnos.includes(shift.value)
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
              aria-pressed={data.turnos.includes(shift.value)}
            >
              {shift.label}
            </motion.button>
          ))}
        </div>
        {errors.turnos && <p className="mt-1 text-xs text-red-500">{errors.turnos}</p>}
      </fieldset>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="horasPorDia" className="label mb-1.5">
            Horas por dia <span className="text-red-500">*</span>
          </label>
          <input
            id="horasPorDia"
            type="number"
            min="1"
            max="24"
            value={data.horasPorDia}
            onChange={(e) => handleChange('horasPorDia', e.target.value)}
            className="input-field"
            placeholder="Ex: 4"
          />
          {errors.horasPorDia && <p className="mt-1 text-xs text-red-500">{errors.horasPorDia}</p>}
        </div>
        <div>
          <label htmlFor="quantosConcursos" className="label mb-1.5">
            Quantos concursos já fez? <span className="text-red-500">*</span>
          </label>
          <input
            id="quantosConcursos"
            type="number"
            min="0"
            value={data.quantosConcursos}
            onChange={(e) => handleChange('quantosConcursos', e.target.value)}
            className="input-field"
            placeholder="Ex: 2"
          />
          {errors.quantosConcursos && <p className="mt-1 text-xs text-red-500">{errors.quantosConcursos}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="disciplinaMaiorDificuldade" className="label mb-1.5">
            Disciplina com maior dificuldade <span className="text-red-500">*</span>
          </label>
          <input
            id="disciplinaMaiorDificuldade"
            type="text"
            value={data.disciplinaMaiorDificuldade}
            onChange={(e) => handleChange('disciplinaMaiorDificuldade', e.target.value)}
            className="input-field"
            placeholder="Ex: Matemática, Direito..."
          />
          {errors.disciplinaMaiorDificuldade && <p className="mt-1 text-xs text-red-500">{errors.disciplinaMaiorDificuldade}</p>}
        </div>
        <div>
          <label htmlFor="disciplinaMaiorFacilidade" className="label mb-1.5">
            Disciplina com maior facilidade <span className="text-red-500">*</span>
          </label>
          <input
            id="disciplinaMaiorFacilidade"
            type="text"
            value={data.disciplinaMaiorFacilidade}
            onChange={(e) => handleChange('disciplinaMaiorFacilidade', e.target.value)}
            className="input-field"
            placeholder="Ex: Português..."
          />
          {errors.disciplinaMaiorFacilidade && <p className="mt-1 text-xs text-red-500">{errors.disciplinaMaiorFacilidade}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="dataInicioEstudos" className="label mb-1.5">
          Data de início dos estudos <span className="text-red-500">*</span>
        </label>
        <input
          id="dataInicioEstudos"
          type="date"
          value={data.dataInicioEstudos}
          onChange={(e) => handleChange('dataInicioEstudos', e.target.value)}
          className="input-field"
        />
        {errors.dataInicioEstudos && <p className="mt-1 text-xs text-red-500">{errors.dataInicioEstudos}</p>}
      </div>
    </div>
  );
}
