import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PenLine, User } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';

// Icon-only, app-style bottom tab bar. Only rendered below the 760px
// breakpoint (see Layout.tsx) — desktop keeps the existing top Navbar links.
export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = !!user;

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const iconClass = (active: boolean) =>
    `flex items-center justify-center w-11 h-11 rounded-xl transition-colors ${
      active ? 'text-coral bg-coral-light' : 'text-ink-soft'
    }`;

  const goToProfile = () => {
    if (isAuthenticated) navigate(`/profile/${user.id}`);
    else navigate('/signin');
  };

  return (
    <nav
      className="min-[761px]:hidden fixed bottom-0 inset-x-0 z-50 bg-bg/95 backdrop-blur-sm border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        <Link to="/" aria-label="Home" className={iconClass(isActive('/'))}>
          <Home size={22} strokeWidth={1.75} />
        </Link>

        <Link to="/search" aria-label="Search" className={iconClass(isActive('/search'))}>
          <Search size={22} strokeWidth={1.75} />
        </Link>

        <Link
          to={isAuthenticated ? '/write' : '/signin'}
          aria-label="Write"
          className={iconClass(isActive('/write'))}
        >
          <PenLine size={22} strokeWidth={1.75} />
        </Link>

        <button
          onClick={goToProfile}
          aria-label="Profile"
          className={iconClass(isActive('/profile'))}
        >
          <User size={22} strokeWidth={1.75} />
        </button>
      </div>
    </nav>
  );
}
