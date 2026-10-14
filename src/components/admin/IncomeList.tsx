import { Edit3, FileText, ReceiptText, Trash2, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import { useMemo } from 'react'
import type { Ingreso } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'

interface IncomeListProps {
  incomes: Ingreso[]
  onReceipt: (income: Ingreso) => void
  onEdit: (income: Ingreso) => void
  onDelete: (income: Ingreso) => void
}

export function IncomeList({ incomes, onReceipt, onEdit, onDelete }: IncomeListProps) {
  const summary = useMemo(() => {
    const totalIncome = incomes
      .filter((income) => income.tipo === 'Ingreso')
      .reduce((sum, income) => sum + income.monto_total, 0)
    const totalExpense = incomes
      .filter((income) => income.tipo === 'Egreso')
      .reduce((sum, income) => sum + income.monto_total, 0)
    const totals = new Map<string, { code: number; concept: string; type: Ingreso['tipo']; total: number }>()
    incomes.forEach((income) => {
      const key = `${income.tipo}-${income.codigo_concepto}-${income.concepto}`
      const current = totals.get(key)
      totals.set(key, {
        code: income.codigo_concepto,
        concept: income.concepto,
        type: income.tipo,
        total: (current?.total || 0) + income.monto_total,
      })
    })
    const latest = incomes.reduce<Ingreso | null>(
      (current, income) => (!current || income.fecha > current.fecha ? income : current),
      null,
    )
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byConcept: Array.from(totals.values()).sort((a, b) => a.code - b.code),
      latest,
    }
  }, [incomes])

  return (
    <>
      <section className="financial-summary" aria-label="Resumen financiero">
        <article className="financial-summary__card financial-summary__card--income">
          <TrendingUp size={21} />
          <span>Total Ingresos</span>
          <strong>{formatCurrency(summary.totalIncome)}</strong>
        </article>
        {summary.totalExpense > 0 && (
          <article className="financial-summary__card financial-summary__card--expense">
            <TrendingDown size={21} />
            <span>Total Egresos</span>
            <strong>{formatCurrency(summary.totalExpense)}</strong>
          </article>
        )}
        <article className="financial-summary__card financial-summary__card--balance">
          <WalletCards size={21} />
          <span>Saldo a la Fecha</span>
          <strong>{formatCurrency(summary.balance)}</strong>
        </article>
        <article className="financial-summary__card">
          <FileText size={21} />
          <span>Fecha del Último Registro</span>
          <strong>{summary.latest ? formatDate(summary.latest.fecha) : 'Sin registros'}</strong>
        </article>
      </section>

      {summary.byConcept.length > 0 && (
        <section className="concept-totals" aria-labelledby="concept-totals-title">
          <div className="concept-totals__heading">
            <h3 id="concept-totals-title">Total por concepto</h3>
            <span>{summary.byConcept.length} conceptos con registros</span>
          </div>
          <div className="concept-totals__grid">
            {summary.byConcept.map((item) => (
              <article key={`${item.type}-${item.code}-${item.concept}`}>
                <span className={`movement-badge movement-badge--${item.type.toLowerCase()}`}>{item.type}</span>
                <div>
                  <small>#{String(item.code).padStart(2, '0')}</small>
                  <strong>{item.concept}</strong>
                </div>
                <b>{formatCurrency(item.total)}</b>
              </article>
            ))}
          </div>
        </section>
      )}

      {!incomes.length ? (
        <div className="empty-state">
          <TrendingUp size={38} />
          <h3>Aún no hay movimientos</h3>
          <p>Usa “Registrar movimiento” para agregar el primer ingreso o egreso.</p>
        </div>
      ) : (
        <div className="income-table-wrap">
          <table className="income-table">
            <thead>
              <tr>
                <th>Movimiento N°</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Detalle / Responsable</th>
                <th>Comprobante</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Monto Total</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td><strong>#{income.folio}</strong><span className={`movement-badge movement-badge--${income.tipo.toLowerCase()}`}>{income.tipo}</span></td>
                  <td>{formatDate(income.fecha)}</td>
                  <td><strong>[#{String(income.codigo_concepto).padStart(2, '0')}]</strong> {income.concepto}</td>
                  <td><strong>{income.detalle_responsable}</strong>{income.observacion && <small>{income.observacion}</small>}</td>
                  <td>{income.comprobante || `Movimiento ${income.folio}`}</td>
                  <td>{formatCurrency(income.precio_unitario)}</td>
                  <td>{income.cantidad}</td>
                  <td className={income.tipo === 'Egreso' ? 'amount-expense' : 'amount-income'}>{formatCurrency(income.monto_total)}</td>
                  <td>
                    <div className="income-table__actions">
                      <button className="button button--small button--secondary" onClick={() => onReceipt(income)}><ReceiptText size={15} /> Ver comprobante</button>
                      <button className="icon-button" aria-label={`Editar movimiento ${income.folio}`} onClick={() => onEdit(income)}><Edit3 size={16} /></button>
                      <button className="icon-button icon-button--danger" aria-label={`Eliminar movimiento ${income.folio}`} onClick={() => onDelete(income)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
