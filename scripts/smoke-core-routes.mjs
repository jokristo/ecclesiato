#!/usr/bin/env node
/**
 * Vérifications statiques des routes API cœur (frontend).
 * node scripts/smoke-core-routes.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const required = [
  'src/app/api/sermons/route.ts',
  'src/app/api/sermons/[id]/route.ts',
  'src/app/api/sermons/[id]/process/route.ts',
  'src/app/api/sermons/[id]/retry-summary/route.ts',
  'src/app/api/sermons/[id]/retry-transcribe/route.ts',
  'src/app/api/sermons/[id]/cancel/route.ts',
  'src/app/api/config/limits/route.ts',
  'src/lib/apiServer.ts',
  'src/app/(app)/sermon/[id]/page.tsx',
]

let failed = 0
for (const rel of required) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) {
    console.log(`[FAIL] missing ${rel}`)
    failed++
  } else {
    console.log(`[OK] ${rel}`)
  }
}

const page = fs.readFileSync(path.join(root, 'src/app/(app)/sermon/[id]/page.tsx'), 'utf8')
const checks = [
  ['retry-summary', page.includes('retry-summary')],
  ['Relancer le résumé', page.includes('Relancer le résumé')],
  ['Relancer la transcription', page.includes('Relancer la transcription')],
  ['échec transcription réseau', page.includes('Échec transcription : vérifier votre réseau')],
  ['hasTranscript failed', page.includes('failed') && page.includes('hasTranscript')],
]
for (const [name, ok] of checks) {
  console.log(ok ? `[OK] page: ${name}` : `[FAIL] page: ${name}`)
  if (!ok) failed++
}

process.exit(failed ? 1 : 0)
