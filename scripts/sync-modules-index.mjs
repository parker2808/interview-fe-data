#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { generatedIndex } from './modules-index.mjs'

const args = process.argv.slice(2)
const root = path.resolve(args.find((arg) => arg !== '--check') || '.')
const file = path.join(root, 'modules/index.json')
const next = `${JSON.stringify(generatedIndex(root), null, 2)}\n`
if (args.includes('--check')) {
  if (!existsSync(file) || readFileSync(file, 'utf8') !== next) {
    console.error('modules/index.json is out of date. Run `node scripts/sync-modules-index.mjs`.')
    process.exitCode = 1
  } else console.log('modules/index.json is in sync')
} else {
  writeFileSync(file, next)
  console.log('wrote modules/index.json')
}
