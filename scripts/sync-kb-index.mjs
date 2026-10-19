#!/usr/bin/env node
/**
 * Rebuild knowledge-base/index.json from the docs.
 *
 * Each docs[] entry and the matching groups[].topics[] entry is copied from the
 * source doc: slug, title, category, order, tags. summary is the doc summary
 * per locale, cut to 219 chars plus "…" when longer than 220. headings is every
 * heading with level 2–3, as { id, text, level }.
 *
 * groups order and defaultSlug are preserved.
 *
 * Usage:
 *   node scripts/sync-kb-index.mjs [root]
 *   node scripts/sync-kb-index.mjs --check [root]
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

const kbDir = path.join(root, 'knowledge-base')
const indexPath = path.join(kbDir, 'index.json')
const ELLIPSIS = '…'
const SUMMARY_LIMIT = 220
const CUT_AT = 219

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function clipSummary(text) {
  const value = String(text ?? '')
  if (value.length <= SUMMARY_LIMIT) return value
  return `${value.slice(0, CUT_AT)}${ELLIPSIS}`
}

function loadDocs() {
  if (!existsSync(kbDir)) {
    console.error(`knowledge-base not found: ${kbDir}`)
    process.exit(1)
  }
  const docs = []
  for (const name of readdirSync(kbDir).sort()) {
    if (!name.endsWith('.json') || name === 'index.json') continue
    const doc = readJson(path.join(kbDir, name))
    if (!doc?.slug) {
      console.error(`${name}: missing slug`)
      process.exit(1)
    }
    docs.push(doc)
  }
  return docs
}

function headingsFromDoc(doc) {
  const headings = []
  for (const section of doc.sections || []) {
    for (const block of section.blocks || []) {
      if (block?.type !== 'heading') continue
      const level = block.level
      if (level !== 2 && level !== 3) continue
      headings.push({
        id: block.id,
        text: block.text,
        level,
      })
    }
  }
  return headings
}

function entryFromDoc(doc) {
  return {
    slug: doc.slug,
    title: doc.title,
    summary: {
      en: clipSummary(doc.summary?.en),
      vi: clipSummary(doc.summary?.vi),
    },
    category: doc.category,
    order: doc.order,
    tags: doc.tags,
    headings: headingsFromDoc(doc),
  }
}

if (!existsSync(indexPath)) {
  console.error(`missing ${path.relative(root, indexPath)}`)
  process.exit(1)
}

const current = readJson(indexPath)
const docsBySlug = new Map(loadDocs().map((doc) => [doc.slug, doc]))

function topicEntry(slug, hint) {
  const doc = docsBySlug.get(slug)
  if (!doc) {
    console.error(`${hint}: doc "${slug}" not found on disk`)
    process.exit(1)
  }
  return entryFromDoc(doc)
}

const groups = (current.groups || []).map((group) => ({
  id: group.id,
  order: group.order,
  topics: (group.topics || []).map((topic) =>
    topicEntry(topic.slug, `groups[${group.id}]`),
  ),
}))

const seen = new Set()
const docs = []
for (const group of groups) {
  for (const topic of group.topics) {
    if (seen.has(topic.slug)) continue
    seen.add(topic.slug)
    docs.push(topic)
  }
}

for (const slug of docsBySlug.keys()) {
  if (seen.has(slug)) continue
  docs.push(topicEntry(slug, 'ungrouped'))
  seen.add(slug)
}

const next = {
  groups,
  docs,
  defaultSlug: current.defaultSlug,
}

const serialized = `${JSON.stringify(next, null, 2)}\n`
const existing = `${JSON.stringify(current, null, 2)}\n`

if (checkOnly) {
  if (serialized !== existing) {
    console.error('knowledge-base/index.json is out of date. Run `node scripts/sync-kb-index.mjs`.')
    process.exit(1)
  }
  console.log('knowledge-base/index.json is in sync')
  process.exit(0)
}

if (serialized === existing) {
  console.log('knowledge-base/index.json already in sync')
} else {
  writeFileSync(indexPath, serialized)
  console.log(`wrote ${path.relative(root, indexPath)}`)
}
