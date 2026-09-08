import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Home, LogOut, PenLine, Search, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/checkAuthSlice';
import { useSearchPreview } from '../../hooks/useSearchPreview';

export interface NavbarProps {
  isAuthenticated?: boolean;
  role: 'user' | 'admin';
  onToggleRole: () => void;
}

export function Navbar({ isAuthenticated = true, role, onToggleRole }: NavbarProps) {
  const dispatch = useAppDispatch()

  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { results: previewResults, loading: previewLoading } = useSearchPreview(query);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';

  const navLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-display font-semibold text-sm transition-colors ${location.pathname === path ? 'bg-coral text-coral-deep' : 'text-ink-soft hover:bg-surface-tint hover:text-ink'
    }`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
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
          <div ref={searchRef} className="relative">
            <div className="flex items-center gap-1.5 bg-surface-tint rounded-lg px-3 py-[7px] border border-border focus-within:border-coral">
              <Search size={15} strokeWidth={1.75} className="text-ink-soft" />
              <input
                type="text"
                name="navbar-search"
                autoComplete="off"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search"
                className="bg-transparent border-none outline-none w-[120px] max-[760px]:w-20 text-ink placeholder:text-ink-soft"
              />
            </div>

            {showDropdown && query.trim().length >= 2 && (
              <div className="absolute top-[calc(100%+8px)] right-0 w-[320px] bg-surface border border-border rounded-xl overflow-hidden z-50">
                {previewLoading ? (
                  <p className="text-sm text-ink-soft px-4 py-3.5 m-0">Searching…</p>
                ) : previewResults.length ? (
                  <>
                    <p className="text-[12.5px] text-ink-soft px-4 pt-3 pb-1.5 m-0">
                      {previewResults.length} result{previewResults.length === 1 ? '' : 's'}
                    </p>
                    {previewResults.map((post) => (
                      <Link
                        key={post.id}
                        to={`/post/${post.slug}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex flex-col gap-0.5 px-4 py-2.5 border-t border-border hover:bg-surface-tint"
                      >
                        <span className="font-display font-bold text-sm text-ink truncate">{post.title}</span>
                        <span className="text-[12.5px] text-ink-soft truncate">{post.excerpt}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/search?q=${encodeURIComponent(query.trim())}`}
                      onClick={() => setShowDropdown(false)}
                      className="block text-center text-[13px] font-display font-semibold text-coral px-4 py-2.5 border-t border-border hover:bg-surface-tint"
                    >
                      See all results
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-ink-soft px-4 py-3.5 m-0">No results found.</p>
                )}
              </div>
            )}
          </div>

          {isAuthenticated && user ? (
            <>
              {isAdmin && (
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
              )}
              <Link to={`/profile/${user.id}`} title={user.display_name}>
                <Avatar user={user.display_name} size={34} />
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
