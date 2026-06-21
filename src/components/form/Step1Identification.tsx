import { FormData } from '../../types';
import { estados } from '../../data/estados';
import { Upload, X } from 'lucide-react';

interface Props {
  data: FormData;
  onChange: (data: FormData) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export function Step1Identification({ data, onChange, errors }: Props) {
  const handleChange = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...data, foto: reader.result as string });
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    onChange({ ...data, foto: '' });
    const input = document.getElementById('foto') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Photo */}
      <div>
        <label className="label mb-1.5">Sua foto (opcional)</label>
        <p className="text-xs text-slate-400 mb-2">A foto ajuda o mentor a personalizar seu plano</p>
        {data.foto ? (
          <div className="relative inline-block">
            <img
              src={data.foto}
              alt="Preview"
              className="h-28 w-28 rounded-xl object-cover border border-slate-200 shadow-sm"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 transition-colors"
              aria-label="Remover foto"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <label className="relative flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition-colors hover:border-indigo-400 hover:bg-indigo-50/30">
            <Upload className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-500">Clique para enviar sua foto</span>
            <input id="foto" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        )}
      </div>

      <div>
        <label htmlFor="nome" className="label mb-1.5">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <input
          id="nome"
          type="text"
          value={data.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          className="input-field"
          placeholder="Seu nome completo"
        />
        {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="dataNascimento" className="label mb-1.5">
            Data de nascimento <span className="text-red-500">*</span>
          </label>
          <input
            id="dataNascimento"
            type="date"
            value={data.dataNascimento}
            onChange={(e) => handleChange('dataNascimento', e.target.value)}
            className="input-field"
          />
          {errors.dataNascimento && <p className="mt-1 text-xs text-red-500">{errors.dataNascimento}</p>}
        </div>
        <div>
          <label htmlFor="telefone" className="label mb-1.5">
            Telefone WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            id="telefone"
            type="tel"
            value={data.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            className="input-field"
            placeholder="(11) 99999-9999"
          />
          {errors.telefone && <p className="mt-1 text-xs text-red-500">{errors.telefone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cidade" className="label mb-1.5">
            Cidade <span className="text-red-500">*</span>
          </label>
          <input
            id="cidade"
            type="text"
            value={data.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
            className="input-field"
            placeholder="Sua cidade"
          />
          {errors.cidade && <p className="mt-1 text-xs text-red-500">{errors.cidade}</p>}
        </div>
        <div>
          <label htmlFor="estado" className="label mb-1.5">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            id="estado"
            value={data.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="input-field"
          >
            <option value="">Selecione...</option>
            {estados.map((est) => (
              <option key={est.sigla} value={est.sigla}>
                {est.sigla} - {est.nome}
              </option>
            ))}
          </select>
          {errors.estado && <p className="mt-1 text-xs text-red-500">{errors.estado}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="label mb-1.5">
          E-mail <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className="input-field"
          placeholder="seuemail@gmail.com"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>
    </div>
  );
}
