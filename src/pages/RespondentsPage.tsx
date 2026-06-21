import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, User, Calendar, Target, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Student } from '../types';
import { useNavigate } from '../hooks/useNavigate';
import { loadStudents } from '../services/database';
import { formatDate, getStatusColor, getStatusLabel, getPlanValue, formatCurrency } from '../utils/helpers';
import { EmptyState } from '../components/ui/EmptyState';

export function RespondentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadStudents().then(setStudents);
    const interval = setInterval(() => loadStudents().then(setStudents), 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) =>
      s.nome.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.concursoPretendido.toLowerCase().includes(q) ||
      String(s.code).includes(q)
    );
  }, [students, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/20">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate('')} className="btn-ghost p-1">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-slate-800">Respondentes</h1>
              <p className="text-xs sm:text-sm text-slate-500">{students.length} aluno(s)</p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou concurso..."
              className="input-field pl-8 sm:pl-10 text-xs sm:text-sm"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<User className="h-10 w-10" />}
            title={search ? 'Nenhum resultado' : 'Nenhum respondente'}
            description={search ? 'Tente alterar sua busca' : 'Aguardando o primeiro aluno preencher o formulário.'}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {filtered.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025 }}
                  onClick={() => navigate(`aluno/${student.id}?from=respondents`)}
                  className="flex cursor-pointer items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-4 transition-colors hover:bg-indigo-50/50"
                >
                  {/* ID + Avatar combined on mobile */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] sm:text-xs font-bold text-slate-500">
                      {student.code}
                    </div>
                    {student.foto ? (
                      <img
                        src={student.foto}
                        alt={student.nome}
                        className="h-7 w-7 sm:h-10 sm:w-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-[9px] sm:text-sm font-bold text-indigo-700">
                        {student.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs sm:text-sm font-semibold text-slate-800">{student.nome}</p>
                      <span className={`sm:hidden rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${getStatusColor(student.statusPagamento)}`}>
                        {getStatusLabel(student.statusPagamento)}
                      </span>
                    </div>
                    <p className="truncate text-[10px] sm:text-xs text-slate-400">{student.email}</p>
                    <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                      <Target className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500 truncate">{student.concursoPretendido}</span>
                    </div>
                  </div>

                  {/* Desktop-only columns */}
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 min-w-0 max-w-[140px]">
                    <Target className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{student.concursoPretendido}</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{student.cidade || '-'}/{student.estado || '-'}</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatDate(student.dataEntrada)}</span>
                  </div>

                  {/* Status + Valor */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getStatusColor(student.statusPagamento)}`}>
                      {getStatusLabel(student.statusPagamento)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatCurrency(getPlanValue(student.dataEntrada))}
                    </span>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-slate-300" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
