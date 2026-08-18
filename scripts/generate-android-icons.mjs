import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import sharp from 'sharp'

const projectRoot = process.cwd()
const legacyPath = ['legacy/v1.html', 'v1.html'].find((candidate) =>
  existsSync(path.join(projectRoot, candidate)),
)

if (!legacyPath) throw new Error('No se encontró legacy/v1.html ni v1.html.')

const legacyHtml = await readFile(path.join(projectRoot, legacyPath), 'utf8')
const base64Match = legacyHtml.match(
  /<img\s+class="logo"\s+src="data:image\/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=\r\n]+)"/,
)

if (!base64Match) throw new Error('No se encontró el logo Base64 en la V1.')

const legacyBytes = Buffer.from(base64Match[1].replace(/\s/g, ''), 'base64')
const sourcePath = path.join(projectRoot, 'src/assets/logo.png')
const sourceBytes = await readFile(sourcePath)
const hash = (value) => createHash('sha256').update(value).digest('hex')

if (hash(legacyBytes) !== hash(sourceBytes)) {
  throw new Error('src/assets/logo.png no coincide con el logo Base64 de la V1.')
}

const metadata = await sharp(sourceBytes).metadata()
if (metadata.format !== 'jpeg' || metadata.width !== 1536 || metadata.height !== 858) {
  throw new Error(`Formato o dimensiones inesperadas: ${JSON.stringify(metadata)}`)
}

const canvasSize = 1024
const logoSize = 942
const cropSize = Math.min(metadata.width, metadata.height)
const cropLeft = Math.floor((metadata.width - cropSize) / 2)
const emblem = await sharp(sourceBytes)
  .extract({ left: cropLeft, top: 0, width: cropSize, height: cropSize })
  .resize(logoSize, logoSize, { kernel: sharp.kernel.lanczos3 })
  .png()
  .toBuffer()

const assetsDir = path.join(projectRoot, 'assets')
await mkdir(assetsDir, { recursive: true })
await sharp({
  create: { width: canvasSize, height: canvasSize, channels: 4, background: '#ffffff' },
})
  .composite([{ input: emblem, gravity: 'center' }])
  .png()
  .toFile(path.join(assetsDir, 'icon-only.png'))

await sharp({
  create: {
    width: canvasSize,
    height: canvasSize,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  },
})
  .composite([{ input: emblem, gravity: 'center' }])
  .png()
  .toFile(path.join(assetsDir, 'icon-foreground.png'))

await sharp({
  create: { width: canvasSize, height: canvasSize, channels: 4, background: '#ffffff' },
})
  .png()
  .toFile(path.join(assetsDir, 'icon-background.png'))

const capacitorAssetsBin = path.join(
  projectRoot,
  'node_modules/@capacitor/assets/bin/capacitor-assets',
)
const generated = spawnSync(
  process.execPath,
  [capacitorAssetsBin, 'generate', '--android', '--assetPath', 'assets'],
  { cwd: projectRoot, stdio: 'inherit' },
)

if (generated.status !== 0) {
  throw new Error(`@capacitor/assets terminó con código ${generated.status}.`)
}

// @capacitor/assets 3.0.5 genera las capas custom con tamaño legacy (48 dp).
// Se restauran aquí los tamaños adaptativos oficiales de 108 dp para evitar reescalado borroso.
const adaptiveSizes = {
  ldpi: 81,
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
}
const androidRes = path.join(projectRoot, 'android/app/src/main/res')

for (const [density, size] of Object.entries(adaptiveSizes)) {
  const densityDir = path.join(androidRes, `mipmap-${density}`)
  await sharp(path.join(assetsDir, 'icon-foreground.png'))
    .resize(size, size)
    .png()
    .toFile(path.join(densityDir, 'ic_launcher_foreground.png'))
  await sharp(path.join(assetsDir, 'icon-background.png'))
    .resize(size, size)
    .png()
    .toFile(path.join(densityDir, 'ic_launcher_background.png'))
}

const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground>
        <inset android:drawable="@mipmap/ic_launcher_foreground" android:inset="16.7%" />
    </foreground>
</adaptive-icon>
`
const anyDpiDir = path.join(androidRes, 'mipmap-anydpi-v26')
await writeFile(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8')
await writeFile(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8')

console.log(`Logo verificado contra ${legacyPath}: ${hash(sourceBytes)}`)
console.log('Fuentes 1024×1024 y recursos launcher/adaptive Android generados.')
