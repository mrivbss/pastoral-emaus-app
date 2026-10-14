import { Download, HandHeart, Plus, RefreshCw, TrendingUp, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DonationFormModal } from '../components/admin/DonationFormModal'
import { DonationList } from '../components/admin/DonationList'
import { IncomeFormModal } from '../components/admin/IncomeFormModal'
import { IncomeList } from '../components/admin/IncomeList'
import { MemberCard } from '../components/admin/MemberCard'
import { MemberFilters, type PaymentFilter, type StatusFilter } from '../components/admin/MemberFilters'
import { MemberFormModal } from '../components/admin/MemberFormModal'
import { MonthYearSelector } from '../components/admin/MonthYearSelector'
import { PaymentModal } from '../components/admin/PaymentModal'
import { ReceiptModal } from '../components/admin/ReceiptModal'
import { StatsGrid } from '../components/admin/StatsGrid'
import { WhatsAppModal } from '../components/admin/WhatsAppModal'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { LoadingScreen } from '../components/common/LoadingScreen'
import { AppHeader } from '../components/layout/AppHeader'
import { TransferCard } from '../components/TransferCard'
import { useAdminData } from '../hooks/useAdminData'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { signOut } from '../services/auth'
import { createDonacion, deleteDonacion, updateDonacion } from '../services/donaciones'
import { createIngresosBatch, deleteIngreso, updateIngreso } from '../services/ingresos'
import { createIntegrante, deleteIntegrante, updateIntegrante } from '../services/integrantes'
import { createPago, deletePago, listAllPagos, updatePago } from '../services/pagos'
import type { Donacion, DonacionInput, Ingreso, IngresoInput, Integrante, IntegranteInput, Pago, PeriodFilter } from '../types'
import { friendlyError } from '../utils/errors'
import { exportIngresosCsv, exportJsonBackup, exportPaymentsCsv } from '../utils/export'
import { normalizeRut } from '../utils/rut'

type AdminTab = 'integrantes' | 'ingresos' | 'donaciones' | 'transferencia'
type ConfirmTarget =
  | { kind: 'member'; item: Integrante }
  | { kind: 'payment'; item: Pago; memberName: string }
  | { kind: 'donation'; item: Donacion }
  | { kind: 'income'; item: Ingreso }

const confirmCopyFor = (target: ConfirmTarget | null) => {
  if (!target) return { title: '', message: '', label: '' }
  if (target.kind === 'member') {
    return {
      title: 'Eliminar servidor',
      message: `Se eliminará a ${target.item.nombre} y todo su historial de pagos. Esta acción no se puede deshacer.`,
      label: 'Eliminar servidor',
    }
  }
  if (target.kind === 'payment') {
    return {
      title: 'Anular pago',
      message: `Se eliminará el pago registrado de ${target.memberName}. Esta acción no se puede deshacer.`,
      label: 'Anular pago',
    }
  }
  if (target.kind === 'income') {
    return {
      title: 'Eliminar movimiento',
      message: `Se eliminará el movimiento N° ${target.item.folio}, [#${String(target.item.codigo_concepto).padStart(2, '0')}] ${target.item.concepto}, por $${target.item.monto_total.toLocaleString('es-CL')}.`,
      label: 'Eliminar movimiento',
    }
  }
  const donationDescription = target.item.es_monetaria !== false
    ? `por $${target.item.monto.toLocaleString('es-CL')}`
    : `correspondiente a “${target.item.detalle_tangible || 'donación tangible'}”`
  return {
    title: 'Eliminar donación',
    message: `Se eliminará el aporte de ${target.item.nombre_donante} ${donationDescription}.`,
    label: 'Eliminar donación',
  }
}

export function AdminDashboardPage() {
  const now = new Date()
  const [period, setPeriod] = useState<PeriodFilter>({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [tab, setTab] = useState<AdminTab>('integrantes')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('Todos')
  const [memberModal, setMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Integrante | null>(null)
  const [paymentSelection, setPaymentSelection] = useState<{ member: Integrante; payment: Pago | null } | null>(null)
  const [whatsAppMember, setWhatsAppMember] = useState<Integrante | null>(null)
  const [donationModal, setDonationModal] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donacion | null>(null)
  const [incomeModal, setIncomeModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Ingreso | null>(null)
  const [receiptIncome, setReceiptIncome] = useState<Ingreso | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [backingUp, setBackingUp] = useState(false)
  const { session } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { members, payments, donations, incomes, loading, error, refresh } = useAdminData(period.year)

  const monthlyPayments = payments.filter((payment) => payment.mes === period.month)
  const activeMembers = members.filter((member) => member.estado === 'Activo')
  const paidActive = activeMembers.filter((member) => monthlyPayments.some((payment) => payment.integrante_id === member.id))
  const monthPrefix = `${period.year}-${String(period.month).padStart(2, '0')}`
  const monthlyDonations = donations.filter(
    (donation) => donation.fecha.startsWith(monthPrefix) && donation.es_monetaria !== false,
  )

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es')
    const normalizedTerm = normalizeRut(search)
    return members.filter((member) => {
      const matchesSearch = !term || member.nombre.toLocaleLowerCase('es').includes(term) || (normalizedTerm && normalizeRut(member.rut).includes(normalizedTerm))
      const matchesStatus = statusFilter === 'Todos' || member.estado === statusFilter
      const paid = monthlyPayments.some((payment) => payment.integrante_id === member.id)
      const matchesPayment = paymentFilter === 'Todos' || (paymentFilter === 'Pagado' ? paid : !paid)
      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [members, monthlyPayments, paymentFilter, search, statusFilter])

  const saveMember = async (input: IntegranteInput) => {
    if (editingMember) await updateIntegrante(editingMember.id, input)
    else await createIntegrante(input)
    showToast(editingMember ? 'Servidor actualizado.' : 'Servidor creado.', 'success')
    await refresh()
  }

  const savePayment = async (input: { monto: number; fecha_pago: string }) => {
    if (!paymentSelection) return
    if (paymentSelection.payment) await updatePago(paymentSelection.payment.id, input)
    else await createPago({ integrante_id: paymentSelection.member.id, anio: period.year, mes: period.month, ...input })
    showToast(paymentSelection.payment ? 'Pago actualizado.' : 'Pago registrado.', 'success')
    await refresh()
  }

  const saveDonation = async (input: DonacionInput) => {
    if (editingDonation) await updateDonacion(editingDonation.id, input)
    else await createDonacion(input)
    showToast(editingDonation ? 'Donación actualizada.' : 'Donación registrada.', 'success')
    await refresh()
  }

  const saveIncome = async (inputs: IngresoInput[]) => {
    if (editingIncome) {
      if (inputs.length !== 1) throw new Error('Solo se puede editar un movimiento a la vez.')
      await updateIngreso(editingIncome.id, inputs[0])
      showToast('Movimiento actualizado.', 'success')
    } else {
      await createIngresosBatch(inputs)
      showToast(inputs.length === 1 ? 'Movimiento registrado.' : `${inputs.length} movimientos registrados.`, 'success')
    }
    await refresh()
  }

  const confirmCopy = confirmCopyFor(confirmTarget)

  const removeConfirmed = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      if (confirmTarget.kind === 'member') await deleteIntegrante(confirmTarget.item.id)
      if (confirmTarget.kind === 'payment') await deletePago(confirmTarget.item.id)
      if (confirmTarget.kind === 'donation') await deleteDonacion(confirmTarget.item.id)
      if (confirmTarget.kind === 'income') await deleteIngreso(confirmTarget.item.id)
      showToast(confirmTarget.kind === 'payment' ? 'Pago anulado.' : 'Registro eliminado.', 'success')
      setConfirmTarget(null)
      await refresh()
    } catch (caught) {
      showToast(friendlyError(caught), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/admin/login', { replace: true })
    } catch (caught) {
      showToast(friendlyError(caught), 'error')
    }
  }

  const downloadFullBackup = async () => {
    setBackingUp(true)
    try {
      const allPayments = await listAllPagos()
      exportJsonBackup(members, allPayments, donations, incomes)
      showToast('Respaldo JSON generado.', 'success')
    } catch (caught) {
      showToast(friendlyError(caught), 'error')
    } finally {
      setBackingUp(false)
    }
  }

  return (
    <div className="admin-page">
      <AppHeader admin userEmail={session?.user.email} onSignOut={handleSignOut} />
      <main className="container admin-main">
        <div className="dashboard-heading">
          <div><p>Panel administrativo</p><h1>Cuotas y aportes</h1></div>
          <MonthYearSelector value={period} onChange={setPeriod} />
        </div>
        <StatsGrid
          activeMembers={activeMembers.length}
          paid={paidActive.length}
          pending={Math.max(activeMembers.length - paidActive.length, 0)}
          collected={monthlyPayments.reduce((sum, payment) => sum + payment.monto, 0)}
          donations={monthlyDonations.reduce((sum, donation) => sum + donation.monto, 0)}
        />

        <nav className="admin-tabs" aria-label="Secciones administrativas">
          <button className={tab === 'integrantes' ? 'is-active' : ''} onClick={() => setTab('integrantes')}><UsersRound size={19} /> Servidores</button>
          <button className={tab === 'ingresos' ? 'is-active' : ''} onClick={() => setTab('ingresos')}><TrendingUp size={19} /> Ingresos</button>
          <button className={tab === 'donaciones' ? 'is-active' : ''} onClick={() => setTab('donaciones')}><HandHeart size={19} /> Donaciones</button>
          <button className={tab === 'transferencia' ? 'is-active' : ''} onClick={() => setTab('transferencia')}>Datos bancarios</button>
        </nav>

        {error && <div className="error-panel" role="alert"><p>{error}</p><button className="button button--ghost" onClick={() => void refresh()}><RefreshCw size={17} /> Reintentar</button></div>}
        {loading && members.length === 0 && donations.length === 0 && incomes.length === 0 ? <LoadingScreen /> : (
          <>
            {tab === 'integrantes' && (
              <section className="admin-section">
                <div className="section-toolbar">
                  <div><h2>Servidores</h2><p>{filteredMembers.length} de {members.length} registros</p></div>
                  <div className="toolbar-actions">
                    <button className="button button--ghost" onClick={() => exportPaymentsCsv(members, payments, period.year)}><Download size={18} /> CSV {period.year}</button>
                    <button className="button button--ghost" disabled={backingUp} onClick={() => void downloadFullBackup()}><Download size={18} /> {backingUp ? 'Generando…' : 'Respaldo JSON'}</button>
                    <button className="button button--primary" onClick={() => { setEditingMember(null); setMemberModal(true) }}><Plus size={19} /> Nuevo servidor</button>
                  </div>
                </div>
                <MemberFilters search={search} status={statusFilter} payment={paymentFilter} onSearch={setSearch} onStatus={setStatusFilter} onPayment={setPaymentFilter} />
                {filteredMembers.length ? (
                  <div className="member-grid">
                    {filteredMembers.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        payments={payments.filter((payment) => payment.integrante_id === member.id)}
                        month={period.month}
                        year={period.year}
                        onPay={(item, payment) => setPaymentSelection({ member: item, payment })}
                        onWhatsApp={setWhatsAppMember}
                        onEdit={(item) => { setEditingMember(item); setMemberModal(true) }}
                        onDelete={(item) => setConfirmTarget({ kind: 'member', item })}
                      />
                    ))}
                  </div>
                ) : <div className="empty-state"><UsersRound size={38} /><h3>No encontramos servidores</h3><p>Ajusta los filtros o agrega un nuevo servidor.</p></div>}
              </section>
            )}
            {tab === 'ingresos' && (
              <section className="admin-section">
                <div className="section-toolbar">
                  <div><h2>Control de ingresos y egresos</h2><p>{incomes.length} movimientos registrados</p></div>
                  <div className="toolbar-actions">
                    <button className="button button--ghost" onClick={() => exportIngresosCsv(incomes)}><Download size={18} /> Exportar CSV</button>
                    <button className="button button--primary" onClick={() => { setEditingIncome(null); setIncomeModal(true) }}><Plus size={19} /> Registrar movimiento</button>
                  </div>
                </div>
                <IncomeList
                  incomes={incomes}
                  onReceipt={setReceiptIncome}
                  onEdit={(item) => { setEditingIncome(item); setIncomeModal(true) }}
                  onDelete={(item) => setConfirmTarget({ kind: 'income', item })}
                />
              </section>
            )}
            {tab === 'donaciones' && (
              <section className="admin-section">
                <div className="section-toolbar">
                  <div><h2>Registro de donaciones</h2><p>Aportes monetarios y tangibles recibidos por la pastoral</p></div>
                  <button className="button button--gold" onClick={() => { setEditingDonation(null); setDonationModal(true) }}><Plus size={19} /> Registrar donación</button>
                </div>
                <DonationList donations={donations} onEdit={(item) => { setEditingDonation(item); setDonationModal(true) }} onDelete={(item) => setConfirmTarget({ kind: 'donation', item })} />
              </section>
            )}
            {tab === 'transferencia' && <div className="admin-section"><TransferCard /></div>}
          </>
        )}
      </main>

      <MemberFormModal open={memberModal} member={editingMember} onClose={() => setMemberModal(false)} onSave={saveMember} />
      <PaymentModal
        open={Boolean(paymentSelection)} member={paymentSelection?.member || null} payment={paymentSelection?.payment || null}
        month={period.month} year={period.year} onClose={() => setPaymentSelection(null)} onSave={savePayment}
        onDelete={paymentSelection?.payment ? () => {
          setConfirmTarget({ kind: 'payment', item: paymentSelection.payment as Pago, memberName: paymentSelection.member.nombre })
          setPaymentSelection(null)
        } : undefined}
      />
      <WhatsAppModal open={Boolean(whatsAppMember)} member={whatsAppMember} month={period.month} year={period.year} paid={Boolean(whatsAppMember && monthlyPayments.some((payment) => payment.integrante_id === whatsAppMember.id))} onClose={() => setWhatsAppMember(null)} />
      <DonationFormModal open={donationModal} donation={editingDonation} onClose={() => setDonationModal(false)} onSave={saveDonation} />
      <IncomeFormModal open={incomeModal} income={editingIncome} onClose={() => setIncomeModal(false)} onSave={saveIncome} />
      <ReceiptModal open={Boolean(receiptIncome)} income={receiptIncome} onClose={() => setReceiptIncome(null)} />
      <ConfirmDialog open={Boolean(confirmTarget)} title={confirmCopy.title} message={confirmCopy.message} confirmLabel={confirmCopy.label} busy={deleting} onClose={() => setConfirmTarget(null)} onConfirm={() => void removeConfirmed()} />
    </div>
  )
}
