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
if (errors.length) {
  console.error(`FDE validation failed (${errors.length}):\n${errors.join('\n')}`)
  process.exit(1)
}
const counts = Object.fromEntries(sections.map((section) => [section, data.entries.filter((entry) => entry.section === section).length]))
console.log(`FDE content OK: ${JSON.stringify(counts)}`)
