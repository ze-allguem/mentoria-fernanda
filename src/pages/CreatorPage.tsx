import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Terminal, Eye, Shield } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';
import { setMentorAuth, UserRole } from '../utils/storage';

const USERS: { email: string; role: UserRole; label: string }[] = [
  { email: 'josealves606@gmail.com', role: 'admin', label: 'Admin' },
  { email: 'fernandavargas123', role: 'viewer', label: 'Fernanda' },
];

export function CreatorPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find((u) => input.toLowerCase() === u.email);
    if (user) {
      setMentorAuth(true, user.role);
      const redirect = localStorage.getItem('redirectAfterAuth');
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirect || 'mentor');
    } else {
      setAttempts((p) => p + 1);
      if (attempts >= 2) {
        setError('Acesso negado.');
        setTimeout(() => { setError(''); setAttempts(0); }, 2000);
      } else {
        setError('Credencial inválida.');
      }
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.08),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-xs"
      >
        <button onClick={() => navigate('')} className="mb-6 inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">voltar</span>
        </button>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm shadow-xl">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
              <Terminal className="h-5 w-5 text-slate-500" />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Restrito</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                id="creator-password"
                type="password"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(''); }}
                className="block w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs text-slate-300 text-center placeholder:text-slate-600 transition-colors focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                placeholder=""
                autoFocus
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-300"
            >
              Entrar
            </button>

            <div className="pt-2 space-y-1.5">
              <p className="text-[9px] text-slate-600 text-center uppercase tracking-wider">Acessos disponíveis</p>
              {USERS.map((u) => (
                <div key={u.role} className="flex items-center gap-2 text-[10px] text-slate-500 justify-center">
                  {u.role === 'admin' ? <Shield className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{u.label}</span>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-center text-[10px] text-red-500/70"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
