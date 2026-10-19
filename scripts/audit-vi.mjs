#!/usr/bin/env node
/**
 * Heuristic audit of Localized `vi` strings. Report-only by default.
 *
 *   node scripts/audit-vi.mjs [root]
 *   node scripts/audit-vi.mjs --strict [root]
 *   node scripts/audit-vi.mjs --json [root]
 *   node scripts/audit-vi.mjs --files a,b [root]
 *   node scripts/audit-vi.mjs --diff-only-vi <base-ref> [root]
 *
 * --files entries are repo-relative paths, optionally with a json-path
 * selector after `#` (`file#sections[0]`, `file#sections[1].blocks[0:156]`).
 * --strict exits 1 on any `error` flag. --json prints hits + summaries.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const strict = args.includes('--strict')
const asJson = args.includes('--json')
const diffRef = optValue('--diff-only-vi')
const filesArg = optValue('--files')
const rootArg = args.find(
  (arg, i) =>
    !arg.startsWith('--') && args[i - 1] !== '--files' && args[i - 1] !== '--diff-only-vi',
)
const root = path.resolve(rootArg || path.join(scriptDir, '..'))
const GENERATED = new Set(['knowledge-base/index.json', 'plan/index.json', 'practice/index.json'])
const LAB_TITLE = /^Ngày \d+ — Lab$/
const INLINE_CODE = /`[^`]+`/g
const LINK_TARGET = /\]\(([^)]+)\)/g
const LABEL = /\*\*[^*]+?:\*\*/g
const FENCE = /```/g
const LIST_LINE = /^\s*(?:[-*]|\d+\.) /
const GT_LINE = /^\s*> /
const KEEP_SPLIT = /[^A-Za-z0-9_+/-]+/

function optValue(flag) {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : null
}

function isLoc(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const keys = Object.keys(value)
  return (
    keys.includes('en') &&
    keys.includes('vi') &&
    keys.every((key) => key === 'en' || key === 'vi') &&
    typeof value.en === 'string' &&
    typeof value.vi === 'string'
  )
}

function walkLoc(value, fn, hint = '', parentKey = '') {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkLoc(item, fn, `${hint}[${i}]`, parentKey))
    return
  }
  if (!value || typeof value !== 'object') return
  if (isLoc(value)) {
    fn(value, hint, parentKey)
    return
  }
  for (const [key, child] of Object.entries(value)) {
    walkLoc(child, fn, hint ? `${hint}.${key}` : key, key)
  }
}

function listJson(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) listJson(full, out)
    else if (name.endsWith('.json')) out.push(full)
  }
  return out
}

function contentFiles() {
  const files = []
  for (const dir of ['knowledge-base', 'qna', 'plan', 'practice']) {
    listJson(path.join(root, dir), files)
  }
  return files
    .map((file) => path.relative(root, file).replaceAll('\\', '/'))
    .filter((rel) => !GENERATED.has(rel))
    .sort()
}

function parseFilesArg(raw) {
  if (!raw) return null
  return raw.split(',').map((entry) => {
    const trimmed = entry.trim()
    const hash = trimmed.indexOf('#')
    const file = (hash < 0 ? trimmed : trimmed.slice(0, hash)).replaceAll('\\', '/')
    const sel = hash < 0 ? '' : trimmed.slice(hash + 1)
    return { file, match: sel ? pathMatcher(sel) : () => true }
  })
}

function pathMatcher(sel) {
  const slice = sel.match(/^(.*)\[(\d+):(\d+)\]$/)
  if (slice) {
    const prefix = slice[1]
    const from = Number(slice[2])
    const to = Number(slice[3])
    const re = new RegExp(`^${escapeRe(prefix)}\\[(\\d+)\\]`)
    return (jsonPath) => {
      const m = jsonPath.match(re)
      if (!m) return jsonPath === prefix || jsonPath.startsWith(`${prefix}.`)
      return Number(m[1]) >= from && Number(m[1]) < to
    }
  }
  return (jsonPath) =>
    jsonPath === sel || jsonPath.startsWith(`${sel}.`) || jsonPath.startsWith(`${sel}[`)
}

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripVi(value) {
  if (Array.isArray(value)) return value.map(stripVi)
  if (!value || typeof value !== 'object') return value
  if (isLoc(value)) return { en: value.en, vi: '' }
  const out = {}
  for (const [key, child] of Object.entries(value)) out[key] = stripVi(child)
  return out
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function gitShow(ref, rel) {
  const result = spawnSync('git', ['show', `${ref}:${rel}`], { encoding: 'utf8', cwd: root })
  if (result.status !== 0) return null
  return JSON.parse(result.stdout)
}

function words(text) {
  return (String(text || '').trim().match(/\S+/g) || [])
}

function withoutFences(text) {
  return String(text || '').replace(/```[\s\S]*?```/g, '')
}

function inlineCodes(text) {
  return withoutFences(text).match(/``[\s\S]*?``|`[^`]+`/g) || []
}

function sortedJoin(items) {
  return [...items].sort().join('\u0001')
}

function linkTargets(text) {
  const out = []
  const re = new RegExp(LINK_TARGET.source, 'g')
  let m
  while ((m = re.exec(String(text || '')))) out.push(m[1])
  return out
}

function linkFingerprint(text) {
  return linkTargets(text)
    .map((href) => {
      if (href.startsWith('#')) return '#local'
      if (/^https?:\/\//i.test(href) || href.startsWith('mailto:')) return href
      const hash = href.indexOf('#')
      if (hash >= 0) return `${href.slice(0, hash)}#local`
      return href
    })
    .join('\n')
}

function mdShape(text) {
  const lines = String(text || '').split('\n')
  return [
    (String(text || '').match(FENCE) || []).length,
    lines.filter((line) => LIST_LINE.test(line)).length,
    (String(text || '').match(LABEL) || []).length,
    lines.filter((line) => GT_LINE.test(line)).length,
    lines.map((line) => (line.match(/\|/g) || []).length).join(','),
  ].join('|')
}

function snippet(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 60)
}

function isQaExample(rel, jsonPath) {
  return rel === 'qna/questions.json' && /(^|\.)example$/.test(jsonPath)
}

function isQaAnswer(rel, jsonPath) {
  return rel === 'qna/questions.json' && /(^|\.)answer$/.test(jsonPath)
}

const glossary = readJson(path.join(root, 'plans/vi-glossary.json'))
const avoidTerms = []
const keepTerms = []
for (const [term, spec] of Object.entries(glossary.terms || {})) {
  if (Array.isArray(spec.avoid)) {
    for (const item of spec.avoid) avoidTerms.push(item)
  }
  if (spec.keep === true) keepTerms.push({ term, avoid: spec.avoid || [] })
}

function keepWordBoundary(term) {
  const escaped = escapeRe(term)
  if (/^[A-Za-z]/.test(term) && /[A-Za-z0-9]$/.test(term)) {
    return new RegExp(`\\b${escaped}\\b`)
  }
  return new RegExp(escaped)
}

const keepChecks = keepTerms.map((item) => ({
  ...item,
  re: keepWordBoundary(item.term),
}))

function allKeepOrCode(en) {
  const tokens = words(en)
  if (!tokens.length) return false
  return tokens.every((token) => {
    const bare = token.replace(/^`|`$/g, '')
    if (token.startsWith('`') && token.endsWith('`')) return true
    return keepTerms.some((item) => item.term === bare || item.term === token)
  })
}

const fileFilters = parseFilesArg(filesArg)
const selected = contentFiles().filter((rel) => {
  if (!fileFilters) return true
  return fileFilters.some((filter) => filter.file === rel)
})

if (diffRef) {
  const drifts = []
  for (const rel of selected) {
    const current = readJson(path.join(root, rel))
    const previous = gitShow(diffRef, rel)
    if (!previous) {
      drifts.push(`${rel}: missing in ${diffRef}`)
      continue
    }
    if (JSON.stringify(stripVi(previous)) !== JSON.stringify(stripVi(current))) {
      drifts.push(`${rel}: non-vi fields changed vs ${diffRef}`)
    }
  }
  if (drifts.length) {
    console.error(drifts.join('\n'))
    process.exit(1)
  }
  console.log(`only-vi OK vs ${diffRef} (${selected.length} files)`)
  process.exit(0)
}

const hits = []
function flag(level, code, rel, jsonPath, vi) {
  hits.push({ level, code, file: rel, path: jsonPath, snippet: snippet(vi) })
}

for (const rel of selected) {
  const filters = fileFilters ? fileFilters.filter((item) => item.file === rel) : null
  const data = readJson(path.join(root, rel))
  walkLoc(data, (loc, jsonPath) => {
    if (filters && !filters.some((item) => item.match(jsonPath))) return
    const { en, vi } = loc
    if (
      !/\.code$/.test(jsonPath) &&
      !LAB_TITLE.test(vi) &&
      (vi.includes('—') || vi.includes(' – '))
    ) {
      flag('error', 'EM_DASH', rel, jsonPath, vi)
    }
    for (const term of avoidTerms) {
      if (term && vi.includes(term)) {
        flag('warn', 'AVOID_TERM', rel, jsonPath, vi)
        break
      }
    }
    for (const item of keepChecks) {
      if (!item.avoid.length) continue
      if (item.re.test(en) && !item.re.test(vi) && item.avoid.some((avoid) => vi.includes(avoid))) {
        flag('warn', 'TRANSLATED_KEEP', rel, jsonPath, vi)
        break
      }
    }
    if (isQaExample(rel, jsonPath) || isQaAnswer(rel, jsonPath)) {
      const scope = isQaExample(rel, jsonPath)
        ? vi
        : vi
            .split('\n')
            .filter((line) => GT_LINE.test(line))
            .join('\n')
      if (/(?:^|[^\w])(?:Tôi|tôi|chúng tôi|Chúng tôi)(?:[^\w]|$)/.test(scope)) {
        flag('warn', 'FIRST_PERSON', rel, jsonPath, vi)
      }
    }
    if (/[.,]”/.test(vi)) flag('warn', 'PERIOD_IN_QUOTE', rel, jsonPath, vi)
    if (sortedJoin(inlineCodes(en)) !== sortedJoin(inlineCodes(vi))) {
      flag('error', 'CODE_DRIFT', rel, jsonPath, vi)
    }
    if (linkFingerprint(en) !== linkFingerprint(vi)) {
      flag('error', 'LINK_DRIFT', rel, jsonPath, vi)
    }
    if (mdShape(en) !== mdShape(vi)) flag('error', 'MD_DRIFT', rel, jsonPath, vi)
    const enWords = words(en)
    const viWords = words(vi)
    if (enWords.length >= 12) {
      const ratio = viWords.length / enWords.length
      if (ratio < 0.7 || ratio > 1.5) flag('warn', 'LEN_RATIO', rel, jsonPath, vi)
    }
    if (enWords.length >= 4 && vi === en && !allKeepOrCode(en)) {
      flag('info', 'UNCHANGED', rel, jsonPath, vi)
    }
  })
}

const byCode = {}
const byFile = {}
for (const hit of hits) {
  byCode[hit.code] = (byCode[hit.code] || 0) + 1
  byFile[hit.file] ??= {}
  byFile[hit.file][hit.code] = (byFile[hit.file][hit.code] || 0) + 1
}

if (asJson) {
  console.log(JSON.stringify({ hits, byCode, byFile, total: hits.length }, null, 2))
} else {
  for (const hit of hits) {
    console.log(`${hit.file}:${hit.path} ${hit.code} ${hit.snippet}`)
  }
  console.log('\nBy code:')
  for (const code of Object.keys(byCode).sort()) console.log(`  ${code}\t${byCode[code]}`)
  console.log('\nBy file:')
  for (const file of Object.keys(byFile).sort()) {
    const parts = Object.entries(byFile[file])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([code, n]) => `${code}=${n}`)
    console.log(`  ${file}\t${parts.join(' ')}`)
  }
  console.log(`\n${hits.length} hit(s)`)
}

const errors = hits.filter((hit) => hit.level === 'error')
if (strict && errors.length) process.exit(1)
