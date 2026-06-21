import { FormData } from '../../types';
import { motion } from 'framer-motion';

interface Props {
  data: FormData;
  onChange: (data: FormData) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

const levels = [
  { value: 'ensino_fundamental', label: 'Ensino Fundamental Completo' },
  { value: 'ensino_medio', label: 'Ensino Médio Completo' },
  { value: 'ensino_superior', label: 'Ensino Superior Completo' },
];

export function Step2Education({ data, onChange, errors }: Props) {
  const handleChange = (field: keyof FormData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="label mb-3">Escolaridade <span className="text-red-500">*</span></legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {levels.map((level) => (
            <motion.button
              key={level.value}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onChange({
                  ...data,
                  escolaridade: level.value as FormData['escolaridade'],
                  cursoTecnico: level.value === 'ensino_medio' ? data.cursoTecnico : null,
                  cursoTecnicoNome: level.value === 'ensino_medio' ? data.cursoTecnicoNome : '',
                  cursoGraduacao: level.value === 'ensino_superior' ? data.cursoGraduacao : '',
                });
              }}
              className={`rounded-lg border-2 px-4 py-4 text-left text-sm font-medium transition-all ${
                data.escolaridade === level.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={data.escolaridade === level.value}
            >
              {level.label}
            </motion.button>
          ))}
        </div>
        {errors.escolaridade && <p className="mt-1 text-xs text-red-500">{errors.escolaridade}</p>}
      </fieldset>

      {data.escolaridade === 'ensino_medio' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 overflow-hidden"
        >
          <fieldset>
            <legend className="label mb-3">Fez curso técnico?</legend>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => handleChange('cursoTecnico', val)}
                  className={`rounded-lg border-2 px-6 py-2.5 text-sm font-medium transition-all ${
                    data.cursoTecnico === val
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  aria-pressed={data.cursoTecnico === val}
                >
                  {val ? 'Sim' : 'Não'}
                </button>
              ))}
            </div>
          </fieldset>
          {data.cursoTecnico && (
            <div>
              <label htmlFor="cursoTecnicoNome" className="label mb-1.5">
                Qual curso técnico?
              </label>
              <input
                id="cursoTecnicoNome"
                type="text"
                value={data.cursoTecnicoNome}
                onChange={(e) => handleChange('cursoTecnicoNome', e.target.value)}
                className="input-field"
                placeholder="Ex: Administração, Informática..."
              />
            </div>
          )}
        </motion.div>
      )}

      {data.escolaridade === 'ensino_superior' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <label htmlFor="cursoGraduacao" className="label mb-1.5">
            Qual curso de graduação usará para concorrer?
          </label>
          <input
            id="cursoGraduacao"
            type="text"
            value={data.cursoGraduacao}
            onChange={(e) => handleChange('cursoGraduacao', e.target.value)}
            className="input-field"
            placeholder="Ex: Direito, Engenharia..."
          />
        </motion.div>
      )}
    </div>
  );
}
