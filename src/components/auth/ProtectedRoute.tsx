import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingScreen } from '../common/LoadingScreen'
import { signOut } from '../../services/auth'

export function ProtectedRoute() {
  const { session, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="Comprobando sesión…" />
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) {
    return (
      <main className="access-denied">
        <h1>Cuenta sin acceso administrativo</h1>
        <p>La sesión es válida, pero esta cuenta no figura en la lista de administradores autorizados.</p>
        <button className="button button--primary" onClick={() => void signOut()}>Cerrar sesión</button>
      </main>
    )
  }
  return <Outlet />
}
