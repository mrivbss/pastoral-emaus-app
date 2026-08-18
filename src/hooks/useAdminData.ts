import { useCallback, useEffect, useState } from 'react'
import { listDonaciones } from '../services/donaciones'
import { listIntegrantes } from '../services/integrantes'
import { listPagos } from '../services/pagos'
import type { Donacion, Integrante, Pago } from '../types'
import { friendlyError } from '../utils/errors'

export const useAdminData = (year: number) => {
  const [members, setMembers] = useState<Integrante[]>([])
  const [payments, setPayments] = useState<Pago[]>([])
  const [donations, setDonations] = useState<Donacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [nextMembers, nextPayments, nextDonations] = await Promise.all([
        listIntegrantes(),
        listPagos(year),
        listDonaciones(),
      ])
      setMembers(nextMembers)
      setPayments(nextPayments)
      setDonations(nextDonations)
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const refreshWhenReturning = () => void refresh()
    window.addEventListener('focus', refreshWhenReturning)
    window.addEventListener('online', refreshWhenReturning)
    return () => {
      window.removeEventListener('focus', refreshWhenReturning)
      window.removeEventListener('online', refreshWhenReturning)
    }
  }, [refresh])

  return { members, payments, donations, loading, error, refresh }
}
