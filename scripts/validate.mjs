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

const practiceStepsDir = path.join(resolvedRoot, 'practice/steps')
if (existsSync(practiceStepsDir)) {
  const practiceMetaPath = path.join(resolvedRoot, 'practice/meta.json')
  const practiceMeta = existsSync(practiceMetaPath) ? readJson(practiceMetaPath) : null
  if (!practiceMeta) {
    fail('practice/meta.json', 'missing practice meta')
  } else {
    const listedIds = (practiceMeta.milestones || []).flatMap((m) => m.steps || [])
    const stepFiles = listJsonFiles(practiceStepsDir).filter((file) =>
      /^p\d{2}\.json$/.test(path.basename(file)),
    )
    const fileIds = stepFiles.map((file) => path.basename(file, '.json')).sort()
    const listedSet = new Set(listedIds)
    for (const id of fileIds) {
      if (!listedSet.has(id)) {
        fail('practice/steps', `${id}.json is not listed in meta.milestones[].steps`)
      }
    }
    if (practiceMeta.draft === true) {
      const isPrefix =
        fileIds.length <= listedIds.length && fileIds.every((id, i) => id === listedIds[i])
      if (!isPrefix) {
        fail(
          'practice/steps',
          `draft:true allows a missing suffix only; found ${fileIds.length} file(s), meta lists ${listedIds.length}`,
        )
      }
    } else if (stepFiles.length !== listedIds.length) {
      fail(
        'practice/steps',
        `expected ${listedIds.length} step files, found ${stepFiles.length}`,
      )
    }
  }
}

const qnaPath = path.join(resolvedRoot, 'qna/questions.json')
const MIN_QUESTION_COUNT = 142
const MIN_CATEGORY_COUNTS = { soft: 29, technical: 86, situational: 27 }

if (!existsSync(qnaPath)) {
  fail('qna/questions.json', 'missing Q&A bank')
} else {
  const bank = readJson(qnaPath)
  const questions = Array.isArray(bank?.questions) ? bank.questions : []
  const byCategory = {}
  for (const question of questions) {
    const category = question?.category || 'unknown'
    byCategory[category] = (byCategory[category] || 0) + 1
  }
  const counts = Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, count]) => `${category}=${count}`)
    .join(', ')
  console.log(`Q&A counts: total=${questions.length} (${counts || 'none'})`)

  if (questions.length < MIN_QUESTION_COUNT) {
    fail(
      'qna/questions.json',
      `question count dropped (${questions.length} < ${MIN_QUESTION_COUNT})`,
    )
  }
  for (const [category, min] of Object.entries(MIN_CATEGORY_COUNTS)) {
    const count = byCategory[category] || 0
    if (count < min) {
      fail(
        'qna/questions.json',
        `${category} count dropped (${count} < ${min})`,
      )
    }
  }
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length} issue(s)):`)
  for (const error of errors.slice(0, 80)) console.error(` - ${error}`)
  if (errors.length > 80) console.error(` - …and ${errors.length - 80} more`)
  process.exit(1)
}

console.log(`Content OK (${resolvedRoot})`)
