export function LoadingScreen({ label = 'Cargando información…' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
