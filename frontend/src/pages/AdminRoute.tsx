import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, status } = useAppSelector((state) => state.auth);
  if (status === 'loading' || status === 'idle') return null;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default AdminRoute;
