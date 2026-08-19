import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { PublicHomePage } from '../../src/pages/PublicHomePage'

const root = document.querySelector('#root')
const output = document.querySelector('#interaction-result')

if (!root || !output) throw new Error('Interaction fixture could not initialize')

createRoot(root).render(
  <MemoryRouter>
    <PublicHomePage />
  </MemoryRouter>,
)

const nextPaint = () => new Promise((resolve) => window.setTimeout(resolve, 50))
const waitFor = async <T,>(readValue: () => T | null) => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const value = readValue()
    if (value) return value
    await new Promise((resolve) => window.setTimeout(resolve, 25))
  }
  return null
}

const toggle = await waitFor(() => [...document.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button, a')]
  .find((item) => item.textContent?.includes('datos de transferencia')) || null)

if (!toggle) {
  output.textContent = JSON.stringify({ error: 'transfer-toggle-not-found' })
} else {
  const details = document.querySelector<HTMLElement>('#transferencia')
  const result: Record<string, string | boolean | null> = {
    initialHidden: details?.hidden ?? null,
    initialExpanded: toggle.getAttribute('aria-expanded'),
  }

  toggle.click()
  await nextPaint()
  result.visibleAfterOpen = details ? !details.hidden : null
  result.openLabel = toggle.textContent?.trim() || ''

  toggle.click()
  await nextPaint()
  result.hiddenAfterClose = details?.hidden ?? null
  result.closedLabel = toggle.textContent?.trim() || ''
  output.textContent = JSON.stringify(result)
}
