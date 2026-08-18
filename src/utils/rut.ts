export const normalizeRut = (rut: string) =>
  rut.toUpperCase().replace(/[^0-9K]/g, '')

export const isValidRut = (rut: string) => {
  const normalized = normalizeRut(rut)
  if (!/^\d{7,8}[0-9K]$/.test(normalized)) return false

  const body = normalized.slice(0, -1)
  const verifier = normalized.slice(-1)
  let sum = 0
  let multiplier = 2

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const result = 11 - (sum % 11)
  const expected = result === 11 ? '0' : result === 10 ? 'K' : String(result)
  return verifier === expected
}

export const formatRut = (rut: string) => {
  const normalized = normalizeRut(rut)
  if (normalized.length < 2) return normalized
  const body = normalized.slice(0, -1)
  const verifier = normalized.slice(-1)
  return `${Number(body).toLocaleString('es-CL')}-${verifier}`
}
