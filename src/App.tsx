import { useState, useEffect, useRef } from 'react';
import { LandingPage } from './pages/LandingPage';
import { FormPage } from './pages/FormPage';
import { MentorPanel } from './pages/MentorPanel';
import { StudentDetail } from './pages/StudentDetail';
import { AuthPage } from './pages/AuthPage';
import { CreatorPage } from './pages/CreatorPage';
import { RespondentsPage } from './pages/RespondentsPage';
import { ReceiptsControlPage } from './pages/ReceiptsControlPage';
import { isMentorAuthenticated, updateLastActivity } from './utils/storage';

type Route = 'landing' | 'form' | 'auth' | 'mentor' | 'student' | 'creator' | 'respondents' | 'receipts';
const PUBLIC_ROUTES: Route[] = ['landing', 'form', 'creator', 'auth'];

function getRouteFromHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  if (hash.startsWith('/form')) return 'form';
  if (hash.startsWith('/auth')) return 'auth';
  if (hash.startsWith('/mentor')) return 'mentor';
  if (hash.startsWith('/aluno/')) return 'student';
  if (hash.startsWith('/creator')) return 'creator';
  if (hash.startsWith('/respondents')) return 'respondents';
  if (hash.startsWith('/receipts')) return 'receipts';
  if (hash === '/') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('form') === '1') return 'form';
  }
  return 'landing';
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromHash());
  const redirecting = useRef(false);
  const activityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!PUBLIC_ROUTES.includes(route) && !isMentorAuthenticated()) {
      localStorage.setItem('redirectAfterAuth', route);
      redirecting.current = true;
      window.location.hash = '/creator';
    }
  }, [route]);

  /* Track user activity to extend session */
  useEffect(() => {
    const handleActivity = () => {
      clearTimeout(activityTimer.current);
      activityTimer.current = setTimeout(() => updateLastActivity(), 500);
    };
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearTimeout(activityTimer.current);
    };
  }, []);

  const isAuth = isMentorAuthenticated();
  const effectiveRoute = PUBLIC_ROUTES.includes(route) || isAuth ? route : 'creator';

  switch (effectiveRoute) {
    case 'form': return <FormPage />;
    case 'auth': return <AuthPage />;
    case 'mentor': return <MentorPanel />;
    case 'student': return <StudentDetail />;
    case 'creator': return <CreatorPage />;
    case 'respondents': return <RespondentsPage />;
    case 'receipts': return <ReceiptsControlPage />;
    default: return <LandingPage />;
  }
}
