import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoadingScreen } from './components/common/LoadingScreen'
import { OfflineBanner } from './components/common/OfflineBanner'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './context/ToastProvider'

const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const MemberProfilePage = lazy(() => import('./pages/MemberProfilePage').then((module) => ({ default: module.MemberProfilePage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const PublicHomePage = lazy(() => import('./pages/PublicHomePage').then((module) => ({ default: module.PublicHomePage })))
const RegistrationPage = lazy(() => import('./pages/RegistrationPage').then((module) => ({ default: module.RegistrationPage })))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<PublicHomePage />} />
              <Route path="/registro" element={<RegistrationPage />} />
              <Route path="/admin/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/integrantes/:id" element={<MemberProfilePage />} />
              </Route>
              <Route path="/login" element={<Navigate to="/admin/login" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
