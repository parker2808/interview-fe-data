import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const localized = (value, hint, errors) => {
  if (!value || typeof value !== 'object' || !['en', 'vi'].every((lang) => typeof value[lang] === 'string' && value[lang].trim())) {
    errors.push(`${hint}: missing non-empty en or vi string`)
  }
}

export function moduleFiles(root) {
  const dir = path.join(root, 'modules')
  return existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.json') && name !== 'index.json').sort() : []
}

export function readModule(root, file) {
  return JSON.parse(readFileSync(path.join(root, 'modules', file), 'utf8'))
}

export function rowFor(module) {
  const { slug, fixture, organizationAlias, role, level, date, tags, status, archivedAt, purgeAfter, autoArchive, lastOpenedAt, title, summary, testScore } = module
  return Object.fromEntries(Object.entries({ slug, source: `modules/${slug}.json`, fixture, organizationAlias, role, level, date, tags, status, archivedAt, purgeAfter, autoArchive, lastOpenedAt, title, summary, testScore }).filter(([, value]) => value !== undefined))
}

export function defaultModules(index) {
  return index.modules.filter((row) => row.status !== 'archived')
}

function validTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return false
  const offset = value.endsWith('Z') ? 0 : (value.at(-6) === '-' ? -1 : 1) * (Number(value.slice(-5, -3)) * 60 + Number(value.slice(-2)))
  if (Math.abs(offset) > 14 * 60 || Number(value.slice(-2)) > 59) return false
  return new Date(timestamp + offset * 60000).toISOString().slice(0, 19) === value.slice(0, 19)
}

function validateArchive(record, slug, errors) {
  if (!['active', 'archived'].includes(record.status)) errors.push(`${slug}.status: expected active or archived`)
  for (const field of ['archivedAt', 'purgeAfter']) {
    if (record.status === 'archived' && !validTimestamp(record[field])) errors.push(`${slug}.${field}: required ISO-8601 timestamp`)
    if (record.status === 'active' && Object.hasOwn(record, field)) errors.push(`${slug}.${field}: not allowed on active module`)
  }
  if (validTimestamp(record.archivedAt) && validTimestamp(record.purgeAfter) && Date.parse(record.purgeAfter) - Date.parse(record.archivedAt) !== 7 * 86400000) errors.push(`${slug}.purgeAfter: must be exactly seven days after archivedAt`)
  if (record.autoArchive !== undefined && typeof record.autoArchive !== 'boolean') errors.push(`${slug}.autoArchive: expected boolean`)
  if (record.lastOpenedAt !== undefined && !validTimestamp(record.lastOpenedAt)) errors.push(`${slug}.lastOpenedAt: expected ISO-8601 timestamp`)
}

export function generatedIndex(root) {
  return {
    version: 2,
    modules: [
      {
        slug: 'fde', source: 'fde/fde-prep.json', organizationAlias: 'FDE',
        role: { en: 'FDE interview preparation', vi: 'Ôn tập phỏng vấn FDE' },
        level: { en: 'Study pack', vi: 'Bộ ôn tập' }, date: '2026-11-15',
        tags: ['fde'], status: 'active',
        title: { en: 'FDE study pack', vi: 'Bộ ôn tập FDE' },
        summary: { en: 'Bilingual interview study collection.', vi: 'Bộ tài liệu ôn phỏng vấn bằng tiếng Anh và tiếng Việt.' },
      },
      ...moduleFiles(root).map((file) => rowFor(readModule(root, file))),
    ],
  }
}

export function validateModules(root) {
  const errors = []
  const indexPath = path.join(root, 'modules/index.json')
  if (!existsSync(indexPath)) return ['modules/index.json: missing index']
  let index
  try { index = JSON.parse(readFileSync(indexPath, 'utf8')) } catch { return ['modules/index.json: invalid JSON'] }
  if (index.version !== 2 || !Array.isArray(index.modules)) return ['modules/index.json: expected version 2 and modules array']
  const files = moduleFiles(root)
  const seen = new Set()
  for (const row of index.modules) {
    if (!row || typeof row.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug) || seen.has(row.slug)) {
      errors.push('modules/index.json: invalid or duplicate slug')
      continue
    }
    seen.add(row.slug)
    const expected = row.slug === 'fde' ? 'fde/fde-prep.json' : `modules/${row.slug}.json`
    if (row.source !== expected || !existsSync(path.join(root, expected))) errors.push(`${row.slug}: dangling source`)
    for (const field of ['role', 'level', 'title', 'summary']) localized(row[field], `${row.slug}.${field}`, errors)
    validateArchive(row, row.slug, errors)
    if (row.slug === 'fde' && JSON.stringify(row) !== JSON.stringify(generatedIndex(root).modules[0])) errors.push('fde: index row must remain unchanged')
  }
  if (!seen.has('fde')) errors.push('fde: missing index row')
  for (const file of files) {
    const slug = file.slice(0, -5)
    if (!seen.has(slug)) errors.push(`${file}: orphan module file`)
    let module
    try { module = readModule(root, file) } catch { errors.push(`${file}: invalid JSON`); continue }
    if (module.version !== 2 || module.slug !== slug) errors.push(`${file}: invalid version or slug`)
    validateArchive(module, slug, errors)
    for (const field of ['role', 'level', 'title', 'summary']) localized(module[field], `${file}.${field}`, errors)
    if (!module.organizationAlias || !Array.isArray(module.tags) || !validDate(module.date)) errors.push(`${file}: invalid metadata`)
    const requirements = new Set()
    for (const requirement of module.requirements || []) {
      if (!requirement.id || requirements.has(requirement.id)) errors.push(`${file}: duplicate or invalid requirement ID`)
      requirements.add(requirement.id)
      localized(requirement.title, `${file}.${requirement.id}.title`, errors)
    }
    const ids = new Set()
    for (const entry of module.entries || []) {
      if (!entry.id || ids.has(entry.id)) errors.push(`${file}: duplicate or invalid entry ID`)
      ids.add(entry.id)
      if (!['jd', 'concepts', 'interview', 'pitch', 'rescue', 'ask', 'cheat'].includes(entry.section) || !requirements.has(entry.jdRequirement)) errors.push(`${file}.${entry.id}: invalid section or requirement`)
      if (!Array.isArray(entry.tags) || !Array.isArray(entry.keyPoints) || !entry.keyPoints.length) errors.push(`${file}.${entry.id}: tags and key points required`)
      for (const field of ['title', 'shortAnswer', 'detail']) localized(entry[field], `${file}.${entry.id}.${field}`, errors)
      for (const point of entry.keyPoints || []) localized(point, `${file}.${entry.id}.keyPoints`, errors)
      for (const ref of entry.kbRefs || []) if (!ref.slug || !ref.sectionId || !['pending', 'live', 'rejected'].includes(ref.state)) errors.push(`${file}.${entry.id}: malformed KB reference`)
      if (entry.embellishmentRefs !== undefined && (!Array.isArray(entry.embellishmentRefs) || entry.embellishmentRefs.some((ref) => typeof ref !== 'string' || !ref.trim()))) errors.push(`${file}.${entry.id}: malformed embellishment reference`)
    }
    if (!Array.isArray(module.requirements) || !Array.isArray(module.entries)) errors.push(`${file}: missing requirements or entries`)
    const actualRow = index.modules.find((row) => row.slug === slug)
    if (JSON.stringify(actualRow) !== JSON.stringify(rowFor(module))) {
      for (const field of ['status', 'archivedAt', 'purgeAfter', 'autoArchive', 'lastOpenedAt']) {
        if (JSON.stringify(actualRow?.[field]) !== JSON.stringify(module[field])) errors.push(`${slug}.${field}: index disagrees with module file`)
      }
      errors.push(`${file}: index row is stale`)
    }
  }
  if (!existsSync(path.join(root, 'fde/fde-prep.json'))) errors.push('fde: missing version 1 source')
  return errors
}

function validDate(value) { return typeof value === 'string' && !Number.isNaN(Date.parse(value)) }
