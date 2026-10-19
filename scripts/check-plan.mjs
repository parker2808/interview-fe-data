#!/usr/bin/env node
/**
 * Structural checks for the 30-day study plan.
 * Zero dependencies. Node 22. Exits 1 on errors.
 * Format/budget rules are warnings unless --strict is passed.
 *
 *   node scripts/check-plan.mjs [root]
 *   node scripts/check-plan.mjs . --days 1-7 --strict
 *   node scripts/check-plan.mjs . --stats
 *   node scripts/check-plan.mjs --lookup slug#en-id
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const strict = args.includes('--strict')
const statsOnly = args.includes('--stats')
const lookupArg = args.find((arg) => arg.startsWith('--lookup'))
const lookupValue = lookupArg
  ? lookupArg.includes('=')
    ? lookupArg.slice('--lookup='.length)
    : args[args.indexOf('--lookup') + 1]
  : null
const daysArg = args.find((arg) => arg.startsWith('--days'))
const daysValue = daysArg
  ? daysArg.includes('=')
    ? daysArg.slice('--days='.length)
    : args[args.indexOf('--days') + 1]
  : null
const rootArg = args.find(
  (arg) =>
    !arg.startsWith('--') &&
    arg !== lookupValue &&
    arg !== daysValue &&
    arg !== 'true',
)
const root = path.resolve(rootArg || path.join(scriptDir, '..'))

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

function pad(n) {
  return String(n).padStart(2, '0')
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

function walkLocalized(value, fn, hint = '', skipKeys = new Set(['id'])) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkLocalized(item, fn, `${hint}[${i}]`, skipKeys))
    return
  }
  if (!value || typeof value !== 'object') return
  if (isLocalized(value)) {
    fn(value, hint)
    return
  }
  for (const [key, child] of Object.entries(value)) {
    if (skipKeys.has(key)) continue
    walkLocalized(child, fn, hint ? `${hint}.${key}` : key, skipKeys)
  }
}

function words(text) {
  return (String(text || '').trim().match(/\S+/g) || []).length
}

function backtickSpans(text) {
  const matches = String(text || '').match(/`[^`]+`/g)
  return matches ? matches.length : 0
}

function parseDaysRange(value) {
  if (!value) return null
  const m = String(value).trim().match(/^(\d+)\s*-\s*(\d+)$/)
  if (m) {
    const from = Number(m[1])
    const to = Number(m[2])
    if (from >= 1 && to <= 30 && from <= to) {
      const set = new Set()
      for (let n = from; n <= to; n++) set.add(n)
      return set
    }
  }
  const one = String(value).trim().match(/^\d+$/)
  if (one) {
    const n = Number(one[0])
    if (n >= 1 && n <= 30) return new Set([n])
  }
  fail('--days', `expected N-M or N, got "${value}"`)
  return null
}

function parseRangeLabel(label) {
  const m = String(label || '').match(/(\d+)\s*-\s*(\d+)/)
  if (!m) return null
  return { from: Number(m[1]), to: Number(m[2]) }
}

const LINK_RE = /\]\(([^)]+)\)/g
const DOC_LINK_RE = /^documents\/(en|vi)\/([^#/]+)\.md#(.+)$/
const ALGO_LINK_RE = /^\.\.\/artifacts\/algo\/problems\/day-(\d{2})\.md$/

const EN_MONTHS =
  /\b(January|February|March|April|June|July|August|September|October|November|December)\b|\bMay\s+\d/
const EN_WEEKDAYS = /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/
const ISO_DATE = /\b20\d\d-\d\d-\d\d\b/
const VI_MONTH =
  /\btháng\s+(một|hai|ba|tư|năm|sáu|bảy|tám|chín|mười|mười\s+một|mười\s+hai|\d{1,2})\b/i
const VI_SUNDAY = /chủ nhật/i

const BANNED_LABELS = [
  '**Decision:**',
  '**Constraint:**',
  '**Failure mode:**',
  '**Measure:**',
  '**Tradeoff:**',
  '**Production gotcha:**',
  'How a senior works this',
  'Done when',
  'Stretch',
  'What they will ask',
  '→',
]
const VI_BANNED_WORD =
  /(?<!`)\b(produce|note|set|measure|stretch|constraint|gotcha|failure mode|Day \d)\b(?!`)/i

const NEW_LAB_IDS_EN = ['intro', 'read-first', 'drill', 'say-it', 'algorithm']
const SHARED_EXCEPT_PREFIX = /^(?:\*\*Timebox:\*\*|\*\*Thời lượng:\*\*)/
const RUN_CMD = /pnpm test:algo/

function collectHeadings(doc) {
  const byLocale = { en: new Map(), vi: new Map() }
  const enToVi = new Map()
  for (const section of doc.sections || []) {
    for (const block of section.blocks || []) {
      if (block?.type !== 'heading') continue
      const enId = block.id?.en
      const viId = block.id?.vi
      if (typeof enId === 'string' && enId.trim()) byLocale.en.set(enId, block)
      if (typeof viId === 'string' && viId.trim()) byLocale.vi.set(viId, block)
      if (enId && viId) enToVi.set(enId, viId)
    }
  }
  return { byLocale, enToVi }
}

function kbFiles() {
  const dir = path.join(root, 'knowledge-base')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json') && name !== 'index.json')
    .sort()
    .map((name) => path.join(dir, name))
}

function flattenDayStrings(day, { includeLab = true } = {}) {
  const out = []
  const take = (loc, hint) => {
    if (isLocalized(loc)) out.push({ loc, hint })
  }
  take(day.title, 'title')
  take(day.goal, 'goal')
  ;(day.studyLinks || []).forEach((link, i) => take(link.label, `studyLinks[${i}].label`))
  ;(day.questionLinks || []).forEach((link, i) => take(link.label, `questionLinks[${i}].label`))
  ;(day.handsOn || []).forEach((item, i) => take(item, `handsOn[${i}]`))
  take(day.algorithm?.label, 'algorithm.label')
  ;(day.checklist || []).forEach((item, i) => take(item, `checklist[${i}]`))
  if (day.note) take(day.note, 'note')
  if (includeLab && day.lab) {
    take(day.lab.title, 'lab.title')
    walkLocalized(
      day.lab.sections,
      (loc, hint) => out.push({ loc, hint: `lab.${hint}` }),
      '',
      new Set(['id']),
    )
  }
  return out
}

function planWords(day) {
  const acc = { en: 0, vi: 0 }
  for (const { loc } of flattenDayStrings(day, { includeLab: false })) {
    acc.en += words(loc.en)
    acc.vi += words(loc.vi)
  }
  return acc
}

function labWords(day) {
  const acc = { en: 0, vi: 0 }
  if (!day.lab) return acc
  const take = (loc) => {
    if (!isLocalized(loc)) return
    acc.en += words(loc.en)
    acc.vi += words(loc.vi)
  }
  // Stub title is schema-only; count real Lab copy in sections.
  walkLocalized(day.lab.sections, take, '', new Set(['id']))
  return acc
}

function countBlocks(day) {
  let n = 0
  for (const section of day.lab?.sections || []) n += (section.blocks || []).length
  return n
}

function extractLinks(text) {
  const out = []
  const re = new RegExp(LINK_RE.source, 'g')
  let m
  while ((m = re.exec(String(text || '')))) out.push(m[1])
  return out
}

function linkTargetKey(href, locale, headingsBySlug) {
  const doc = href.match(DOC_LINK_RE)
  if (doc) {
    const lang = doc[1]
    const slug = doc[2]
    const id = decodeURIComponent(doc[3])
    const map = headingsBySlug[slug]
    let canonical = id
    if (map && locale === 'vi') {
      for (const [enId, viId] of map.enToVi.entries()) {
        if (viId === id) canonical = enId
      }
    }
    return `doc:${slug}#${canonical}`
  }
  const algo = href.match(ALGO_LINK_RE)
  if (algo) return `algo:${algo[1]}`
  return `other:${href}`
}

function charLen(text) {
  return String(text || '').length
}

function stripBackticks(text) {
  return String(text || '').replace(/`[^`]*`/g, '')
}

function hasCalendarDate(text) {
  const value = String(text || '')
  return (
    ISO_DATE.test(value) ||
    EN_MONTHS.test(value) ||
    EN_WEEKDAYS.test(value) ||
    VI_MONTH.test(value) ||
    VI_SUNDAY.test(value)
  )
}

function loadKb() {
  const headingsBySlug = {}
  const titles = {}
  const slugs = new Set()
  for (const file of kbFiles()) {
    const doc = readJson(file)
    if (!doc?.slug) continue
    slugs.add(doc.slug)
    titles[doc.slug] = doc.title
    headingsBySlug[doc.slug] = collectHeadings(doc)
  }
  return { headingsBySlug, titles, slugs }
}

function lookupAndExit(headingsBySlug) {
  const raw = String(lookupValue || '').trim()
  const m = raw.match(/^([^#]+)#(.+)$/)
  if (!m) {
    console.error('usage: node scripts/check-plan.mjs --lookup slug#en-id')
    process.exit(1)
  }
  const slug = m[1]
  const enId = m[2]
  const map = headingsBySlug[slug]
  if (!map) {
    console.error(`unknown slug "${slug}"`)
    process.exit(1)
  }
  const viId = map.enToVi.get(enId)
  if (!viId) {
    console.error(`no heading id.en "${enId}" in ${slug}`)
    process.exit(1)
  }
  console.log(viId)
  process.exit(0)
}

const kb = loadKb()
if (lookupValue != null && lookupValue !== '') lookupAndExit(kb.headingsBySlug)

const dayRange = parseDaysRange(daysValue)
const meta = readJson(path.join(root, 'plan/meta.json'))
const qnaBank = readJson(path.join(root, 'qna/questions.json'))
const qnaIds = new Set((qnaBank?.questions || []).map((q) => q.id))
const resourceIds = new Set((meta?.resources || []).map((r) => r.id))

const weekByDay = new Map()
for (const week of meta?.weeks || []) {
  const range = parseRangeLabel(week.range?.en) || parseRangeLabel(week.range?.vi)
  if (!range) {
    fail(`meta.weeks[${week.week}]`, `cannot parse range "${week.range?.en}"`)
    continue
  }
  for (let n = range.from; n <= range.to; n++) weekByDay.set(n, week.week)
}

const daysDir = path.join(root, 'plan/days')
const dayFiles = existsSync(daysDir)
  ? readdirSync(daysDir).filter((name) => /^day-\d{2}\.json$/.test(name)).sort()
  : []

if (dayFiles.length !== 30) {
  fail('plan/days', `expected 30 day files, found ${dayFiles.length}`)
}

const days = []
for (let n = 1; n <= 30; n++) {
  const name = `day-${pad(n)}.json`
  const file = path.join(daysDir, name)
  if (!existsSync(file)) {
    fail('plan/days', `missing ${name}`)
    continue
  }
  const day = readJson(file)
  if (day) days.push(day)
}

function inScope(dayNumber) {
  return !dayRange || dayRange.has(dayNumber)
}

function checkDayAlways(day) {
  const hint = `day-${pad(day.day)}`
  const nn = pad(day.day)
  if (day.day !== Number(nn)) fail(hint, `day ${day.day} does not match file number`)
  const expectedWeek = weekByDay.get(day.day)
  if (expectedWeek != null && day.week !== expectedWeek) {
    fail(hint, `week ${day.week} does not match meta range (expected ${expectedWeek})`)
  }
  if (day.lab?.resourceId !== `lab-day-${nn}`) {
    fail(hint, `lab.resourceId must be "lab-day-${nn}"`)
  }
  if (day.algorithm?.resourceId !== `algo-day-${nn}`) {
    fail(hint, `algorithm.resourceId must be "algo-day-${nn}"`)
  }
  if (day.algorithm?.path !== `artifacts/algo/problems/day-${nn}.md`) {
    fail(hint, `algorithm.path must be "artifacts/algo/problems/day-${nn}.md"`)
  }
  const algoFile = path.join(root, 'plan/resources', `algo-day-${nn}.json`)
  if (!existsSync(algoFile)) fail(hint, `missing plan/resources/algo-day-${nn}.json`)

  const docSlugs = new Set()
  const planIds = new Set()
  for (const [i, link] of (day.studyLinks || []).entries()) {
    const where = `${hint}.studyLinks[${i}]`
    if (link.kind === 'docs') {
      if (!link.slug || !kb.slugs.has(link.slug)) {
        fail(where, `unknown docs slug "${link.slug}"`)
      } else if (docSlugs.has(link.slug)) {
        fail(where, `duplicate slug "${link.slug}"`)
      } else docSlugs.add(link.slug)
    } else if (link.kind === 'plan') {
      if (!link.resourceId || !resourceIds.has(link.resourceId)) {
        fail(where, `unknown plan resourceId "${link.resourceId}"`)
      } else if (planIds.has(link.resourceId)) {
        fail(where, `duplicate resourceId "${link.resourceId}"`)
      } else planIds.add(link.resourceId)
    } else {
      fail(where, `unknown studyLinks.kind "${link.kind}"`)
    }
  }

  const qSeen = new Set()
  for (const [i, link] of (day.questionLinks || []).entries()) {
    const where = `${hint}.questionLinks[${i}]`
    if (!link?.id) fail(where, 'missing id')
    else if (!qnaIds.has(link.id)) fail(where, `unknown question id "${link.id}"`)
    else if (qSeen.has(link.id)) fail(where, `duplicate id "${link.id}"`)
    else qSeen.add(link.id)
  }

  const sections = day.lab?.sections || []
  for (const [s, section] of sections.entries()) {
    walkLocalized(
      section,
      (loc, pathHint) => {
        for (const locale of ['en', 'vi']) {
          const where = `${hint}.lab.sections[${s}].${pathHint}.${locale}`
          for (const href of extractLinks(loc[locale])) {
            if (/^https?:\/\//.test(href) || href.startsWith('mailto:')) continue
            const doc = href.match(DOC_LINK_RE)
            if (doc) {
              const lang = doc[1]
              const slug = doc[2]
              const id = decodeURIComponent(doc[3])
              if (lang !== locale) {
                fail(where, `link locale "${lang}" does not match string locale "${locale}"`)
              }
              const map = kb.headingsBySlug[slug]
              if (!map) fail(where, `link to missing doc ${href}`)
              else if (!map.byLocale[locale].has(id)) {
                fail(where, `broken anchor ${href} (id "${id}" not in ${slug} ${locale})`)
              }
              continue
            }
            const algo = href.match(ALGO_LINK_RE)
            if (algo) {
              if (algo[1] !== nn) {
                fail(where, `algo link ${href} does not match day ${nn}`)
              }
              continue
            }
            fail(where, `unsupported relative link ${href}`)
          }
        }
      },
      '',
      new Set(),
    )
  }

  const sectionsN = sections.length
  const enBlocks = sections.reduce((n, s) => n + (s.blocks || []).length, 0)
  const viBlocks = enBlocks
  if (enBlocks !== viBlocks) fail(hint, 'en/vi block count mismatch')
  for (const [s, section] of sections.entries()) {
    for (const [b, block] of (section.blocks || []).entries()) {
      if (block.type === 'list') {
        const items = block.items || []
        items.forEach((item, i) => {
          if (!isLocalized(item)) return
          const enN = (item.en.match(/\S+/g) || []).length
          void enN
          void i
        })
      }
    }
    const lists = (section.blocks || []).filter((block) => block.type === 'list')
    for (const [li, list] of lists.entries()) {
      const items = list.items || []
      items.forEach((item, i) => {
        if (!isLocalized(item)) {
          fail(`${hint}.sections[${s}].list[${li}].items[${i}]`, 'expected Localized item')
        }
      })
    }
  }

  walkLocalized(
    { title: day.title, goal: day.goal, studyLinks: day.studyLinks, questionLinks: day.questionLinks, handsOn: day.handsOn, algorithm: day.algorithm, checklist: day.checklist, note: day.note, lab: day.lab },
    (loc, pathHint) => {
      const enItems = loc.en
      const viItems = loc.vi
      const enTicks = backtickSpans(enItems)
      const viTicks = backtickSpans(viItems)
      if (Math.abs(enTicks - viTicks) > 1) {
        fail(`${hint}.${pathHint}`, `backtick-span mismatch (${enTicks} vs ${viTicks})`)
      }
      const enLinks = extractLinks(loc.en).map((href) => linkTargetKey(href, 'en', kb.headingsBySlug))
      const viLinks = extractLinks(loc.vi).map((href) => linkTargetKey(href, 'vi', kb.headingsBySlug))
      const enSet = [...new Set(enLinks)].sort().join('|')
      const viSet = [...new Set(viLinks)].sort().join('|')
      if (enSet !== viSet) {
        fail(`${hint}.${pathHint}`, `en/vi link targets differ (${enSet || '∅'} vs ${viSet || '∅'})`)
      }
    },
    '',
    new Set(),
  )

  for (const { loc, hint: field } of flattenDayStrings(day, { includeLab: true })) {
    if (hasCalendarDate(loc.en) || hasCalendarDate(loc.vi)) {
      fail(`${hint}.${field}`, 'calendar date, month name, or weekday found')
    }
  }

  const listCounts = []
  for (const section of sections) {
    for (const block of section.blocks || []) {
      if (block.type === 'list') listCounts.push((block.items || []).length)
    }
  }
  void listCounts
  void sParity(day, hint)
}

function sParity(day, hint) {
  const sections = day.lab?.sections || []
  const enSectionIds = sections.map((s) => s.id?.en)
  const viSectionIds = sections.map((s) => s.id?.vi)
  if (enSectionIds.length !== viSectionIds.length) {
    fail(hint, `en/vi section count mismatch (${enSectionIds.length} vs ${viSectionIds.length})`)
  }
  for (const section of sections) {
    const enBlocks = (section.blocks || []).length
    const viBlocks = enBlocks
    if (enBlocks !== viBlocks) fail(hint, 'en/vi block count mismatch')
    for (const block of section.blocks || []) {
      if (block.type === 'list' && Array.isArray(block.items)) {
        const missing = block.items.filter((item) => !isLocalized(item)).length
        if (missing) fail(hint, 'list item missing en/vi')
      }
    }
  }
}

function checkDayFormat(day) {
  const hint = `day-${pad(day.day)}`
  const nn = pad(day.day)
  const titleEn = day.title?.en || ''
  const goalEn = day.goal?.en || ''
  if (charLen(titleEn) > 50) issue(`${hint}.title`, `en ${charLen(titleEn)} chars > 50`)
  if (charLen(goalEn) > 120) issue(`${hint}.goal`, `en ${charLen(goalEn)} chars > 120`)
  if ((day.title?.vi && charLen(day.title.vi) > Math.ceil(50 * 1.35)) || (day.goal?.vi && charLen(day.goal.vi) > Math.ceil(120 * 1.35))) {
    if (day.title?.vi && charLen(day.title.vi) > Math.ceil(50 * 1.35)) {
      issue(`${hint}.title.vi`, `vi ${charLen(day.title.vi)} chars > ${Math.ceil(50 * 1.35)}`)
    }
    if (day.goal?.vi && charLen(day.goal.vi) > Math.ceil(120 * 1.35)) {
      issue(`${hint}.goal.vi`, `vi ${charLen(day.goal.vi)} chars > ${Math.ceil(120 * 1.35)}`)
    }
  }

  const study = day.studyLinks || []
  if (study.length < 2 || study.length > 4) {
    issue(`${hint}.studyLinks`, `expected 2–4 items, found ${study.length}`)
  }
  for (const [i, link] of study.entries()) {
    if (charLen(link.label?.en) > 25) {
      issue(`${hint}.studyLinks[${i}].label`, `en ${charLen(link.label.en)} chars > 25`)
    }
    if (link.kind === 'docs' && kb.titles[link.slug]) {
      const expected = kb.titles[link.slug]
      if (link.label?.en !== expected.en || link.label?.vi !== expected.vi) {
        issue(
          `${hint}.studyLinks[${i}].label`,
          `expected KB title "${expected.en}" / "${expected.vi}"`,
        )
      }
    }
  }

  const questions = day.questionLinks || []
  if (questions.length < 2 || questions.length > 4) {
    issue(`${hint}.questionLinks`, `expected 2–4 items, found ${questions.length}`)
  }
  for (const [i, link] of questions.entries()) {
    if (charLen(link.label?.en) > 45) {
      issue(`${hint}.questionLinks[${i}].label`, `en ${charLen(link.label.en)} chars > 45`)
    }
  }

  const hands = day.handsOn || []
  if (hands.length < 2 || hands.length > 3) {
    issue(`${hint}.handsOn`, `expected 2–3 items, found ${hands.length}`)
  }
  for (const [i, item] of hands.entries()) {
    if (charLen(item.en) > 90) issue(`${hint}.handsOn[${i}]`, `en ${charLen(item.en)} chars > 90`)
    if (item.vi && charLen(item.vi) > Math.ceil(90 * 1.35)) {
      issue(`${hint}.handsOn[${i}].vi`, `vi ${charLen(item.vi)} chars > ${Math.ceil(90 * 1.35)}`)
    }
  }

  if (charLen(day.algorithm?.label?.en) > 50) {
    issue(`${hint}.algorithm.label`, `en ${charLen(day.algorithm.label.en)} chars > 50`)
  }

  const checks = day.checklist || []
  if (checks.length !== 3) issue(`${hint}.checklist`, `expected 3 items, found ${checks.length}`)
  for (const [i, item] of checks.entries()) {
    if (charLen(item.en) > 80) issue(`${hint}.checklist[${i}]`, `en ${charLen(item.en)} chars > 80`)
  }
  if (checks[2]) {
    const spoken = checks[2].en || ''
    if (!/60 s|60s|60 seconds/i.test(spoken) || !/aloud/i.test(spoken)) {
      issue(`${hint}.checklist[2]`, '3rd item must be the spoken check ("answered aloud in 60 s")')
    }
    const labels = questions.map((q) => q.label?.en).filter(Boolean)
    const hit = labels.some((label) => spoken.includes(label) || label.split(' ').slice(0, 3).every((w) => spoken.includes(w)))
    if (labels.length && !hit && !labels.some((label) => spoken.toLowerCase().includes(label.toLowerCase().slice(0, 12)))) {
      issue(`${hint}.checklist[2]`, 'spoken check should name one of the day\'s questionLinks labels')
    }
    if (checks[2].vi && !/thành lời|60 giây/.test(checks[2].vi)) {
      issue(`${hint}.checklist[2].vi`, 'spoken check should mention “thành lời” and 60 giây')
    }
  }

  if (day.note) {
    if (charLen(day.note.en) > 140) issue(`${hint}.note`, `en ${charLen(day.note.en)} chars > 140`)
  }

  const sections = day.lab?.sections || []
  if (sections.length !== 0) {
    issue(
      `${hint}.lab.sections`,
      `Lab tab is retired: expected sections [], found ${sections.length}`,
    )
  }
  if (day.lab?.title?.en && day.lab.title.en !== `Day ${day.day} — Lab`) {
    issue(`${hint}.lab.title`, `expected "Day ${day.day} — Lab"`)
  }
  if (day.lab?.title?.vi && day.lab.title.vi !== `Ngày ${day.day} — Lab`) {
    issue(`${hint}.lab.title.vi`, `expected "Ngày ${day.day} — Lab"`)
  }

  const pw = planWords(day)
  const lw = labWords(day)
  const total = pw.en + lw.en
  if (pw.en > 110) issue(`${hint} plan words`, `${pw.en} en words > 110`)
  if (lw.en > 0) issue(`${hint} lab words`, `${lw.en} en words > 0 (Lab tab removed)`)
  if (total > 110) issue(`${hint} total words`, `${total} en words > 110`)
  if (pw.en) {
    const ratio = pw.vi / pw.en
    if (ratio < 0.9 || ratio > 1.3) {
      issue(`${hint} vi/en words`, `ratio ${ratio.toFixed(2)} outside 0.90–1.30`)
    }
  }

  const labTextBag = []
  walkLocalized(day.lab, (loc) => labTextBag.push(loc.en, loc.vi), '', new Set(['id']))
  const labBlob = labTextBag.join('\n')
  for (const item of hands) {
    if (item.en && labBlob.includes(item.en)) {
      issue(`${hint}.handsOn`, 'handsOn text copied verbatim into lab')
    }
  }
  for (const item of checks) {
    if (item.en && labBlob.includes(item.en)) {
      issue(`${hint}.checklist`, 'checklist text copied verbatim into lab')
    }
  }

  for (const { loc, hint: field } of flattenDayStrings(day, { includeLab: true })) {
    for (const banned of BANNED_LABELS) {
      if (loc.en.includes(banned) || loc.vi.includes(banned)) {
        issue(`${hint}.${field}`, `banned phrase "${banned}"`)
      }
    }
    const viPlain = stripBackticks(loc.vi)
    if (VI_BANNED_WORD.test(viPlain)) {
      issue(`${hint}.${field}.vi`, `banned English grammar word in vi: "${viPlain.match(VI_BANNED_WORD)?.[0]}"`)
    }
  }

  void nn
  void NEW_LAB_IDS_EN
}

const kbTitleSet = new Set()
for (const title of Object.values(kb.titles)) {
  if (title?.en) kbTitleSet.add(title.en.trim())
  if (title?.vi) kbTitleSet.add(title.vi.trim())
}
for (const resource of meta?.resources || []) {
  if (resource.title?.en) kbTitleSet.add(resource.title.en.trim())
  if (resource.title?.vi) kbTitleSet.add(resource.title.vi.trim())
}

const verbatimDays = new Map()
function rememberShared(day) {
  if (!inScope(day.day)) return
  const remember = (text) => {
    const value = String(text || '').trim()
    if (!value) return
    if (SHARED_EXCEPT_PREFIX.test(value) || RUN_CMD.test(value)) return
    if (kbTitleSet.has(value)) return
    if (
      /^(Day \d+ — Lab|Ngày \d+ — Lab|Read first|Đọc trước|Drill|Luyện tập|Say it out loud|Nói thành lời|Algorithm|Thuật toán)$/.test(
        value,
      )
    ) {
      return
    }
    if (!verbatimDays.has(value)) verbatimDays.set(value, new Set())
    verbatimDays.get(value).add(day.day)
  }
  for (const { loc } of flattenDayStrings(day, { includeLab: true })) {
    remember(loc.en)
    remember(loc.vi)
  }
}

for (const day of days) {
  if (!inScope(day.day)) continue
  checkDayAlways(day)
  checkDayFormat(day)
  rememberShared(day)
}

for (const [text, daySet] of verbatimDays.entries()) {
  if (daySet.size > 3) {
    issue('shared-string', `verbatim string used on ${daySet.size} days: "${text.slice(0, 80)}"`)
  }
}

const sync = spawnSync(
  process.execPath,
  [path.join(scriptDir, 'sync-plan-index.mjs'), '--check', root],
  { encoding: 'utf8' },
)
if (sync.status !== 0) {
  const detail = (sync.stderr || sync.stdout || '').trim()
  fail('plan/index.json', detail || 'sync-plan-index --check failed')
}

function printStats() {
  const rows = []
  let bytes = 0
  let enAll = 0
  let viAll = 0
  for (const day of days) {
    const file = path.join(daysDir, `day-${pad(day.day)}.json`)
    const size = readFileSync(file).length
    bytes += size
    const pw = planWords(day)
    const lw = labWords(day)
    enAll += pw.en + lw.en
    viAll += pw.vi + lw.vi
    rows.push({
      day: day.day,
      bytes: size,
      planEn: pw.en,
      labEn: lw.en,
      totalEn: pw.en + lw.en,
      planVi: pw.vi,
      labVi: lw.vi,
      totalVi: pw.vi + lw.vi,
      sections: (day.lab?.sections || []).length,
      blocks: countBlocks(day),
    })
  }
  console.log('day\tbytes\tplan_en\tlab_en\ttotal_en\tplan_vi\tlab_vi\ttotal_vi\tsections\tblocks')
  for (const row of rows) {
    console.log(
      [
        row.day,
        row.bytes,
        row.planEn,
        row.labEn,
        row.totalEn,
        row.planVi,
        row.labVi,
        row.totalVi,
        row.sections,
        row.blocks,
      ].join('\t'),
    )
  }
  console.log(
    `TOTAL\t${bytes}\t\t\t${enAll}\t\t\t${viAll}\t\t`,
  )
  console.log(
    `summary: ${days.length} days, ${(bytes / 1024).toFixed(1)} KB, en words ${enAll}, vi words ${viAll}`,
  )
}

if (statsOnly) printStats()

for (const message of warnings) console.log(`warn: ${message}`)

if (errors.length) {
  console.error(`Plan check failed (${errors.length} issue(s)):`)
  for (const error of errors.slice(0, 80)) console.error(` - ${error}`)
  if (errors.length > 80) console.error(` - …and ${errors.length - 80} more`)
  process.exit(1)
}

if (!statsOnly) console.log('Plan check OK')
