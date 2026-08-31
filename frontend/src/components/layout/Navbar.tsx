import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Home, LogOut, PenLine, Search, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { currentUser } from '../../data/mockData';
import { useAppDispatch } from '../../app/hooks';
import { logoutUser } from '../../features/auth/checkAuthSlice';

export interface NavbarProps {
  isAuthenticated?: boolean;
  role: 'user' | 'admin';
  onToggleRole: () => void;
}

export function Navbar({ isAuthenticated = true, role, onToggleRole }: NavbarProps) {
  const dispatch = useAppDispatch()

  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const user = currentUser();

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-display font-semibold text-sm transition-colors ${location.pathname === path ? 'bg-coral text-coral-deep' : 'text-ink-soft hover:bg-surface-tint hover:text-ink'
    }`;

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate(`/`);
  }

  return (
    <div className="sticky top-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1080px] mx-auto flex items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-display font-bold whitespace-nowrap">
          <PenLine size={20} strokeWidth={1.75} className="text-coral" />
          lightbook<span className="text-coral">.info</span>
        </Link>

        {isAuthenticated && (
          <div className="hidden min-[761px]:flex items-center gap-0.5 flex-1 justify-center">
            <Link to="/" className={navLinkClass('/')}>
              <Home size={16} strokeWidth={1.75} />
              Home
            </Link>
            <Link to="/write" className={navLinkClass('/write')}>
              <PenLine size={16} strokeWidth={1.75} />
              Write
            </Link>
            {role === 'admin' ? (
              <Link to="/admin" className={navLinkClass('/admin')}>
                <ShieldCheck size={16} strokeWidth={1.75} />
                Admin
              </Link>
            ) : (
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                <BarChart3 size={16} strokeWidth={1.75} />
                Dashboard
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-surface-tint rounded-lg px-3 py-[7px] border border-border focus-within:border-coral">
            <Search size={15} strokeWidth={1.75} className="text-ink-soft" />
            <input
              type="text"
              name="navbar-search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search"
              className="bg-transparent border-none outline-none w-[120px] max-[760px]:w-20 text-ink placeholder:text-ink-soft"
            />
          </div>

          {isAuthenticated ? (
            <>
              <button
                onClick={onToggleRole}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-[7px] font-display font-semibold text-[13px] border transition-colors ${role === 'admin'
                  ? 'bg-coral text-coral-deep border-coral'
                  : 'bg-surface-tint text-ink border-border'
                  }`}
              >
                <ArrowLeftRight size={14} strokeWidth={1.75} />
                {role === 'admin' ? 'Admin view' : 'Reading as you'}
              </button>
              <Link to={`/profile/${user.id}`} title={user.name}>
                <Avatar user={user} size={34} />
              </Link>
              <Button size="sm" variant="ghost" onClick={handleLogout} title="Sign out">
                <LogOut size={15} strokeWidth={1.75} />
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button size="sm">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" variant="primary">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
