import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { ChatWidget } from '../chat/ChatWidget';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleRole } from '../../features/users/usersSlice';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

export function Layout() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.users.currentRole);
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;
  const location = useLocation();
  useSmoothScroll();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isAuthenticated={isAuthenticated}
        role={role}
        onToggleRole={() => dispatch(toggleRole())}
      />
      {/* Bottom nav is fixed/16 (64px) tall on mobile — pad so it never
          covers page content, especially the last item in a list. Keying
          on pathname re-triggers the enter animation on every navigation,
          giving route changes a soft fade+rise instead of an instant swap. */}
      <div className="flex-1 max-[760px]:pb-20">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </div>
      <Footer />
      <ChatWidget />
      <BottomNav />
    </div>
  );
}
