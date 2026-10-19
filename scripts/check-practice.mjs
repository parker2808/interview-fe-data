#!/usr/bin/env node
/**
 * Structural checks for the practice module.
 * Zero dependencies. Node 22. Exits 1 on errors.
 * Format/budget rules are warnings unless --strict is passed.
 *
 *   node scripts/check-practice.mjs [root]
 *   node scripts/check-practice.mjs . --strict
 *   node scripts/check-practice.mjs . --stats
 *
 * draft:true on practice/meta.json allows a prefix of the listed step ids
 * to be missing (later batches). Removing draft errors until all 33 exist.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const strict = args.includes('--strict')
const statsOnly = args.includes('--stats')
const rootArg = args.find((arg) => !arg.startsWith('--'))
const root = path.resolve(rootArg || path.join(scriptDir, '..'))

const ID_RE = /^p\d{2}$/
const MILESTONE_RE = /^m[0-7]$/
const TAG_RE = /^[a-z0-9-]+$/
const COMMIT_RE = /^(feat|fix|chore|docs|test|perf|refactor)(\(.+\))?: .+/
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
const PHONE_RE =
  /(?:\+|tel:)\s*\d{1,3}[\s.-]?\d|\b0\d{8,10}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/
const EXPECTED_STEP_COUNT = 33

const errors = []
const warnings = []

function fail(hint, message) {
  errors.push(`${hint}: ${message}`)
}

function warn(hint, message) {
  warnings.push(`${hint}: ${message}`)
}

function issue(hint, message) {
  if (strict) fail(hint, message)
  else warn(hint, message)
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    fail(file, `invalid JSON (${err instanceof Error ? err.message : err})`)
    return null
  }
}

function isLocalized(value) {
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

function assertLocalized(value, hint) {
  if (!isLocalized(value)) {
    fail(hint, 'expected Localized { en, vi } strings')
    return false
  }
  if (!value.en.trim()) fail(hint, 'missing non-empty `en`')
  if (!value.vi.trim()) fail(hint, 'missing non-empty `vi`')
  return true
}

function walkStrings(value, fn, hint = '', skipKeys = new Set()) {
  if (typeof value === 'string') {
    fn(value, hint)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkStrings(item, fn, `${hint}[${i}]`, skipKeys))
    return
  }
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if (skipKeys.has(key)) continue
    walkStrings(child, fn, hint ? `${hint}.${key}` : key, skipKeys)
  }
}

function padStep(n) {
  return `p${String(n).padStart(2, '0')}`
}

function loadKbSlugs() {
  const indexPath = path.join(root, 'knowledge-base/index.json')
  const slugs = new Set()
  if (!existsSync(indexPath)) {
    fail('knowledge-base/index.json', 'missing knowledge-base index')
    return slugs
  }
  const index = readJson(indexPath)
  for (const doc of index?.docs || []) {
    if (doc?.slug) slugs.add(doc.slug)
  }
  for (const group of index?.groups || []) {
    for (const topic of group?.topics || []) {
      if (topic?.slug) slugs.add(topic.slug)
    }
  }
  return slugs
}

function loadQuestionIds() {
  const qnaPath = path.join(root, 'qna/questions.json')
  const ids = new Set()
  if (!existsSync(qnaPath)) {
    fail('qna/questions.json', 'missing Q&A bank')
    return ids
  }
  const bank = readJson(qnaPath)
  for (const question of bank?.questions || []) {
    if (question?.id) ids.add(question.id)
  }
  return ids
}

const metaPath = path.join(root, 'practice/meta.json')
const stepsDir = path.join(root, 'practice/steps')

if (!existsSync(metaPath)) {
  fail('practice/meta.json', 'missing practice meta')
}

const meta = existsSync(metaPath) ? readJson(metaPath) : null
const kbSlugs = loadKbSlugs()
const questionIds = loadQuestionIds()
const draft = meta?.draft === true

const listedIds = []
const idToMilestone = new Map()
const seenListed = new Set()

if (meta) {
  if (meta.version !== 1) fail('practice/meta.json', `version must be 1, got ${meta.version}`)
  assertLocalized(meta.title, 'practice/meta.json.title')
  assertLocalized(meta.intro, 'practice/meta.json.intro')
  if (meta.specPath !== 'plans/portfolio-design-system.md') {
    fail('practice/meta.json.specPath', `expected plans/portfolio-design-system.md, got "${meta.specPath}"`)
  }
  if (!Array.isArray(meta.milestones) || meta.milestones.length === 0) {
    fail('practice/meta.json.milestones', 'expected a non-empty array')
  } else {
    const expectedMilestoneIds = Array.from({ length: 8 }, (_, i) => `m${i}`)
    const gotMilestoneIds = meta.milestones.map((m) => m?.id)
    if (gotMilestoneIds.join(',') !== expectedMilestoneIds.join(',')) {
      fail(
        'practice/meta.json.milestones',
        `expected ids ${expectedMilestoneIds.join(', ')}, got ${gotMilestoneIds.join(', ')}`,
      )
    }
    for (const [i, milestone] of meta.milestones.entries()) {
      const hint = `practice/meta.json.milestones[${i}]`
      if (!MILESTONE_RE.test(milestone?.id || '')) {
        fail(hint, `id must match m0–m7, got "${milestone?.id}"`)
      }
      assertLocalized(milestone?.title, `${hint}.title`)
      assertLocalized(milestone?.goal, `${hint}.goal`)
      assertLocalized(milestone?.outcome, `${hint}.outcome`)
      if (!Array.isArray(milestone?.steps) || milestone.steps.length === 0) {
        fail(`${hint}.steps`, 'expected a non-empty array of step ids')
        continue
      }
      for (const [s, id] of milestone.steps.entries()) {
        if (!ID_RE.test(id)) {
          fail(`${hint}.steps[${s}]`, `id must match pXX, got "${id}"`)
          continue
        }
        if (seenListed.has(id)) fail(`${hint}.steps[${s}]`, `duplicate id "${id}"`)
        else seenListed.add(id)
        listedIds.push(id)
        idToMilestone.set(id, milestone.id)
      }
    }
  }
}

const expectedIds = Array.from({ length: EXPECTED_STEP_COUNT }, (_, i) => padStep(i + 1))
if (listedIds.length && listedIds.join(',') !== expectedIds.join(',')) {
  fail(
    'practice/meta.json',
    `step ids must be unique and contiguous p01–p${String(EXPECTED_STEP_COUNT).padStart(2, '0')} in order (got ${listedIds.length} ids)`,
  )
}

const stepFiles = existsSync(stepsDir)
  ? readdirSync(stepsDir)
      .filter((name) => name.endsWith('.json'))
      .sort()
  : []

const fileIds = []
for (const name of stepFiles) {
  if (!/^p\d{2}\.json$/.test(name)) {
    fail(`practice/steps/${name}`, 'filename must be pXX.json')
    continue
  }
  fileIds.push(path.basename(name, '.json'))
}

const listedSet = new Set(listedIds)
for (const id of fileIds) {
  if (!listedSet.has(id)) {
    fail(`practice/steps/${id}.json`, `id "${id}" is not listed in meta.milestones[].steps`)
  }
}

const missing = listedIds.filter((id) => !fileIds.includes(id))
const isPrefix =
  fileIds.length <= listedIds.length && fileIds.every((id, i) => id === listedIds[i])
if (draft) {
  if (!isPrefix) {
    fail(
      'practice/steps',
      `draft:true allows a missing suffix only; existing files must be a prefix of meta. have: ${fileIds.join(', ') || '∅'}`,
    )
  }
} else if (missing.length) {
  fail('practice/steps', `missing step files (draft is off): ${missing.join(', ')}`)
}

const steps = []
const stepById = new Map()
for (const id of fileIds) {
  const file = path.join(stepsDir, `${id}.json`)
  const step = readJson(file)
  if (!step) continue
  steps.push(step)
  stepById.set(id, step)
}

function checkBudget(step, hint) {
  const tasks = Array.isArray(step.tasks) ? step.tasks.length : 0
  const doneWhen = Array.isArray(step.doneWhen) ? step.doneWhen.length : 0
  const pitfalls = Array.isArray(step.pitfalls) ? step.pitfalls.length : 0
  const concepts = Array.isArray(step.concepts) ? step.concepts.length : 0
  const kbLinks = Array.isArray(step.kbLinks) ? step.kbLinks.length : 0
  const questionLinks = Array.isArray(step.questionLinks) ? step.questionLinks.length : 0

  if (tasks < 3 || tasks > 6) issue(`${hint}.tasks`, `expected 3–6 items, found ${tasks}`)
  if (doneWhen < 1 || doneWhen > 4) {
    issue(`${hint}.doneWhen`, `expected 1–4 items, found ${doneWhen}`)
  }
  if (pitfalls < 1 || pitfalls > 3) {
    issue(`${hint}.pitfalls`, `expected 1–3 items, found ${pitfalls}`)
  }
  if (concepts < 2 || concepts > 5) {
    issue(`${hint}.concepts`, `expected 2–5 items, found ${concepts}`)
  }
  if (kbLinks > 3) issue(`${hint}.kbLinks`, `expected 0–3 items, found ${kbLinks}`)
  if (questionLinks > 3) {
    issue(`${hint}.questionLinks`, `expected 0–3 items, found ${questionLinks}`)
  }
}

function checkStep(step, id) {
  const hint = id
  if (step.kind !== 'practice-step') fail(hint, `kind must be "practice-step", got "${step.kind}"`)
  if (step.id !== id) fail(hint, `id "${step.id}" does not match filename "${id}"`)
  const expectedMilestone = idToMilestone.get(id)
  if (expectedMilestone && step.milestone !== expectedMilestone) {
    fail(hint, `milestone "${step.milestone}" does not match meta (${expectedMilestone})`)
  }
  if (!MILESTONE_RE.test(step.milestone || '')) {
    fail(hint, `milestone must match m0–m7, got "${step.milestone}"`)
  }
  const expectedOrder = listedIds.indexOf(id) + 1
  if (expectedOrder > 0 && step.order !== expectedOrder) {
    fail(hint, `order ${step.order} does not match position in meta (${expectedOrder})`)
  }
  assertLocalized(step.title, `${hint}.title`)
  assertLocalized(step.summary, `${hint}.summary`)

  const estimate = step.estimateMin
  if (!Number.isInteger(estimate) || estimate < 30 || estimate > 300) {
    fail(hint, `estimateMin must be an integer 30–300, got ${estimate}`)
  }

  if (!Array.isArray(step.prereqs)) fail(`${hint}.prereqs`, 'expected an array')
  else {
    const seen = new Set()
    for (const [i, prereq] of step.prereqs.entries()) {
      const where = `${hint}.prereqs[${i}]`
      if (!ID_RE.test(prereq)) {
        fail(where, `id must match pXX, got "${prereq}"`)
        continue
      }
      if (seen.has(prereq)) fail(where, `duplicate "${prereq}"`)
      else seen.add(prereq)
      if (!listedSet.has(prereq)) fail(where, `unknown step "${prereq}"`)
      const prereqOrder = listedIds.indexOf(prereq) + 1
      const selfOrder = listedIds.indexOf(id) + 1
      if (prereqOrder > 0 && selfOrder > 0 && prereqOrder >= selfOrder) {
        fail(where, `"${prereq}" must come earlier than ${id}`)
      }
    }
  }

  if (!Array.isArray(step.tags)) fail(`${hint}.tags`, 'expected an array')
  else {
    const seen = new Set()
    for (const [i, tag] of step.tags.entries()) {
      if (typeof tag !== 'string' || !TAG_RE.test(tag)) {
        fail(`${hint}.tags[${i}]`, `tag must be lowercase ascii [a-z0-9-], got "${tag}"`)
      } else if (seen.has(tag)) fail(`${hint}.tags[${i}]`, `duplicate "${tag}"`)
      else seen.add(tag)
    }
  }

  if (!Array.isArray(step.concepts)) fail(`${hint}.concepts`, 'expected an array')
  else {
    for (const [i, concept] of step.concepts.entries()) {
      assertLocalized(concept?.term, `${hint}.concepts[${i}].term`)
      assertLocalized(concept?.explain, `${hint}.concepts[${i}].explain`)
    }
  }

  if (!Array.isArray(step.kbLinks)) fail(`${hint}.kbLinks`, 'expected an array')
  else {
    const seen = new Set()
    for (const [i, link] of step.kbLinks.entries()) {
      const where = `${hint}.kbLinks[${i}]`
      if (!link?.slug) fail(where, 'missing slug')
      else if (!kbSlugs.has(link.slug)) fail(where, `unknown knowledge-base slug "${link.slug}"`)
      else if (seen.has(link.slug)) fail(where, `duplicate slug "${link.slug}"`)
      else seen.add(link.slug)
      assertLocalized(link?.label, `${where}.label`)
    }
  }

  if (!Array.isArray(step.questionLinks)) fail(`${hint}.questionLinks`, 'expected an array')
  else {
    const seen = new Set()
    for (const [i, link] of step.questionLinks.entries()) {
      const where = `${hint}.questionLinks[${i}]`
      if (!link?.id) fail(where, 'missing id')
      else if (!questionIds.has(link.id)) fail(where, `unknown question id "${link.id}"`)
      else if (seen.has(link.id)) fail(where, `duplicate id "${link.id}"`)
      else seen.add(link.id)
      assertLocalized(link?.label, `${where}.label`)
    }
  }

  if (!Array.isArray(step.specRefs)) fail(`${hint}.specRefs`, 'expected an array')
  else {
    for (const [i, ref] of step.specRefs.entries()) {
      if (typeof ref !== 'string' || !ref.trim()) {
        fail(`${hint}.specRefs[${i}]`, 'expected a non-empty string')
      }
    }
  }

  if (!Array.isArray(step.tasks)) fail(`${hint}.tasks`, 'expected an array')
  else {
    for (const [i, task] of step.tasks.entries()) {
      const where = `${hint}.tasks[${i}]`
      assertLocalized(task?.title, `${where}.title`)
      assertLocalized(task?.detail, `${where}.detail`)
      if (task?.code != null) {
        if (!task.code || typeof task.code !== 'object' || Array.isArray(task.code)) {
          fail(`${where}.code`, 'expected { lang, text }')
        } else {
          if (typeof task.code.lang !== 'string' || !task.code.lang.trim()) {
            fail(`${where}.code.lang`, 'expected a non-empty string')
          }
          if (typeof task.code.text !== 'string' || !task.code.text.trim()) {
            fail(`${where}.code.text`, 'expected a non-empty string')
          }
          const extra = Object.keys(task.code).filter((key) => key !== 'lang' && key !== 'text')
          if (extra.length) fail(`${where}.code`, `unexpected keys: ${extra.join(', ')}`)
        }
      }
    }
  }

  if (!Array.isArray(step.doneWhen)) fail(`${hint}.doneWhen`, 'expected an array')
  else {
    for (const [i, item] of step.doneWhen.entries()) {
      assertLocalized(item, `${hint}.doneWhen[${i}]`)
    }
    const hasObservable = (step.doneWhen || []).some((item) => {
      const text = `${item?.en || ''} ${item?.vi || ''}`
      return /`[^`]+`/.test(text) || /\b(returns?|shows?|prints?|renders?|redirects?|reaches|creates?|rejects?|sets?|deletes?|visible|healthy|green|0 hits|404|400|401|403|409|429)\b/i.test(item?.en || '')
    })
    if (!hasObservable) {
      issue(`${hint}.doneWhen`, 'at least one item must be a command or an observable result')
    }
  }

  if (!Array.isArray(step.pitfalls)) fail(`${hint}.pitfalls`, 'expected an array')
  else {
    for (const [i, item] of step.pitfalls.entries()) {
      assertLocalized(item, `${hint}.pitfalls[${i}]`)
    }
  }

  if (typeof step.commit !== 'string' || !COMMIT_RE.test(step.commit)) {
    fail(
      `${hint}.commit`,
      `must match conventional commit "type(scope): subject", got "${step.commit}"`,
    )
  }

  walkStrings(step, (text, pathHint) => {
    if (EMAIL_RE.test(text)) fail(`${hint}.${pathHint}`, 'email-shaped string (PII)')
    if (PHONE_RE.test(text)) fail(`${hint}.${pathHint}`, 'phone-shaped string (PII)')
  })

  checkBudget(step, hint)
}

for (const id of fileIds) {
  const step = stepById.get(id)
  if (step) checkStep(step, id)
}

function hasCycle() {
  const visiting = new Set()
  const visited = new Set()
  function dfs(id) {
    if (visited.has(id) || !stepById.has(id)) return false
    if (visiting.has(id)) return true
    visiting.add(id)
    const step = stepById.get(id)
    for (const prereq of step?.prereqs || []) {
      if (dfs(prereq)) return true
    }
    visiting.delete(id)
    visited.add(id)
    return false
  }
  for (const id of fileIds) {
    if (dfs(id)) return id
  }
  return null
}

const cycleAt = hasCycle()
if (cycleAt) fail('prereqs', `cycle detected at ${cycleAt}`)

walkStrings(meta, (text, pathHint) => {
  if (EMAIL_RE.test(text)) fail(`practice/meta.json.${pathHint}`, 'email-shaped string (PII)')
  if (PHONE_RE.test(text)) fail(`practice/meta.json.${pathHint}`, 'phone-shaped string (PII)')
}, 'meta')

function printStats() {
  const byMilestone = new Map()
  for (const id of listedIds) {
    const milestone = idToMilestone.get(id)
    if (!byMilestone.has(milestone)) {
      byMilestone.set(milestone, { listed: 0, present: 0, minutes: 0 })
    }
    const row = byMilestone.get(milestone)
    row.listed += 1
    const step = stepById.get(id)
    if (step) {
      row.present += 1
      row.minutes += Number(step.estimateMin) || 0
    }
  }
  console.log('milestone\tlisted\tpresent\testimateMin')
  let listed = 0
  let present = 0
  let minutes = 0
  for (const [id, row] of byMilestone.entries()) {
    console.log(`${id}\t${row.listed}\t${row.present}\t${row.minutes}`)
    listed += row.listed
    present += row.present
    minutes += row.minutes
  }
  console.log(`TOTAL\t${listed}\t${present}\t${minutes}`)
  console.log(
    `summary: ${present} step file(s) of ${listed} listed, ${minutes} min, draft=${draft}`,
  )
}

if (statsOnly) printStats()

for (const message of warnings) console.log(`warn: ${message}`)

if (errors.length) {
  console.error(`Practice check failed (${errors.length} issue(s)):`)
  for (const error of errors.slice(0, 80)) console.error(` - ${error}`)
  if (errors.length > 80) console.error(` - …and ${errors.length - 80} more`)
  process.exit(1)
}

if (!statsOnly) console.log('Practice check OK')
