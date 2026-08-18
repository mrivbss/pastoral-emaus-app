import { LogIn, LogOut, ShieldCheck } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { APP_NAME, MONTHLY_FEE } from '../../config/app'
import { formatCurrency } from '../../utils/format'

interface AppHeaderProps {
  admin?: boolean
  userEmail?: string
  onSignOut?: () => void
}

export function AppHeader({ admin = false, userEmail, onSignOut }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="brand" to={admin ? '/admin' : '/'} aria-label="Inicio">
          <img src={logo} alt="Logo Emaús Varones P.S.A.H. Talca" />
          <div>
            <span className="brand__eyebrow">Pastoral</span>
            <strong>{APP_NAME.replace('Pastoral ', '')}</strong>
            {!admin && <small>Cuota mensual {formatCurrency(MONTHLY_FEE)}</small>}
          </div>
        </Link>
        {admin ? (
          <div className="admin-session">
            <span title={userEmail}>
              <ShieldCheck size={18} /> Administración
            </span>
            <button className="button button--header" onClick={onSignOut}>
              <LogOut size={18} /> <span>Salir</span>
            </button>
          </div>
        ) : (
          <nav className="public-nav" aria-label="Navegación principal">
            <NavLink to="/registro">Inscribirme</NavLink>
            <NavLink to="/admin/login" aria-label="Acceso administrativo">
              <LogIn size={17} /> <span>Administración</span>
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  )
}
