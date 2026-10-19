#!/usr/bin/env node
/**
 * Rebuild plan/index.json from plan/meta.json + plan/days/*.json.
 *
 * Output shape: { weeks, gaps, resources } from meta.json, then days[] =
 * each day file without the `lab` key, preserving key order.
 *
 * Usage:
 *   node scripts/sync-plan-index.mjs [root]
 *   node scripts/sync-plan-index.mjs --check [root]
 *
 * --check exits non-zero when the file would change (does not write).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const rootArg = args.find((arg) => arg !== '--check')
const root = path.resolve(rootArg || path.join(scriptDir, '..'))

const metaPath = path.join(root, 'plan/meta.json')
const indexPath = path.join(root, 'plan/index.json')
const daysDir = path.join(root, 'plan/days')

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function dayWithoutLab(day) {
  const out = {}
  for (const [key, value] of Object.entries(day)) {
    if (key === 'lab') continue
    out[key] = value
  }
  return out
}

function loadDays() {
  if (!existsSync(daysDir)) {
    console.error(`plan/days not found: ${daysDir}`)
    process.exit(1)
  }
  const files = readdirSync(daysDir)
    .filter((name) => /^day-\d{2}\.json$/.test(name))
    .sort()
  const days = []
  for (const name of files) {
    days.push(dayWithoutLab(readJson(path.join(daysDir, name))))
  }
  return days
}

if (!existsSync(metaPath)) {
  console.error(`missing ${path.relative(root, metaPath)}`)
  process.exit(1)
}
if (!existsSync(indexPath) && checkOnly) {
  console.error(`missing ${path.relative(root, indexPath)}`)
  process.exit(1)
}

const meta = readJson(metaPath)
const next = {
  weeks: meta.weeks,
  gaps: meta.gaps,
  resources: meta.resources,
  days: loadDays(),
}

const serialized = `${JSON.stringify(next, null, 2)}\n`

if (checkOnly) {
  if (!existsSync(indexPath)) {
    console.error('plan/index.json is missing. Run `node scripts/sync-plan-index.mjs`.')
    process.exit(1)
  }
  const existing = readFileSync(indexPath, 'utf8')
  if (serialized !== existing) {
    console.error('plan/index.json is out of date. Run `node scripts/sync-plan-index.mjs`.')
    process.exit(1)
  }
  console.log('plan/index.json is in sync')
  process.exit(0)
}

writeFileSync(indexPath, serialized)
console.log(`wrote ${path.relative(root, indexPath)}`)
