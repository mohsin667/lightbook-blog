import { useAppSelector } from "../app/hooks";
import { Navigate, useLocation } from 'react-router-dom'

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const location = useLocation()
    const from = location.state?.from || '/'
    const { user, status } = useAppSelector((state) => state.auth)
    if (status === 'loading' || status === 'idle') return null
    if (user) return <Navigate to={from} replace />
    return children
}

export default PublicOnlyRoute