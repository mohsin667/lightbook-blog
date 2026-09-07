import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleRole } from '../../features/users/usersSlice';

export function Layout() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.users.currentRole);
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isAuthenticated={isAuthenticated}
        role={role}
        onToggleRole={() => dispatch(toggleRole())}
      />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
