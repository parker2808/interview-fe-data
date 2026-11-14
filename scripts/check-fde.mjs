#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const file = resolve(process.argv[2] || '.', 'fde/fde-prep.json')
const errors = []
let data
try {
  data = JSON.parse(readFileSync(file, 'utf8'))
} catch (error) {
  console.error(`FDE content unavailable: ${error.message}`)
  process.exit(1)
}

const sections = ['jd', 'concepts', 'interview', 'pitch', 'rescue', 'ask', 'cheat']
const requirements = new Set(data.requirements?.map((item) => item.id))
const ids = new Set()
const localized = (value, path) => {
  if (!value || typeof value.en !== 'string' || !value.en.trim() || typeof value.vi !== 'string' || !value.vi.trim()) {
    errors.push(`${path}: both languages are required`)
  }
  for (const lang of ['en', 'vi']) {
    if (/[\u2013\u2014]/.test(value?.[lang] || '')) errors.push(`${path}.${lang}: no en/em dashes`)
  }
}
const conceptHeadings = {
  en: ['What it is', 'Why it exists', 'How it works', 'Tradeoffs', 'Common pitfalls', 'How Parker relates it', 'Speakable answer'],
  vi: ['Khái niệm', 'Vì sao cần', 'Cách hoạt động', 'Đánh đổi', 'Lỗi thường gặp', 'Parker liên hệ với dự án', 'Câu trả lời có thể nói'],
}
const interviewHeadings = {
  en: ['Why they ask', 'Full answer', 'Likely follow-ups'],
  vi: ['Vì sao họ hỏi', 'Trả lời đầy đủ', 'Câu hỏi tiếp theo có thể gặp'],
}
const sectionsOf = (detail) => {
  const parts = [...detail.matchAll(/^## (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)]
  return parts.map(([, heading, body]) => ({ heading, body: body.trim() }))
}
const checkHeadings = (entry, lang, required) => {
  const sections = sectionsOf(entry.detail[lang])
  if (sections.length !== required.length || sections.some((part, index) => part.heading !== required[index] || !part.body)) {
    errors.push(`${entry.id}.detail.${lang}: required labelled parts missing or out of order`)
  }
  const bodies = sections.map((part) => part.body.replace(/\s+/g, ' ').trim().toLowerCase())
  if (new Set(bodies).size !== bodies.length) {
    errors.push(`${entry.id}.detail.${lang}: duplicated subsections`)
  }
}

if (data.version !== 1 || !Array.isArray(data.entries)) errors.push('invalid version or entries')
for (const requirement of data.requirements || []) localized(requirement.title, `requirement ${requirement.id}`)
for (const entry of data.entries || []) {
  if (!/^[a-zA-Z0-9-]+$/.test(entry.id || '') || ids.has(entry.id)) errors.push(`invalid or duplicate ID: ${entry.id}`)
  ids.add(entry.id)
  if (!sections.includes(entry.section)) errors.push(`${entry.id}: unknown section`)
  if (!requirements.has(entry.jdRequirement)) errors.push(`${entry.id}: unknown JD requirement`)
  if (!Array.isArray(entry.tags) || !entry.tags.length || entry.tags.some((tag) => typeof tag !== 'string')) errors.push(`${entry.id}: tags required`)
  for (const key of ['title', 'shortAnswer', 'detail']) localized(entry[key], `${entry.id}.${key}`)
  if (!Array.isArray(entry.keyPoints) || !entry.keyPoints.length) errors.push(`${entry.id}: key points required`)
  else entry.keyPoints.forEach((point, index) => localized(point, `${entry.id}.keyPoints[${index}]`))
  if (['jd', 'concepts', 'interview'].includes(entry.section) && (entry.detail?.en?.length < 160 || entry.detail?.vi?.length < 160)) errors.push(`${entry.id}: explanation too short`)
  for (const lang of ['en', 'vi']) {
    const answer = entry.shortAnswer?.[lang]
    if (typeof answer === 'string' && (answer.length > 320 || /:\s*$/.test(answer))) {
      errors.push(`${entry.id}.shortAnswer.${lang}: must be speakable, at most 320 characters, and not end with a colon`)
    }
    if (typeof answer === 'string' && entry.keyPoints?.[0]?.[lang]?.trim() === answer.trim()) {
      errors.push(`${entry.id}.keyPoints[0].${lang}: duplicates the short answer`)
    }
    if (entry.section === 'concepts' || entry.section === 'interview') {
      if (!Array.isArray(entry.keyPoints) || entry.keyPoints.length < 3 || entry.keyPoints.length > 6 || entry.keyPoints.some((point) => typeof point?.[lang] !== 'string' || point[lang].length > 320 || /[\n{}]/.test(point[lang]))) {
        errors.push(`${entry.id}.keyPoints.${lang}: expected 3 to 6 short, code-free bullets`)
      }
    }
    if (entry.section === 'concepts' && typeof entry.detail?.[lang] === 'string') {
      if (entry.detail[lang].length < 1800) errors.push(`${entry.id}.detail.${lang}: concept explanation under 1800 characters`)
      checkHeadings(entry, lang, conceptHeadings[lang])
    }
    if (entry.section === 'interview' && typeof entry.detail?.[lang] === 'string') {
      checkHeadings(entry, lang, interviewHeadings[lang])
    }
  }
  if (entry.section === 'concepts' && typeof entry.detail?.en === 'string' && typeof entry.detail?.vi === 'string') {
    const english = sectionsOf(entry.detail.en)
    const vietnamese = sectionsOf(entry.detail.vi)
    if (english.some((part, index) => part.body === vietnamese[index]?.body)) {
      errors.push(`${entry.id}.detail: EN/VI subsections must be localized independently`)
    }
  }
}
for (const [prefix, count] of [['I', 33], ['J', 12], ['B', 14], ['R', 12], ['A', 15]]) {
  for (let index = 1; index <= count; index++) if (!ids.has(`${prefix}${index}`)) errors.push(`missing ${prefix}${index}`)
}
for (const id of ['I26', 'I28', 'I29']) {
  const entry = data.entries?.find((item) => item.id === id)
  for (const lang of ['en', 'vi']) if (!entry?.detail?.[lang]?.includes('(điền chi tiết thật)')) errors.push(`${id}.${lang}: real-story TODO required`)
}
for (const requirement of requirements) {
  if (!ids.has(`jd-${requirement}`) || !data.entries.some((item) => item.section === 'concepts' && item.jdRequirement === requirement)) {
    if (requirement !== 'client') errors.push(`${requirement}: missing JD or concept coverage`)
  }
}
for (const id of ['concept-monday-graphql-api', 'concept-gmail-push-history', 'concept-evolve-discovery', 'concept-invention-intake', 'concept-grant-lifecycle', 'concept-gcp-cloud-run', 'concept-gcp-cloud-scheduler', 'concept-gcp-pubsub', 'concept-gcp-secret-manager', 'concept-gcp-cloud-sql', 'concept-gcp-cloud-logging']) {
  if (!ids.has(id)) errors.push(`missing required concept: ${id}`)
}
if (errors.length) {
  console.error(`FDE validation failed (${errors.length}):\n${errors.join('\n')}`)
  process.exit(1)
}
const counts = Object.fromEntries(sections.map((section) => [section, data.entries.filter((entry) => entry.section === section).length]))
console.log(`FDE content OK: ${JSON.stringify(counts)}`)
