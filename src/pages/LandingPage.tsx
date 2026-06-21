import { motion } from 'framer-motion';
import { ArrowRight, Copy, Shield, Clock, LayoutDashboard } from 'lucide-react';
import { useNavigate } from '../hooks/useNavigate';
import { isMentorAuthenticated } from '../utils/storage';

export function LandingPage() {
  const navigate = useNavigate();

  const copyFormLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/form`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copiado! Compartilhe com seus alunos.');
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('Link copiado! Compartilhe com seus alunos.');
    }
  };

  const isMentor = isMentorAuthenticated();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/20">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md">
              F
            </div>
            <span className="text-sm sm:text-base font-bold text-slate-800">Fernanda Concursos</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isMentor && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('mentor')}
                className="btn-ghost text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Painel do Mentor</span>
                <span className="sm:hidden">Painel</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyFormLink}
              className="btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
            >
              <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Copiar Link</span>
            </motion.button>
          </div>
        </nav>

        <main className="flex-1 mt-16 sm:mt-24 md:mt-32">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
                Seu Planejamento
              </span>
              <br />
              <span>Começa Aqui</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-slate-600"
            >
              Responda ao nosso questionário de diagnóstico e receba um plano de estudos
              personalizado, elaborado exclusivamente para sua aprovação no concurso dos seus sonhos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('form')}
                className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 shadow-lg shadow-indigo-200"
              >
                Iniciar Questionário
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400"
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Leva menos de 5 minutos
            </motion.div>
          </div>

        </main>

        <footer className="mt-8 sm:mt-12 border-t border-slate-200/60 pt-3 sm:pt-6 pb-4 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[9px] sm:text-[10px] text-slate-300">
              Mentoria Fernanda Concursos &copy; {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('mentor')}
                className="text-[9px] sm:text-[10px] text-slate-300 hover:text-slate-500 transition-colors"
              >
                painel
              </button>
              <button
                onClick={() => navigate('creator')}
                className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-slate-500 transition-colors"
                title="Acesso restrito"
              >
                <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
