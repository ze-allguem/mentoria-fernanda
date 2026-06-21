export function useNavigate() {
  return (path: string) => {
    window.location.hash = path === '' ? '/' : `/${path}`;
  };
}
