#!/usr/bin/env node
import { existsSync, lstatSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateModules } from './modules-index.mjs'

export function removeModule(root, slug, dryRun = false) {
  if (slug === 'fde' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) return { code: 2, message: `${slug}: invalid or protected slug` }
  const file = path.join(root, 'modules', `${slug}.json`)
  const indexFile = path.join(root, 'modules/index.json')
  try {
    if (lstatSync(path.join(root, 'modules')).isSymbolicLink() || lstatSync(indexFile).isSymbolicLink() || (existsSync(file) && lstatSync(file).isSymbolicLink())) return { code: 2, message: `${slug}: symlink path refused` }
    const index = JSON.parse(readFileSync(indexFile, 'utf8'))
    const rows = index.modules.filter((row) => row.slug === slug)
    if (!existsSync(file) && rows.length === 0) return { code: 0, message: `${slug}: already absent` }
    if (!existsSync(file) || rows.length !== 1) return { code: 2, message: `${slug}: file and index row must both exist` }
    const errors = validateModules(root)
    if (errors.length) return { code: 2, message: `${slug}: invalid modules: ${errors.join('; ')}` }
    if (JSON.parse(readFileSync(file, 'utf8')).status !== 'archived') return { code: 2, message: `${slug}: module is not archived` }
    if (dryRun) return { code: 0, message: `${slug}: dry run; would remove file and index row` }
    const next = { ...index, modules: index.modules.filter((row) => row.slug !== slug) }
    writeFileSync(indexFile, `${JSON.stringify(next, null, 2)}\n`)
    unlinkSync(file)
    return { code: 0, message: `${slug}: removed file and index row` }
  } catch (error) {
    return { code: 1, message: `${slug}: I/O failure: ${error.message}` }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const result = args.length >= 1 && args.length <= 2 && (args.length === 1 || args[1] === '--dry-run')
    ? removeModule(process.cwd(), args[0], args[1] === '--dry-run')
    : { code: 2, message: 'Usage: node scripts/remove-module.mjs <slug> [--dry-run]' }
  console[result.code ? 'error' : 'log'](result.message)
  process.exitCode = result.code
}
