import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, X, Image, Camera, FileImage, Search,
  ChevronRight, ExternalLink, Download, Check, Plus, Banknote,
  Calendar as CalendarIcon, User, FileText, Receipt, ZoomIn, ZoomOut,
} from 'lucide-react';
import { Student, Receipt as ReceiptType, PlanoEntregue } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { seedSampleData, isMentorViewer } from '../utils/storage';
import { loadStudents, saveStudents, loadReceipts, saveReceipts } from '../services/database';
import { generateId, formatDate, formatCurrency } from '../utils/helpers';
import { EmptyState } from '../components/ui/EmptyState';

const receiptPresets = [
  { name: 'Comprovante 1', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTdlZiIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNDc1NTY5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSBDb21wcm92YW50ZSBQSVggMSDCoTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sd8OpZ8OpcmVuY2lhPC90ZXh0Pjwvc3ZnPg==' },
  { name: 'Comprovante 2', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RjZmNlOCIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMTY1YzQxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSBDb21wcm92YW50ZSBQSVggMiDCoTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNTljMDdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sd8OpZ8OpcmVuY2lhPC90ZXh0Pjwvc3ZnPg==' },
  { name: 'Comprovante 3', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZlZjJjOCIgcng9IjgiLz48dGV4dCB4PSIyMDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTI1YzFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7CqSBDb21wcm92YW50ZSBQSVggMyDCoTwvdGV4dD48dGV4dCB4PSIyMDAiIHk9IjE3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjYjc5MTQzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Sd8OpZ8OpcmVuY2lhPC90ZXh0Pjwvc3ZnPg==' },
];

const planLabels = ['1\u00ba Plano (Inicial)', '2\u00ba Plano (1\u00aa Altera\u00e7\u00e3o)', '3\u00ba Plano (2\u00aa Altera\u00e7\u00e3o)'];

export function ReceiptsControlPage() {
  const navigate = useNavigate();
  const viewer = isMentorViewer();
  const [receipts, setReceiptsState] = useState<ReceiptType[]>([]);
  const [students, setStudentsState] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<ReceiptType | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    seedSampleData().then(() => {
      loadReceipts().then(setReceiptsState);
      loadStudents().then(setStudentsState);
    });
  }, []);

  const persist = async (updated: ReceiptType[]) => {
    setReceiptsState(updated);
    await saveReceipts(updated);
  };

  const stats = useMemo(() => {
    const linkedIds = new Set(receipts.flatMap((r) => r.alunoIds || []));
    const total = receipts.reduce((acc, r) => acc + r.valor, 0);
    const planosVinculados = receipts.reduce((acc, r) => acc + (r.planoIds?.length || 0), 0);
    return { total: receipts.length, totalValue: total, linkedStudents: linkedIds.size, planosVinculados };
  }, [receipts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return receipts;
    const q = search.toLowerCase();
    return receipts.filter((r) => {
      const linked = students.filter((s) => r.alunoIds?.includes(s.id));
      return linked.some((s) =>
        s.nome.toLowerCase().includes(q) || String(s.code).includes(q)
      ) || r.observacoes?.toLowerCase().includes(q);
    });
  }, [receipts, students, search]);

  /* Form state */
  const [formImage, setFormImage] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formValue, setFormValue] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formPlanoId, setFormPlanoId] = useState('');

  const selectedStudent = students.find((s) => s.id === formStudentId);
  const studentPlans = selectedStudent ? selectedStudent.planosEntregues.filter((p) => p.nomeConcurso) : [];

  const resetForm = () => {
    setFormImage('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormValue('');
    setFormNotes('');
    setFormStudentId('');
    setFormPlanoId('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formImage || !formDate || !formValue || !formStudentId) return;

    const plano = selectedStudent?.planosEntregues.find((p) => p.id === formPlanoId);

    const newReceipt: ReceiptType = {
      id: generateId(),
      imagem: formImage,
      dataPagamento: formDate,
      valor: Number(formValue),
      observacoes: formNotes || undefined,
      alunoIds: [formStudentId],
      planoIds: formPlanoId ? [formPlanoId] : [],
      planoLabel: plano ? planLabels[selectedStudent!.planosEntregues.indexOf(plano)] || undefined : undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedStudents = students.map((s) => {
      if (s.id === formStudentId) {
        return { ...s, statusPagamento: 'pago' as const, dataPagamento: formDate, comprovanteId: newReceipt.id };
      }
      return s;
    });

    setStudentsState(updatedStudents);
    await saveStudents(updatedStudents);
    await persist([...receipts, newReceipt]);
    resetForm();
    setShowForm(false);
  };

  /* Lightbox */
  const lightboxStudents = lightbox ? students.filter((s) => lightbox.alunoIds?.includes(s.id)) : [];
  const lightboxPlans = lightbox
    ? lightboxStudents.flatMap((s) =>
        s.planosEntregues.filter((p) => lightbox.planoIds?.includes(p.id))
      )
    : [];

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('mentor')} className="ios-btn-ghost -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">Comprovantes</h1>
              <p className="text-sm text-slate-500 mt-0.5">Controle de recebimentos por Pix</p>
            </div>
          </div>
          {!viewer && (
            <button onClick={() => setShowForm(true)} className="ios-btn-primary">
              <Plus className="h-4 w-4" />
              Novo
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por aluno..."
            className="ios-input pl-[38px]"
          />
        </div>

        {/* Receipt Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-10 w-10" />}
            title="Nenhum comprovante"
            description={search ? 'Nada encontrado' : 'Registre o primeiro recebimento'}
            action={
              !search && !viewer ? <button onClick={() => setShowForm(true)} className="ios-btn-primary"><Plus className="h-4 w-4" /> Novo Comprovante</button> : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((receipt, i) => {
              const linked = students.filter((s) => receipt.alunoIds?.includes(s.id));
              return (
                <motion.div
                  key={receipt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { setLightbox(receipt); setZoomLevel(1); }}
                  className="ios-card cursor-pointer overflow-hidden p-0 group"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden rounded-t-2xl">
                    <img
                      src={receipt.imagem}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-400 font-medium">{formatDate(receipt.dataPagamento)}</span>
                      <span className="text-[15px] font-bold text-[#34c759]">{formatCurrency(receipt.valor)}</span>
                    </div>
                    {receipt.planoLabel && (
                      <div className="ios-badge-blue text-[10px] inline-flex">{receipt.planoLabel}</div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {linked.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1 rounded-full bg-[#f2f2f7] px-2.5 py-1 text-[11px] font-medium text-slate-600"
                        >
                          <User className="h-3 w-3 text-slate-400" />
                          #{s.code} {s.nome.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                    {receipt.observacoes && (
                      <p className="text-[12px] text-slate-400 line-clamp-1">{receipt.observacoes}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Receipt Sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { resetForm(); setShowForm(false); }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
            >
              <div className="p-6 pb-10 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Novo Comprovante</h2>
                  <button onClick={() => { resetForm(); setShowForm(false); }} className="ios-btn-ghost p-2 -mr-2">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Image */}
                <div>
                  <label className="ios-label">Imagem do Comprovante</label>
                  {formImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                      <img src={formImage} alt="" className="w-full max-h-52 object-contain bg-slate-50" />
                      <button
                        onClick={() => setFormImage('')}
                        className="absolute top-2 right-2 rounded-full bg-white/80 backdrop-blur p-1.5 shadow"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 py-8 cursor-pointer transition-colors hover:border-[#007aff]/40 hover:bg-[#007aff]/5">
                      <Upload className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm font-medium text-slate-500">Clique para enviar</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG ou WebP</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  <div className="flex gap-2 mt-2">
                    {receiptPresets.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setFormImage(p.content)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-500 transition-colors hover:border-[#007aff]/30 hover:bg-[#007aff]/5"
                      >
                        {i === 0 ? <Image className="h-3.5 w-3.5" /> : i === 1 ? <FileImage className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="ios-label">Data</label>
                    <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="ios-input" />
                  </div>
                  <div>
                    <label className="ios-label">Valor (R$)</label>
                    <input type="number" step="0.01" min="0" value={formValue} onChange={(e) => setFormValue(e.target.value)} className="ios-input" placeholder="90,00" />
                  </div>
                </div>

                {/* Student Select */}
                <div>
                  <label className="ios-label">Aluno</label>
                  <select
                    value={formStudentId}
                    onChange={(e) => { setFormStudentId(e.target.value); setFormPlanoId(''); }}
                    className="ios-input"
                  >
                    <option value="">Selecione...</option>
                    {students.filter((s) => s.statusPagamento !== 'pago').map((s) => (
                      <option key={s.id} value={s.id}>#{s.code} — {s.nome}</option>
                    ))}
                  </select>
                  {students.filter((s) => s.statusPagamento === 'pago').length > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">Alunos já pagos não aparecem na lista</p>
                  )}
                </div>

                {/* Plan Delivery Select */}
                {selectedStudent && selectedStudent.planosEntregues.filter(p => p.nomeConcurso).length > 0 && (
                  <div>
                    <label className="ios-label">Vincular à entrega de plano</label>
                    <select
                      value={formPlanoId}
                      onChange={(e) => setFormPlanoId(e.target.value)}
                      className="ios-input"
                    >
                      <option value="">Nenhum (apenas pagamento)</option>
                      {selectedStudent.planosEntregues.map((p, idx) => (
                        <option key={p.id} value={p.id}>
                          {planLabels[idx] || `Plano #${idx + 1}`} — {p.nomeConcurso}
                        </option>
                      ))}
                    </select>
                    {formPlanoId && selectedStudent.planosEntregues.find(p => p.id === formPlanoId)?.nomeConcurso && (
                      <p className="text-[12px] text-[#34c759] mt-1.5 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Vinculado à entrega do plano
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="ios-label">Observa\u00e7\u00f5es</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="ios-input resize-none"
                    rows={2}
                    placeholder="Opcional"
                  />
                </div>

                {!viewer && (
                  <button
                    onClick={handleSubmit}
                    disabled={!formImage || !formDate || !formValue || !formStudentId}
                    className="ios-btn-primary w-full justify-center text-base py-4"
                  >
                    <Check className="h-5 w-5" />
                    Salvar Comprovante
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="fixed inset-4 z-50 m-auto flex max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-auto sm:top-8 sm:bottom-8"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">Comprovante</span>
                <button onClick={() => setLightbox(null)} className="ios-btn-ghost p-1.5 -mr-2">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Zoomable Image */}
                <div className="relative">
                  <div
                    className={`overflow-auto rounded-2xl bg-slate-50 border border-slate-100 ${zoomLevel > 1 ? 'cursor-move' : 'cursor-zoom-in'}`}
                    style={{ maxHeight: '18rem' }}
                    onClick={() => setZoomLevel(zoomLevel === 1 ? 2.5 : 1)}
                  >
                    <img
                      src={lightbox.imagem}
                      alt=""
                      className="w-full transition-transform duration-200"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                    />
                  </div>
                  {/* Zoom Controls */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 shadow-sm px-2 py-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.max(1, z - 0.5)); }}
                      disabled={zoomLevel <= 1}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ZoomOut className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <span className="text-[10px] font-medium text-slate-500 min-w-[32px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setZoomLevel((z) => Math.min(4, z + 0.5)); }}
                      disabled={zoomLevel >= 4}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ZoomIn className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setZoomLevel(1); }}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 transition-colors ml-1"
                      title="Reset zoom"
                    >
                      <X className="h-3 w-3 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="ios-card space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Data</span>
                    <span className="text-sm font-semibold text-slate-900">{formatDate(lightbox.dataPagamento)}</span>
                  </div>
                  <div className="ios-divider" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Valor</span>
                    <span className="text-lg font-bold text-[#34c759]">{formatCurrency(lightbox.valor)}</span>
                  </div>
                  {lightbox.observacoes && (
                    <>
                      <div className="ios-divider" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Observações</span>
                        <span className="text-sm text-slate-700 text-right max-w-[60%]">{lightbox.observacoes}</span>
                      </div>
                    </>
                  )}
                  {lightbox.planoLabel && (
                    <>
                      <div className="ios-divider" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Plano</span>
                        <span className="ios-badge-blue text-[11px]">{lightbox.planoLabel}</span>
                      </div>
                    </>
                  )}
                </div>

                {lightboxStudents.length > 0 && (
                  <div>
                    <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Alunos Vinculados</p>
                    <div className="space-y-2">
                      {lightboxStudents.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => navigate(`aluno/${s.id}?from=receipts`)}
                          className="ios-card flex items-center gap-3 cursor-pointer p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007aff]/10 text-sm font-bold text-[#007aff]">
                            {s.nome.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">{s.nome}</p>
                            <p className="text-[12px] text-slate-400">#{s.code}</p>
                          </div>
                          {lightboxPlans.filter(p => lightbox.planoIds?.includes(p.id)).map((p) => (
                            <span key={p.id} className="ios-badge-blue text-[10px]">{p.nomeConcurso}</span>
                          ))}
                          <ChevronRight className="h-4 w-4 text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-slate-100">
                <a
                  href={lightbox.imagem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ios-btn-secondary w-full justify-center"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir imagem em nova aba
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
