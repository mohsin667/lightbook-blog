import { useAppSelector } from "../app/hooks";
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, status } = useAppSelector((state) => state.auth)
    if (status === 'loading' || status === 'idle') return null
    if (!user) return <Navigate to="/signin" state={{ from: location.pathname }} replace />
    return children
}

export default ProtectedRoute