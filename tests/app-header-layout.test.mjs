import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { test, before, after } from 'node:test'
import { createServer } from 'vite'

const browserCandidates = process.platform === 'win32'
  ? [
      'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ]
  : process.platform === 'darwin'
    ? [
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ]
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']

const browser = process.env.BROWSER_BIN || browserCandidates.find(existsSync)
let server
let appUrl
let fixtureUrl

before(async () => {
  if (!browser) return
  server = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const address = server.httpServer.address()
  appUrl = `http://127.0.0.1:${address.port}`
  fixtureUrl = `${appUrl}/tests/fixtures/app-header.html`
})

after(async () => {
  await server?.close()
})

function renderLayout(width, height) {
  return renderPage(fixtureUrl, width, height).then((output) => {
    const match = output.match(/<output id="layout-result">([^<]+)<\/output>/)
    if (!match) throw new Error('Layout result was not present in the rendered page')
    return JSON.parse(match[1].replaceAll('&quot;', '"'))
  })
}

function renderPage(url, width, height, virtualTimeBudget = 3000) {
  return new Promise((resolve, reject) => {
    const child = spawn(browser, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--window-size=${width},${height}`,
      `--virtual-time-budget=${virtualTimeBudget}`,
      '--dump-dom',
      url,
    ])
    let output = ''
    let errorOutput = ''

    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { errorOutput += chunk })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Browser exited with code ${code}: ${errorOutput}`))
        return
      }

      resolve(output)
    })
  })
}

test('renders a moderately larger header and logo on desktop', { skip: !browser }, async () => {
  const layout = await renderLayout(1280, 900)

  assert.deepEqual(
    { headerHeight: layout.headerHeight, logoWidth: layout.logoWidth, logoHeight: layout.logoHeight },
    { headerHeight: 96, logoWidth: 74, logoHeight: 74 },
  )
})

test('keeps the larger header and logo contained on phones', { skip: !browser }, async () => {
  const layout = await renderLayout(390, 844)

  assert.deepEqual(
    { headerHeight: layout.headerHeight, logoWidth: layout.logoWidth, logoHeight: layout.logoHeight },
    { headerHeight: 82, logoWidth: 60, logoHeight: 60 },
  )
})

test('centers only the hero title on phones and preserves its desktop alignment', { skip: !browser }, async () => {
  const mobileLayout = await renderLayout(390, 844)
  const desktopLayout = await renderLayout(1280, 900)

  assert.equal(mobileLayout.heroTitleAlign, 'center')
  assert.notEqual(desktopLayout.heroTitleAlign, 'center')
})

test('fills the logo area without an added white container', { skip: !browser }, async () => {
  const layout = await renderLayout(1280, 900)

  assert.deepEqual(
    {
      objectFit: layout.logoObjectFit,
      background: layout.logoBackground,
      borderWidth: layout.logoBorderWidth,
      shadow: layout.logoShadow,
    },
    { objectFit: 'cover', background: 'rgba(0, 0, 0, 0)', borderWidth: '0px', shadow: 'none' },
  )
})

test('public header only exposes the administration access', { skip: !browser }, async () => {
  const html = await renderPage(`${appUrl}/`, 1280, 900)
  const publicNav = html.match(/<nav class="public-nav"[\s\S]*?<\/nav>/)?.[0]

  assert.ok(publicNav, 'The public navigation should be rendered')
  assert.doesNotMatch(publicNav, /href="\/registro"/)
  assert.match(publicNav, /Administración/)
})

test('public pages use server terminology', { skip: !browser }, async () => {
  const homeHtml = await renderPage(`${appUrl}/`, 1280, 900)
  const registrationHtml = await renderPage(`${appUrl}/registro`, 1280, 900)

  assert.match(homeHtml, /INSCRIPCIÓN SERVIDOR/)
  assert.doesNotMatch(homeHtml, /integrantes?/i)
  assert.match(registrationHtml, /Inscripción de servidor/)
  assert.doesNotMatch(registrationHtml, /integrantes?/i)
})

test('transfer details toggle open and closed on the public home', { skip: !browser }, async () => {
  const html = await renderPage(`${appUrl}/tests/fixtures/public-home-interaction.html`, 1280, 900, 6000)
  const match = html.match(/<output id="interaction-result">([^<]+)<\/output>/)

  assert.ok(match, 'The interaction result should be rendered')
  assert.deepEqual(JSON.parse(match[1].replaceAll('&quot;', '"')), {
    initialHidden: true,
    initialExpanded: 'false',
    visibleAfterOpen: true,
    openLabel: 'Ocultar datos de transferencia',
    hiddenAfterClose: true,
    closedLabel: 'Ver datos de transferencia',
  })
})

test('shared transfer data uses the canonical Vercel link', { skip: !browser }, async () => {
  const { shareAppMessage } = await server.ssrLoadModule('/src/utils/whatsapp.ts')
  const homeHtml = await renderPage(`${appUrl}/`, 1280, 900)
  const message = shareAppMessage()

  assert.match(homeHtml, /Compartir datos/)
  assert.match(message, /https:\/\/pastoral-emaus-app\.vercel\.app\//)
  assert.doesNotMatch(message, /localhost/i)
})
