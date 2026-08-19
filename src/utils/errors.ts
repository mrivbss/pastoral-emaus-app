export const friendlyError = (error: unknown) => {
  if (error instanceof Error) {
    if (/duplicate|unique|integrantes_rut|ya se encuentra registrado/i.test(error.message)) {
      return 'Ya existe un servidor registrado con ese RUT.'
    }
    if (/Failed to fetch|NetworkError|fetch/i.test(error.message)) {
      return 'No fue posible conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.'
    }
    return error.message
  }
  return 'Ocurrió un error inesperado. Inténtalo nuevamente.'
}
