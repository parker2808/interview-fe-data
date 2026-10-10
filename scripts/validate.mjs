#!/usr/bin/env node
/**
 * Fail if any Localized object is missing a non-empty `en` or `vi`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(process.argv[2] || path.dirname(fileURLToPath(import.meta.url)), process.argv[2] ? '.' : '..')
const resolvedRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const errors = []

function fail(pathHint, message) {
  errors.push(`${pathHint}: ${message}`)
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    fail(file, `invalid JSON (${err instanceof Error ? err.message : err})`)
    return null
  }
}

function walkLocalized(value, pathHint) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkLocalized(item, `${pathHint}[${i}]`))
    return
  }
  if (!value || typeof value !== 'object') return

  const keys = Object.keys(value)
  const hasLocaleKey = keys.includes('en') || keys.includes('vi')
  const onlyLocaleKeys = keys.every((key) => key === 'en' || key === 'vi')
  const stringValues = keys.every(
    (key) => typeof value[key] === 'string' || value[key] == null,
  )

  if (hasLocaleKey && onlyLocaleKeys && stringValues) {
    if (typeof value.en !== 'string') fail(pathHint, 'missing `en`')
    if (typeof value.vi !== 'string') fail(pathHint, 'missing `vi`')
    const en = String(value.en ?? '')
    const vi = String(value.vi ?? '')
    if (en.trim() || vi.trim()) {
      if (!en.trim()) fail(pathHint, 'missing non-empty `en`')
      if (!vi.trim()) fail(pathHint, 'missing non-empty `vi`')
    }
    return
  }

  for (const [key, child] of Object.entries(value)) {
    walkLocalized(child, `${pathHint}.${key}`)
  }
}

function listJsonFiles(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listJsonFiles(full))
    else if (name.endsWith('.json')) out.push(full)
  }
  return out
}

if (!existsSync(resolvedRoot)) {
  console.error(`Content directory not found: ${resolvedRoot}`)
  process.exit(1)
}

for (const file of listJsonFiles(resolvedRoot)) {
  if (file.includes('/schema/')) continue
  const data = readJson(file)
  if (data) walkLocalized(data, path.relative(resolvedRoot, file))
}

const kb = listJsonFiles(path.join(resolvedRoot, 'knowledge-base')).filter(
  (file) => path.basename(file) !== 'index.json',
)
if (kb.length < 1) fail('knowledge-base', 'no documents')

const days = listJsonFiles(path.join(resolvedRoot, 'plan/days'))
if (existsSync(path.join(resolvedRoot, 'plan/days')) && days.length !== 30) {
  fail('plan/days', `expected 30 day files, found ${days.length}`)
}

if (!existsSync(path.join(resolvedRoot, 'qna/questions.json'))) {
  fail('qna/questions.json', 'missing Q&A bank')
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length} issue(s)):`)
  for (const error of errors.slice(0, 80)) console.error(` - ${error}`)
  if (errors.length > 80) console.error(` - …and ${errors.length - 80} more`)
  process.exit(1)
}

console.log(`Content OK (${resolvedRoot})`)
