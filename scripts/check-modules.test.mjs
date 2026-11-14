import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { generatedIndex, validateModules } from './modules-index.mjs'

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'modules-index-'))
  mkdirSync(path.join(root, 'modules'))
  mkdirSync(path.join(root, 'fde'))
  cpSync(path.join(source, 'modules/fictional-frontend.json'), path.join(root, 'modules/fictional-frontend.json'))
  cpSync(path.join(source, 'fde/fde-prep.json'), path.join(root, 'fde/fde-prep.json'))
  writeFileSync(path.join(root, 'modules/index.json'), JSON.stringify(generatedIndex(root)))
  return root
}

for (const [name, change, expected] of [
  ['dangling row', (root, index) => index.modules.push({ ...index.modules[1], slug: 'missing', source: 'modules/missing.json' }), 'dangling source'],
  ['orphan file', (root) => cpSync(path.join(root, 'modules/fictional-frontend.json'), path.join(root, 'modules/orphan.json')), 'orphan module file'],
  ['missing translation', (root) => {
    const file = path.join(root, 'modules/fictional-frontend.json')
    const module = JSON.parse(readFileSync(file, 'utf8'))
    delete module.entries[0].shortAnswer.vi
    writeFileSync(file, JSON.stringify(module))
  }, 'missing non-empty en or vi string'],
]) {
  test(`rejects ${name}`, () => {
    const root = fixture()
    try {
      const file = path.join(root, 'modules/index.json')
      const index = JSON.parse(readFileSync(file, 'utf8'))
      change(root, index)
      writeFileSync(file, JSON.stringify(index))
      assert.ok(validateModules(root).some((error) => error.includes(expected)))
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
}

test('accepts FDE alongside a version 2 module', () => {
  const root = fixture()
  try { assert.deepEqual(validateModules(root), []) } finally { rmSync(root, { recursive: true, force: true }) }
})
