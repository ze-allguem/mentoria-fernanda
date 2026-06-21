import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Terminal, Eye, Shield } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';
import { setMentorAuth, signInWithGoogle, UserRole } from '../utils/storage';

const USERS: { email: string; role: UserRole; label: string }[] = [
  { email: 'josealves606@gmail.com', role: 'admin', label: 'Admin' },
  { email: 'fernandavargas123', role: 'viewer', label: 'Fernanda' },
];

export function CreatorPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (result.success) {
      const redirect = localStorage.getItem('redirectAfterAuth');
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirect || 'mentor');
    } else if (result.error) {
      setError(result.error);
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
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900/80 px-2 text-[10px] text-slate-600">ou</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Aguarde...' : 'Entrar com Google'}
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
        </div>
      </motion.div>
    </div>
  );
}
