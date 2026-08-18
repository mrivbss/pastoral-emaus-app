import { ArrowLeft, CalendarDays, Edit3, Mail, MapPin, MessageCircle, Phone, Plus, Trash2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { MemberFormModal } from '../components/admin/MemberFormModal'
import { PaymentModal } from '../components/admin/PaymentModal'
import { WhatsAppModal } from '../components/admin/WhatsAppModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingScreen } from '../components/common/LoadingScreen'
import { AppHeader } from '../components/layout/AppHeader'
import { MONTHS } from '../config/app'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getIntegrante, updateIntegrante } from '../services/integrantes'
import { createPago, deletePago, listPagos, updatePago } from '../services/pagos'
import { signOut } from '../services/auth'
import type { Integrante, IntegranteInput, Pago } from '../types'
import { friendlyError } from '../utils/errors'
import { formatCurrency, formatDate } from '../utils/format'

export function MemberProfilePage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedYear = Number(searchParams.get('year'))
  const [year, setYear] = useState(Number.isInteger(requestedYear) ? requestedYear : new Date().getFullYear())
  const [member, setMember] = useState<Integrante | null>(null)
  const [payments, setPayments] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingMember, setEditingMember] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [whatsAppMonth, setWhatsAppMonth] = useState<number | null>(null)
  const [paymentToDelete, setPaymentToDelete] = useState<Pago | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { session } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [nextMember, nextPayments] = await Promise.all([getIntegrante(id), listPagos(year, id)])
      setMember(nextMember)
      setPayments(nextPayments)
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setLoading(false)
    }
  }, [id, year])

  useEffect(() => { void load() }, [load])

  const changeYear = (nextYear: number) => {
    setYear(nextYear)
    setSearchParams({ year: String(nextYear) }, { replace: true })
  }

  const saveMember = async (input: IntegranteInput) => {
    if (!member) return
    await updateIntegrante(member.id, input)
    showToast('Integrante actualizado.', 'success')
    await load()
  }

  const selectedPayment = selectedMonth ? payments.find((payment) => payment.mes === selectedMonth) || null : null

  const savePayment = async (input: { monto: number; fecha_pago: string }) => {
    if (!member || !selectedMonth) return
    if (selectedPayment) await updatePago(selectedPayment.id, input)
    else await createPago({ integrante_id: member.id, anio: year, mes: selectedMonth, ...input })
    showToast(selectedPayment ? 'Pago actualizado.' : 'Pago registrado.', 'success')
    await load()
  }

  const removePayment = async () => {
    if (!paymentToDelete) return
    setDeleting(true)
    try {
      await deletePago(paymentToDelete.id)
      showToast('Pago anulado.', 'success')
      setPaymentToDelete(null)
      await load()
    } catch (caught) {
      showToast(friendlyError(caught), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-page">
      <AppHeader admin userEmail={session?.user.email} onSignOut={() => void handleSignOut()} />
      <main className="container profile-page">
        <Link className="back-link" to={`/admin`}><ArrowLeft size={18} /> Volver al dashboard</Link>
        {loading ? <LoadingScreen /> : error || !member ? (
          <div className="error-panel"><p>{error || 'No se encontró el integrante.'}</p><button className="button button--ghost" onClick={() => void load()}>Reintentar</button></div>
        ) : (
          <>
            <section className="profile-header-card">
              <span className="profile-avatar"><UserRound size={34} /></span>
              <div className="profile-title"><p>Perfil del integrante</p><h1>{member.nombre}</h1><span className={`member-status member-status--${member.estado.toLowerCase()}`}>{member.estado}</span></div>
              <button className="button button--ghost" onClick={() => setEditingMember(true)}><Edit3 size={17} /> Editar datos</button>
            </section>

            <section className="profile-details">
              <div><span>RUT</span><strong>{member.rut}</strong></div>
              <div><span><Phone size={15} /> Teléfono</span><strong>{member.telefono || 'Sin registrar'}</strong></div>
              <div><span><Mail size={15} /> Correo</span><strong>{member.email || 'Sin registrar'}</strong></div>
              <div><span><CalendarDays size={15} /> Fecha de ingreso</span><strong>{formatDate(member.fecha_ingreso)}</strong></div>
              <div><span><MapPin size={15} /> Dirección / comuna</span><strong>{member.direccion || 'Sin registrar'}</strong></div>
              {member.observaciones && <div className="profile-details__wide"><span>Observaciones</span><p>{member.observaciones}</p></div>}
            </section>

            <section className="payment-history">
              <div className="section-toolbar">
                <div><h2>Historial de cuotas</h2><p>Pagado: {formatCurrency(payments.reduce((sum, payment) => sum + payment.monto, 0))} en {year}</p></div>
                <label className="year-control"><span>Año</span><input type="number" min="2020" max="2100" value={year} onChange={(event) => changeYear(Number(event.target.value))} /></label>
              </div>
              <div className="history-list">
                {MONTHS.map((month, index) => {
                  const payment = payments.find((item) => item.mes === index + 1)
                  return (
                    <article className="history-row" key={month}>
                      <div><strong>{month} {year}</strong>{payment && <small>{formatCurrency(payment.monto)} · {formatDate(payment.fecha_pago)}</small>}</div>
                      <span className={payment ? 'status status--paid' : 'status status--pending'}>{payment ? 'Pagado' : 'Pendiente'}</span>
                      <div className="history-row__actions">
                        <button className={payment ? 'button button--small button--ghost' : 'button button--small button--success'} onClick={() => setSelectedMonth(index + 1)}>{payment ? <><Edit3 size={16} /> Editar</> : <><Plus size={16} /> Registrar</>}</button>
                        <button className="icon-button icon-button--whatsapp" onClick={() => setWhatsAppMonth(index + 1)} aria-label={`Enviar mensaje de ${month}`}><MessageCircle size={18} /></button>
                        {payment && <button className="icon-button icon-button--danger" onClick={() => setPaymentToDelete(payment)} aria-label={`Anular pago de ${month}`}><Trash2 size={17} /></button>}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>
      <MemberFormModal open={editingMember} member={member} onClose={() => setEditingMember(false)} onSave={saveMember} />
      <PaymentModal open={selectedMonth !== null} member={member} payment={selectedPayment} month={selectedMonth || 1} year={year} onClose={() => setSelectedMonth(null)} onSave={savePayment} onDelete={selectedPayment ? () => { setPaymentToDelete(selectedPayment); setSelectedMonth(null) } : undefined} />
      <WhatsAppModal open={whatsAppMonth !== null} member={member} month={whatsAppMonth || 1} year={year} paid={Boolean(whatsAppMonth && payments.some((payment) => payment.mes === whatsAppMonth))} onClose={() => setWhatsAppMonth(null)} />
      <ConfirmDialog open={Boolean(paymentToDelete)} title="Anular pago" message={`Se eliminará el pago de ${member?.nombre || ''}. Esta acción no se puede deshacer.`} confirmLabel="Anular pago" busy={deleting} onClose={() => setPaymentToDelete(null)} onConfirm={() => void removePayment()} />
    </div>
  )
}
