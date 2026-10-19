#!/usr/bin/env node
/**
 * Rebuild practice/index.json from practice/meta.json + practice/steps/*.json.
 *
 * Output shape (deterministic, no timestamps):
 *   { version, title, intro, milestones, steps[] }
 * where steps[] is a summary per existing step file, in meta order:
 *   { id, milestone, order, title, summary, estimateMin, tags, prereqs }
 *
 * Usage:
 *   node scripts/sync-practice-index.mjs [root]
 *   node scripts/sync-practice-index.mjs --check [root]
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

const metaPath = path.join(root, 'practice/meta.json')
const indexPath = path.join(root, 'practice/index.json')
const stepsDir = path.join(root, 'practice/steps')

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function stepSummary(step) {
  return {
    id: step.id,
    milestone: step.milestone,
    order: step.order,
    title: step.title,
    summary: step.summary,
    estimateMin: step.estimateMin,
    tags: step.tags,
    prereqs: step.prereqs,
  }
}

function loadStepsById() {
  const byId = new Map()
  if (!existsSync(stepsDir)) return byId
  const files = readdirSync(stepsDir)
    .filter((name) => /^p\d{2}\.json$/.test(name))
    .sort()
  for (const name of files) {
    const step = readJson(path.join(stepsDir, name))
    const id = step?.id || path.basename(name, '.json')
    byId.set(id, step)
  }
  return byId
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
const byId = loadStepsById()
const steps = []
for (const milestone of meta.milestones || []) {
  for (const id of milestone.steps || []) {
    const step = byId.get(id)
    if (!step) continue
    steps.push(stepSummary(step))
  }
}

const next = {
  version: meta.version,
  title: meta.title,
  intro: meta.intro,
  milestones: meta.milestones,
  steps,
}

const serialized = `${JSON.stringify(next, null, 2)}\n`

if (checkOnly) {
  if (!existsSync(indexPath)) {
    console.error('practice/index.json is missing. Run `node scripts/sync-practice-index.mjs`.')
    process.exit(1)
  }
  const existing = readFileSync(indexPath, 'utf8')
  if (serialized !== existing) {
    console.error('practice/index.json is out of date. Run `node scripts/sync-practice-index.mjs`.')
    process.exit(1)
  }
  console.log('practice/index.json is in sync')
  process.exit(0)
}

writeFileSync(indexPath, serialized)
console.log(`wrote ${path.relative(root, indexPath)}`)
