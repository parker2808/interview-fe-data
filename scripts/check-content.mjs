#!/usr/bin/env node
/**
 * Structural checks for knowledge-base docs and qna/questions.json.
 * Zero dependencies. Node 22. Exits non-zero on any error.
 *
 *   node scripts/check-content.mjs [root]
 *   node scripts/check-content.mjs --strict [root]   # B31: fail if any legacy item remains
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const strict = args.includes('--strict')
const rootArg = args.find((arg) => arg !== '--strict')
const root = path.resolve(rootArg || path.join(scriptDir, '..'))

const ALLOWED_BLOCK_TYPES = new Set([
  'heading',
  'paragraph',
  'list',
  'callout',
  'code',
  'table',
  'senior-answer',
  'key-takeaways',
  'markdown',
  'thematic-break',
])
const ALLOWED_LIST_STYLES = new Set(['ul', 'ol'])
const ALLOWED_CALLOUT_KINDS = new Set(['note', 'warning', 'tip', 'quote'])
const ALLOWED_CODE_LANGS = new Set([
  'ts',
  'tsx',
  'vue',
  'js',
  'css',
  'html',
  'json',
  'bash',
  'text',
])
const ALLOWED_ALIGN = new Set(['left', 'center', 'right'])

const KB_MIGRATED_LABEL = 'How to answer in the interview'
const KB_LEGACY_LABEL = 'Interview phrasing'
const KB_EXPECTED_TOPICS = 192
const QNA_EXPECTED = 142
const MIN_CATEGORY_COUNTS = { soft: 29, technical: 86, situational: 27 }

const PROCESS_SLUGS = new Set([
  'leadership',
  'practical-questions',
  'devops',
  'monitoring',
  'system-design',
])

const KB_REQUIRED = [
  {
    id: 1,
    match: (block) =>
      block.type === 'paragraph' && startsWithBold(block.text?.en, 'In short:'),
    hint: 'paragraph **In short:** / **Tóm tắt:**',
  },
  {
    id: 7,
    match: (block) =>
      block.type === 'senior-answer' && block.label?.en === 'Senior perspective',
    hint: 'senior-answer "Senior perspective"',
  },
  {
    id: 8,
    match: (block) =>
      block.type === 'callout' &&
      block.kind === 'warning' &&
      startsWithBold(block.text?.en, 'Common pitfalls'),
    hint: 'callout warning **Common pitfalls**',
  },
  {
    id: 9,
    match: (block) =>
      block.type === 'senior-answer' &&
      block.label?.en === 'What interviewers really ask',
    hint: 'senior-answer "What interviewers really ask"',
  },
  {
    id: 10,
    match: (block) =>
      block.type === 'senior-answer' && block.label?.en === KB_MIGRATED_LABEL,
    hint: 'senior-answer "How to answer in the interview"',
  },
  {
    id: 11,
    match: (block) => block.type === 'key-takeaways',
    hint: 'key-takeaways',
  },
  {
    id: 12,
    match: (block) =>
      block.type === 'senior-answer' &&
      block.label?.en === 'Likely follow-up questions',
    hint: 'senior-answer "Likely follow-up questions"',
  },
  {
    id: 13,
    match: (block) => block.type === 'thematic-break',
    hint: 'thematic-break',
  },
]

const QNA_TECHNICAL_LABELS = {
  en: [
    '**Short answer:**',
    '**Explanation:**',
    '**Senior perspective:**',
    '**Common pitfalls:**',
    '**How to say it (about 45 s):**',
  ],
  vi: [
    '**Trả lời ngắn:**',
    '**Giải thích:**',
    '**Góc nhìn senior:**',
    '**Lỗi hay gặp:**',
    '**Nói khi phỏng vấn (~45 giây):**',
  ],
}

const QNA_SOFT_LABELS = {
  en: [
    '**What they are checking:**',
    '**How to structure it:**',
    '**Senior signals to include:**',
    '**Avoid:**',
  ],
  vi: [
    '**Nhà tuyển dụng muốn thấy:**',
    '**Cách trình bày:**',
    '**Tín hiệu senior nên có:**',
    '**Nên tránh:**',
  ],
}

const VI_FORBIDDEN_LABELS = [
  'Failure mode',
  'Measure',
  'Production gotchas',
  'Tradeoffs',
  'What they actually ask',
  'Interview phrasing',
]

const errors = []
const warnings = []

function fail(hint, message) {
  errors.push(`${hint}: ${message}`)
}

function warn(hint, message) {
  warnings.push(`${hint}: ${message}`)
}

function startsWithBold(text, label) {
  return typeof text === 'string' && text.trimStart().startsWith(`**${label}`)
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
  const en = value.en.trim()
  const vi = value.vi.trim()
  // Match validate.mjs: both empty is allowed (table corner cells); one-sided empty is not.
  if (en || vi) {
    if (!en) fail(hint, 'missing non-empty `en`')
    if (!vi) fail(hint, 'missing non-empty `vi`')
  }
  return true
}

function walkLocalized(value, fn, hint = '') {
  if (Array.isArray(value)) {
    value.forEach((item, i) => walkLocalized(item, fn, `${hint}[${i}]`))
    return
  }
  if (!value || typeof value !== 'object') return
  if (isLocalized(value)) {
    fn(value, hint)
    return
  }
  for (const [key, child] of Object.entries(value)) {
    walkLocalized(child, fn, hint ? `${hint}.${key}` : key)
  }
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (err) {
    fail(file, `invalid JSON (${err instanceof Error ? err.message : err})`)
    return null
  }
}

function kbFiles() {
  const dir = path.join(root, 'knowledge-base')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.json') && name !== 'index.json')
    .sort()
    .map((name) => path.join(dir, name))
}

function flattenBlocks(doc) {
  const blocks = []
  for (const [s, section] of (doc.sections || []).entries()) {
    for (const [b, block] of (section.blocks || []).entries()) {
      blocks.push({ block, hint: `${doc.slug}.sections[${s}].blocks[${b}]` })
    }
  }
  return blocks
}

function leafTopics(doc) {
  const flat = flattenBlocks(doc)
  const topics = []
  for (let i = 0; i < flat.length; i++) {
    const { block } = flat[i]
    if (block?.type !== 'heading') continue
    const body = []
    let j = i + 1
    while (j < flat.length && flat[j].block?.type !== 'heading') {
      body.push(flat[j])
      j++
    }
    if (!body.some((entry) => entry.block.type === 'senior-answer')) continue
    topics.push({ heading: block, body, hint: `${doc.slug}#${block.id?.en || '?'}` })
  }
  return topics
}

function countFences(text) {
  return (text.match(/```/g) || []).length
}

function countListLines(text) {
  return text.split('\n').filter((line) => /^\s*([-*]|\d+\.) /.test(line)).length
}

function countLabels(text) {
  return (text.match(/\*\*[^*]+?:\*\*/g) || []).length
}

function countLinks(text) {
  return (text.match(/\]\([^)]+\)/g) || []).length
}

function checkParity(loc, hint) {
  const pairs = [
    ['fences', countFences],
    ['list lines', countListLines],
    ['**…:** labels', countLabels],
    ['links', countLinks],
  ]
  for (const [name, fn] of pairs) {
    const en = fn(loc.en)
    const vi = fn(loc.vi)
    if (en !== vi) fail(hint, `en/vi ${name} mismatch (${en} vs ${vi})`)
  }
}

const LINK_RE = /\]\(([^)]+)\)/g

function parseHref(href, currentSlug) {
  if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return { kind: 'external', href }
  }
  if (/README/i.test(href)) return { kind: 'readme', href }
  if (href.startsWith('#')) {
    return { kind: 'anchor', slug: currentSlug, id: decodeHash(href.slice(1)), href }
  }
  const withHash = href.match(/^(?:\.\/)?([^#/]+)\.md#(.+)$/)
  if (withHash) {
    return {
      kind: 'anchor',
      slug: withHash[1],
      id: decodeHash(withHash[2]),
      href,
    }
  }
  const docOnly = href.match(/^(?:\.\/)?([^#/]+)\.md$/)
  if (docOnly) return { kind: 'doc', slug: docOnly[1], href }
  if (href.startsWith('./') || href.startsWith('../') || href.endsWith('.md')) {
    return { kind: 'relative', href }
  }
  return { kind: 'other', href }
}

function decodeHash(id) {
  try {
    return decodeURIComponent(id)
  } catch {
    return id
  }
}

function collectHeadings(doc) {
  const byLocale = { en: new Set(), vi: new Set() }
  for (const { block } of flattenBlocks(doc)) {
    if (block.type !== 'heading') continue
    for (const locale of ['en', 'vi']) {
      const id = block.id?.[locale]
      if (typeof id !== 'string' || !id.trim()) {
        fail(`${doc.slug} heading`, `blank id.${locale}`)
        continue
      }
      if (byLocale[locale].has(id)) {
        fail(`${doc.slug}`, `duplicate heading id.${locale} "${id}"`)
      }
      byLocale[locale].add(id)
    }
  }
  return byLocale
}

function checkBlockSchema(block, hint) {
  if (!block || typeof block !== 'object') {
    fail(hint, 'block is not an object')
    return
  }
  if (!ALLOWED_BLOCK_TYPES.has(block.type)) {
    fail(hint, `unknown block type "${block.type}"`)
    return
  }
  switch (block.type) {
    case 'heading':
      if (![1, 2, 3, 4, 5, 6].includes(block.level)) {
        fail(hint, `heading.level must be 1–6, got ${block.level}`)
      }
      assertLocalized(block.text, `${hint}.text`)
      assertLocalized(block.id, `${hint}.id`)
      break
    case 'paragraph':
    case 'markdown':
      assertLocalized(block.text, `${hint}.text`)
      break
    case 'list':
      if (!ALLOWED_LIST_STYLES.has(block.style)) {
        fail(hint, `list.style must be ul|ol, got "${block.style}"`)
      }
      if (!Array.isArray(block.items)) fail(hint, 'list.items must be an array')
      else block.items.forEach((item, i) => assertLocalized(item, `${hint}.items[${i}]`))
      break
    case 'callout':
      if (!ALLOWED_CALLOUT_KINDS.has(block.kind)) {
        fail(hint, `callout.kind must be note|warning|tip|quote, got "${block.kind}"`)
      }
      assertLocalized(block.text, `${hint}.text`)
      break
    case 'code':
      if (!ALLOWED_CODE_LANGS.has(block.lang)) {
        fail(hint, `code.lang "${block.lang}" is not in ts|tsx|vue|js|css|html|json|bash|text`)
      }
      if (assertLocalized(block.code, `${hint}.code`)) {
        const enLines = block.code.en.split('\n').length
        const viLines = block.code.vi.split('\n').length
        if (enLines !== viLines) {
          fail(hint, `code en/vi line count mismatch (${enLines} vs ${viLines})`)
        }
      }
      break
    case 'table': {
      if (!Array.isArray(block.headers)) fail(hint, 'table.headers must be an array')
      else block.headers.forEach((h, i) => assertLocalized(h, `${hint}.headers[${i}]`))
      if (!Array.isArray(block.rows)) fail(hint, 'table.rows must be an array')
      else {
        const width = Array.isArray(block.headers) ? block.headers.length : 0
        block.rows.forEach((row, r) => {
          if (!Array.isArray(row)) {
            fail(`${hint}.rows[${r}]`, 'row must be an array')
            return
          }
          if (row.length !== width) {
            fail(
              `${hint}.rows[${r}]`,
              `row length ${row.length} != headers length ${width}`,
            )
          }
          row.forEach((cell, c) => assertLocalized(cell, `${hint}.rows[${r}][${c}]`))
        })
      }
      if (block.align !== undefined) {
        if (!Array.isArray(block.align)) fail(hint, 'table.align must be an array')
        else {
          block.align.forEach((value, i) => {
            if (value != null && !ALLOWED_ALIGN.has(value)) {
              fail(`${hint}.align[${i}]`, `invalid align "${value}"`)
            }
          })
        }
      }
      break
    }
    case 'senior-answer':
      assertLocalized(block.label, `${hint}.label`)
      assertLocalized(block.text, `${hint}.text`)
      if (block.label && /[*`[]/.test(block.label.en + block.label.vi)) {
        fail(`${hint}.label`, 'senior-answer.label must be plain text (no markdown)')
      }
      break
    case 'key-takeaways':
      if (!Array.isArray(block.items)) fail(hint, 'key-takeaways.items must be an array')
      else block.items.forEach((item, i) => assertLocalized(item, `${hint}.items[${i}]`))
      break
    case 'thematic-break':
      break
    default:
      break
  }
}

function textLen(loc) {
  if (!loc || typeof loc !== 'object') return { en: 0, vi: 0 }
  return { en: String(loc.en || '').length, vi: String(loc.vi || '').length }
}

function addLen(acc, loc) {
  const n = textLen(loc)
  acc.en += n.en
  acc.vi += n.vi
}

function topicTextLength(topic) {
  const acc = { en: 0, vi: 0 }
  addLen(acc, topic.heading.text)
  for (const { block } of topic.body) {
    walkLocalized(block, (loc) => addLen(acc, loc))
  }
  return acc
}

function checkKbTemplate(topic) {
  const blocks = topic.body.map((entry) => entry.block)
  let from = 0
  for (const required of KB_REQUIRED) {
    const idx = blocks.findIndex((block, i) => i >= from && required.match(block))
    if (idx === -1) {
      fail(topic.hint, `migrated topic missing block ${required.id} (${required.hint})`)
      return
    }
    from = idx + 1
  }
}

function collectViStrings(value, out) {
  walkLocalized(value, (loc) => {
    out.push(loc.vi)
  })
}

function checkViHygiene(texts, hint) {
  for (const text of texts) {
    for (const label of VI_FORBIDDEN_LABELS) {
      if (text.includes(label)) {
        fail(hint, `vi text still contains English label "${label}"`)
      }
    }
  }
}

function checkRatio(len, hint, opts = {}) {
  if (!len.en) return
  const ratio = len.vi / len.en
  if (ratio < 0.8 || ratio > 1.3) {
    fail(
      hint,
      `vi/en length ratio ${ratio.toFixed(2)} outside 0.80–1.30 (en=${len.en}, vi=${len.vi})`,
    )
  }
  if (opts.min != null && opts.max != null && (len.en < opts.min || len.en > opts.max)) {
    warn(hint, `en length ${len.en} outside target ${opts.min}–${opts.max} (warn only)`)
  }
}

// --- load docs ---
const docs = []
const headingsBySlug = {}
for (const file of kbFiles()) {
  const doc = readJson(file)
  if (!doc) continue
  const rel = path.relative(root, file)
  if (!doc.slug) fail(rel, 'missing slug')
  headingsBySlug[doc.slug] = collectHeadings(doc)
  for (const { block, hint } of flattenBlocks(doc)) checkBlockSchema(block, hint)
  walkLocalized(doc, (loc, hint) => checkParity(loc, `${rel}.${hint}`))
  docs.push(doc)
}

const slugSet = new Set(docs.map((d) => d.slug))

function checkKbLinks(doc) {
  for (const { block, hint } of flattenBlocks(doc)) {
    if (block.type === 'heading' || block.type === 'code') continue
    walkLocalized(block, (loc, pathHint) => {
      for (const locale of ['en', 'vi']) {
        const re = new RegExp(LINK_RE.source, 'g')
        let m
        while ((m = re.exec(loc[locale]))) {
          const parsed = parseHref(m[1], doc.slug)
          const where = `${hint}.${pathHint}.${locale}`
          if (parsed.kind === 'external' || parsed.kind === 'other') continue
          if (parsed.kind === 'readme') {
            fail(where, `README link ${parsed.href}`)
            continue
          }
          if (parsed.kind === 'relative') {
            fail(where, `unresolved relative link ${parsed.href}`)
            continue
          }
          if (parsed.kind === 'doc') {
            if (!slugSet.has(parsed.slug)) {
              fail(where, `link to missing doc ${parsed.href}`)
            }
            continue
          }
          if (parsed.kind === 'anchor') {
            const ids = headingsBySlug[parsed.slug]
            if (!ids) {
              fail(where, `link to missing doc ${parsed.href}`)
            } else if (!ids[locale].has(parsed.id)) {
              fail(
                where,
                `broken anchor ${parsed.href} (id "${parsed.id}" not in ${parsed.slug} ${locale})`,
              )
            }
          }
        }
      }
    })
  }
}

for (const doc of docs) checkKbLinks(doc)

let kbMigrated = 0
let kbLegacy = 0
const kbTopics = []
for (const doc of docs) {
  for (const topic of leafTopics(doc)) {
    kbTopics.push(topic)
    const labels = topic.body
      .filter((entry) => entry.block.type === 'senior-answer')
      .map((entry) => entry.block.label?.en)
    const migrated = labels.includes(KB_MIGRATED_LABEL)
    const legacy = labels.includes(KB_LEGACY_LABEL)
    if (migrated && legacy) {
      fail(topic.hint, 'topic has both migrated and legacy senior-answer labels')
    }
    if (migrated) {
      kbMigrated++
      checkKbTemplate(topic)
      const viTexts = []
      collectViStrings(topic.heading, viTexts)
      for (const { block } of topic.body) collectViStrings(block, viTexts)
      checkViHygiene(viTexts, topic.hint)
      const len = topicTextLength(topic)
      const process = PROCESS_SLUGS.has(doc.slug)
      checkRatio(len, topic.hint, process ? { min: 3000, max: 5000 } : { min: 4500, max: 7500 })
    } else if (legacy) {
      kbLegacy++
    }
  }
}

if (strict && kbLegacy > 0) {
  fail('migration', `${kbLegacy} legacy KB topics remain (--strict)`)
}

// --- Q&A ---
const qnaPath = path.join(root, 'qna/questions.json')
let qMigrated = 0
let qLegacy = 0
if (!existsSync(qnaPath)) {
  fail('qna/questions.json', 'missing Q&A bank')
} else {
  const bank = readJson(qnaPath)
  const questions = Array.isArray(bank?.questions) ? bank.questions : []
  const seenIds = new Set()
  const byCategory = {}
  for (const [i, question] of questions.entries()) {
    const hint = `qna[${question?.id || i}]`
    const id = question?.id
    if (!id) fail(hint, 'missing id')
    else if (seenIds.has(id)) fail(hint, `duplicate id "${id}"`)
    else seenIds.add(id)
    const category = question?.category || 'unknown'
    byCategory[category] = (byCategory[category] || 0) + 1

    walkLocalized(question, (loc, pathHint) => {
      checkParity(loc, `${hint}.${pathHint}`)
      for (const locale of ['en', 'vi']) {
        const re = new RegExp(LINK_RE.source, 'g')
        let m
        while ((m = re.exec(loc[locale]))) {
          const href = m[1]
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
            continue
          }
          fail(`${hint}.${pathHint}.${locale}`, `relative link in Q&A: ${href}`)
        }
      }
    })

    const followUps = Array.isArray(question.followUps) ? question.followUps : []
    followUps.forEach((item, fi) => {
      if (!isLocalized(item)) return
      for (const locale of ['en', 'vi']) {
        if (/`/.test(item[locale]) || /\*\*/.test(item[locale])) {
          fail(`${hint}.followUps[${fi}].${locale}`, 'followUps must be plain text (no ` or **)')
        }
      }
    })

    const enAnswer = question.answer?.en || ''
    const migrated =
      enAnswer.includes('**How to say it') || enAnswer.includes('**What they are checking:**')
    if (migrated) {
      qMigrated++
      const labels =
        category === 'technical' ? QNA_TECHNICAL_LABELS : QNA_SOFT_LABELS
      for (const locale of ['en', 'vi']) {
        const text = question.answer?.[locale] || ''
        for (const label of labels[locale]) {
          if (!text.includes(label)) {
            fail(hint, `migrated ${category} answer missing ${locale} label ${label}`)
          }
        }
      }
      if (!question.example || !String(question.example.en || '').trim() || !String(question.example.vi || '').trim()) {
        fail(hint, 'migrated item missing example')
      }
      if (followUps.length < 2 || followUps.length > 3) {
        fail(hint, `migrated item needs 2–3 followUps (has ${followUps.length})`)
      }
      const viTexts = []
      collectViStrings(question, viTexts)
      checkViHygiene(viTexts, hint)
      const len = { en: 0, vi: 0 }
      addLen(len, question.answer)
      checkRatio(
        len,
        `${hint}.answer`,
        category === 'technical' ? { min: 1800, max: 3200 } : { min: 1000, max: 2200 },
      )
      if (question.example) {
        const ex = { en: 0, vi: 0 }
        addLen(ex, question.example)
        if (category === 'technical' && (ex.en < 300 || ex.en > 1200)) {
          warn(`${hint}.example`, `en length ${ex.en} outside target 300–1200 (warn only)`)
        }
      }
    } else {
      qLegacy++
    }
  }

  if (questions.length < QNA_EXPECTED) {
    fail('qna/questions.json', `question count dropped (${questions.length} < ${QNA_EXPECTED})`)
  }
  for (const [category, min] of Object.entries(MIN_CATEGORY_COUNTS)) {
    const count = byCategory[category] || 0
    if (count < min) {
      fail('qna/questions.json', `${category} count dropped (${count} < ${min})`)
    }
  }
  if (strict && qLegacy > 0) {
    fail('migration', `${qLegacy} legacy Q&A items remain (--strict)`)
  }
}

const sync = spawnSync(
  process.execPath,
  [path.join(scriptDir, 'sync-kb-index.mjs'), '--check', root],
  { encoding: 'utf8' },
)
if (sync.status !== 0) {
  const detail = (sync.stderr || sync.stdout || '').trim()
  fail('index.json', detail || 'sync-kb-index --check failed')
}

const leafCount = kbTopics.length
console.log(
  `KB migrated ${kbMigrated}/${KB_EXPECTED_TOPICS} (leaf topics found: ${leafCount}, legacy ${kbLegacy})`,
)
console.log(`Q&A migrated ${qMigrated}/${QNA_EXPECTED} (legacy ${qLegacy})`)
if (leafCount !== KB_EXPECTED_TOPICS) {
  warn(
    'topics',
    `leaf topic count is ${leafCount}, plan expected ${KB_EXPECTED_TOPICS} (K8 H4 fragments with their own senior-answer boxes are counted until merged)`,
  )
}

for (const message of warnings) console.log(`warn: ${message}`)

if (errors.length) {
  console.error(`Content check failed (${errors.length} issue(s)):`)
  for (const error of errors.slice(0, 80)) console.error(` - ${error}`)
  if (errors.length > 80) console.error(` - …and ${errors.length - 80} more`)
  process.exit(1)
}

console.log('Content check OK')
