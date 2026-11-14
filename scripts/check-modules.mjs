#!/usr/bin/env node
import path from 'node:path'
import { validateModules } from './modules-index.mjs'

const errors = validateModules(path.resolve(process.argv[2] || '.'))
if (errors.length) {
  console.error(`Modules invalid (${errors.length}):\n${errors.join('\n')}`)
  process.exitCode = 1
} else console.log('Modules index and documents OK')
