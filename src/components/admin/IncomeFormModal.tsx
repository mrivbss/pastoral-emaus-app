import { ChevronDown, Minus, Plus } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { EXPENSE_CONCEPTS, INCOME_CONCEPTS } from '../../config/app'
import type { Ingreso, IngresoInput, IncomeType } from '../../types'
import { friendlyError } from '../../utils/errors'
import { formatCurrency, todayInputValue } from '../../utils/format'
import { Modal } from '../common/Modal'

interface IncomeFormModalProps {
  open: boolean
  income: Ingreso | null
  onClose: () => void
  onSave: (inputs: IngresoInput[]) => Promise<void>
}

interface ConceptLine {
  precioUnitario: string
  cantidad: string
}

const lineSubtotal = (line: ConceptLine) => {
  const price = Number(line.precioUnitario)
  const quantity = Number(line.cantidad)
  return Number.isFinite(price) && Number.isFinite(quantity) ? price * quantity : 0
}

export function IncomeFormModal({ open, income, onClose, onSave }: IncomeFormModalProps) {
  const [type, setType] = useState<IncomeType>('Ingreso')
  const [date, setDate] = useState(todayInputValue())
  const [detail, setDetail] = useState('')
  const [reference, setReference] = useState('')
  const [observation, setObservation] = useState('')
  const [lines, setLines] = useState<Record<number, ConceptLine>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setType(income?.tipo || 'Ingreso')
    setDate(income?.fecha || todayInputValue())
    setDetail(income?.detalle_responsable || '')
    setReference(income?.comprobante || '')
    setObservation(income?.observacion || '')
    setLines(
      income
        ? {
            [income.codigo_concepto]: {
              precioUnitario: String(income.precio_unitario),
              cantidad: String(income.cantidad),
            },
          }
        : {},
    )
    setError('')
  }, [income, open])

  const concepts = type === 'Ingreso' ? INCOME_CONCEPTS : EXPENSE_CONCEPTS
  const selectedConcepts = concepts.filter((concept) => lines[concept.codigo])
  const total = useMemo(
    () => selectedConcepts.reduce((sum, concept) => sum + lineSubtotal(lines[concept.codigo]), 0),
    [lines, selectedConcepts],
  )

  const changeType = (nextType: IncomeType) => {
    if (nextType === type) return
    setType(nextType)
    setLines({})
    setError('')
  }

  const toggleConcept = (code: number, suggestedPrice: number) => {
    setLines((current) => {
      if (current[code]) {
        const next = { ...current }
        delete next[code]
        return next
      }
      const next = income ? {} : { ...current }
      next[code] = {
        precioUnitario: String(suggestedPrice),
        cantidad: '1',
      }
      return next
    })
  }

  const updateLine = (code: number, field: keyof ConceptLine, value: string) => {
    setLines((current) => ({
      ...current,
      [code]: { ...current[code], [field]: value },
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (detail.trim().length < 2) {
      setError('Ingresa el detalle o responsable de la operación.')
      return
    }
    if (!selectedConcepts.length) {
      setError('Selecciona al menos un concepto.')
      return
    }

    const invalidLine = selectedConcepts.some((concept) => {
      const line = lines[concept.codigo]
      const price = Number(line.precioUnitario)
      const quantity = Number(line.cantidad)
      return !Number.isInteger(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1
    })
    if (invalidLine) {
      setError('Revisa que cada precio sea un entero igual o mayor a 0 y cada cantidad sea al menos 1.')
      return
    }

    const inputs: IngresoInput[] = selectedConcepts.map((concept) => {
      const line = lines[concept.codigo]
      return {
        fecha: date,
        tipo: concept.tipo,
        codigo_concepto: concept.codigo,
        concepto: concept.nombre,
        detalle_responsable: detail.trim(),
        comprobante: reference.trim() || null,
        observacion: observation.trim() || null,
        precio_unitario: Number(line.precioUnitario),
        cantidad: Number(line.cantidad),
      }
    })

    setSaving(true)
    try {
      await onSave(inputs)
      onClose()
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={income ? `Editar movimiento N° ${income.folio}` : 'Registrar ingreso o egreso'}
      onClose={onClose}
      size="xlarge"
    >
      <form className="income-form" onSubmit={submit}>
        <div className="operation-type-selector" role="group" aria-label="Tipo de movimiento">
          <button
            type="button"
            className={type === 'Ingreso' ? 'is-active' : ''}
            aria-pressed={type === 'Ingreso'}
            onClick={() => changeType('Ingreso')}
          >
            <Plus size={18} />
            <span><strong>Ingreso</strong><small>Ventas, cuotas y otros aportes</small></span>
          </button>
          <button
            type="button"
            className={type === 'Egreso' ? 'is-active is-expense' : ''}
            aria-pressed={type === 'Egreso'}
            onClick={() => changeType('Egreso')}
          >
            <Minus size={18} />
            <span><strong>Egreso</strong><small>Compras, pagos y apoyos</small></span>
          </button>
        </div>

        <div className="form-grid income-general-fields">
          <label className="field">
            <span>Fecha *</span>
            <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="field">
            <span>Comprobante / referencia</span>
            <input maxLength={200} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="N° transferencia, boleta o glosa" />
          </label>
          <label className="field field--wide">
            <span>Detalle / responsable *</span>
            <input required minLength={2} maxLength={500} value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Nombre del responsable o pagador" />
          </label>
          <label className="field field--wide">
            <span>Observación / glosa</span>
            <textarea rows={2} maxLength={1000} value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Información adicional de la operación" />
          </label>
        </div>

        <details className="concept-picker" open>
          <summary>
            <span>
              <strong>Conceptos de {type.toLocaleLowerCase('es')}</strong>
              <small>{income ? 'Selecciona un concepto para este movimiento.' : 'Puedes seleccionar uno o varios conceptos.'}</small>
            </span>
            <span className="concept-picker__count">{selectedConcepts.length} seleccionados</span>
            <ChevronDown size={19} />
          </summary>
          <div className="concept-grid">
            {concepts.map((concept) => {
              const selected = Boolean(lines[concept.codigo])
              return (
                <label className={`concept-option ${selected ? 'is-selected' : ''}`} key={concept.codigo}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleConcept(concept.codigo, concept.precioUnitarioSugerido)}
                  />
                  <span className="concept-option__code">#{String(concept.codigo).padStart(2, '0')}</span>
                  <span>{concept.nombre}</span>
                </label>
              )
            })}
          </div>
        </details>

        {selectedConcepts.length > 0 && (
          <section className="income-lines" aria-label="Cálculo de conceptos seleccionados">
            <div className="income-lines__heading">
              <strong>Detalle del cálculo</strong>
              <span>{selectedConcepts.length} {selectedConcepts.length === 1 ? 'concepto' : 'conceptos'}</span>
            </div>
            {selectedConcepts.map((concept) => {
              const line = lines[concept.codigo]
              return (
                <div className="income-line" key={concept.codigo}>
                  <div className="income-line__concept">
                    <span>#{String(concept.codigo).padStart(2, '0')}</span>
                    <strong>{concept.nombre}</strong>
                  </div>
                  <label className="field">
                    <span>Precio Unitario ($)</span>
                    <input type="number" min="0" step="1" inputMode="numeric" required value={line.precioUnitario} onChange={(event) => updateLine(concept.codigo, 'precioUnitario', event.target.value)} />
                  </label>
                  <label className="field">
                    <span>Cantidad</span>
                    <input type="number" min="1" step="1" inputMode="numeric" required value={line.cantidad} onChange={(event) => updateLine(concept.codigo, 'cantidad', event.target.value)} />
                  </label>
                  <div className="income-line__subtotal">
                    <span>Subtotal</span>
                    <strong>{formatCurrency(lineSubtotal(line))}</strong>
                  </div>
                </div>
              )
            })}
            <div className="income-grand-total">
              <span>Monto Total General</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </section>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" className="button button--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="button button--primary" disabled={saving}>
            {saving ? 'Guardando…' : income ? 'Guardar cambios' : `Guardar ${selectedConcepts.length || ''} ${selectedConcepts.length === 1 ? 'movimiento' : 'movimientos'}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
