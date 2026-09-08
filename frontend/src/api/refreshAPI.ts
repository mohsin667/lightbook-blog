const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const NO_REFRESH = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"]

const refreshAPI = async (path: string, options: RequestInit = {}): Promise<Response> => {
    const url = `${API_BASE}${path}`
    const res = await fetch(url, { credentials: 'include', ...options })
    const skipRefresh = NO_REFRESH.some((p) => path.endsWith(p))
    if (res.status === 401 && !skipRefresh) {
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
        if (refreshRes.ok) {
            return await fetch(url, { credentials: 'include', ...options })
        }
    }
    return res
}
export default refreshAPI