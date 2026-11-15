import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { defaultModules, generatedIndex, validateModules } from './modules-index.mjs'
import { removeModule } from './remove-module.mjs'

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

function editFixture(root, change, sync = true) {
  const file = path.join(root, 'modules/fictional-frontend.json')
  const module = JSON.parse(readFileSync(file, 'utf8'))
  change(module)
  writeFileSync(file, JSON.stringify(module))
  if (sync) writeFileSync(path.join(root, 'modules/index.json'), JSON.stringify(generatedIndex(root)))
}

const archivedAt = '2026-11-15T00:00:00.000Z'
const purgeAfter = '2026-11-22T00:00:00.000Z'
function archive(module) {
  module.status = 'archived'
  module.archivedAt = archivedAt
  module.purgeAfter = purgeAfter
}

test('accepts archived document and synchronized index', () => {
  const root = fixture()
  try {
    editFixture(root, archive)
    assert.deepEqual(validateModules(root), [])
    writeFileSync(path.join(root, 'modules/index.json'), `${JSON.stringify(generatedIndex(root), null, 2)}\n`)
    assert.equal(spawnSync(process.execPath, [path.join(source, 'scripts/check-modules.mjs'), root]).status, 0)
    assert.equal(spawnSync(process.execPath, [path.join(source, 'scripts/sync-modules-index.mjs'), root, '--check']).status, 0)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

for (const [name, change, field] of [
  ['missing archivedAt', (module) => { archive(module); delete module.archivedAt }, 'archivedAt'],
  ['missing purgeAfter', (module) => { archive(module); delete module.purgeAfter }, 'purgeAfter'],
  ['purgeAfter outside seven days', (module) => { archive(module); module.purgeAfter = '2026-11-23T00:00:00Z' }, 'purgeAfter'],
  ['malformed archivedAt', (module) => { archive(module); module.archivedAt = '2026-02-30T00:00:00Z' }, 'archivedAt'],
  ['archive dates on active module', (module) => { module.archivedAt = archivedAt }, 'archivedAt'],
  ['invalid autoArchive and lastOpenedAt', (module) => { module.autoArchive = 'true'; module.lastOpenedAt = 'yesterday' }, 'autoArchive'],
]) {
  test(`rejects ${name}`, () => {
    const root = fixture()
    try {
      editFixture(root, change)
      assert.ok(validateModules(root).some((error) => error.includes(`fictional-frontend.${field}`)))
      if (name === 'invalid autoArchive and lastOpenedAt') assert.ok(validateModules(root).some((error) => error.includes('fictional-frontend.lastOpenedAt')))
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
}

for (const [name, field, value] of [
  ['index status mismatch', 'status', 'active'],
  ['index archive-field mismatch', 'purgeAfter', '2026-11-24T00:00:00Z'],
  ['index inactivity-field mismatch', 'autoArchive', true],
]) {
  test(`rejects ${name}`, () => {
    const root = fixture()
    try {
      editFixture(root, archive)
      const file = path.join(root, 'modules/index.json')
      const index = JSON.parse(readFileSync(file, 'utf8'))
      index.modules[1][field] = value
      writeFileSync(file, JSON.stringify(index))
      assert.ok(validateModules(root).some((error) => error.includes(`fictional-frontend.${field}: index disagrees`)))
    } finally { rmSync(root, { recursive: true, force: true }) }
  })
}

test('accepts optional inactivity fields', () => {
  const root = fixture()
  try {
    editFixture(root, (module) => { module.autoArchive = false; module.lastOpenedAt = archivedAt })
    assert.deepEqual(validateModules(root), [])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('default list hides archived and keeps active FDE', () => {
  const root = fixture()
  try {
    editFixture(root, archive)
    const other = JSON.parse(readFileSync(path.join(root, 'modules/fictional-frontend.json'), 'utf8'))
    other.slug = 'other-example'
    other.status = 'active'
    delete other.archivedAt
    delete other.purgeAfter
    writeFileSync(path.join(root, 'modules/other-example.json'), JSON.stringify(other))
    assert.deepEqual(defaultModules(generatedIndex(root)).map((row) => row.slug), ['fde', 'other-example'])
    rmSync(path.join(root, 'modules/other-example.json'))
    assert.deepEqual(defaultModules(generatedIndex(root)).map((row) => row.slug), ['fde'])
    assert.deepEqual(generatedIndex(root).modules.map((row) => row.slug), ['fde', 'fictional-frontend'])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

function removalFixture() {
  const root = fixture()
  editFixture(root, archive)
  const other = JSON.parse(readFileSync(path.join(root, 'modules/fictional-frontend.json'), 'utf8'))
  other.slug = 'other-example'
  writeFileSync(path.join(root, 'modules/other-example.json'), JSON.stringify(other))
  mkdirSync(path.join(root, 'knowledge-base'))
  writeFileSync(path.join(root, 'knowledge-base/sample.json'), '{"fixture":"fictional"}\n')
  writeFileSync(path.join(root, 'modules/index.json'), `${JSON.stringify(generatedIndex(root), null, 2)}\n`)
  return root
}

test('removal changes only archived file and index row', () => {
  const root = removalFixture()
  try {
    const other = readFileSync(path.join(root, 'modules/other-example.json'))
    const kb = readFileSync(path.join(root, 'knowledge-base/sample.json'))
    const fde = readFileSync(path.join(root, 'fde/fde-prep.json'))
    assert.equal(removeModule(root, 'fictional-frontend').code, 0)
    assert.equal(existsSync(path.join(root, 'modules/fictional-frontend.json')), false)
    assert.deepEqual(JSON.parse(readFileSync(path.join(root, 'modules/index.json'))).modules.map((row) => row.slug), ['fde', 'other-example'])
    assert.deepEqual(readFileSync(path.join(root, 'modules/other-example.json')), other)
    assert.deepEqual(readFileSync(path.join(root, 'knowledge-base/sample.json')), kb)
    assert.deepEqual(readFileSync(path.join(root, 'fde/fde-prep.json')), fde)
    assert.deepEqual(validateModules(root), [])
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('removal refuses active, FDE and unsafe slug', () => {
  const root = fixture()
  try {
    assert.equal(removeModule(root, 'fictional-frontend').code, 2)
    assert.equal(removeModule(root, 'fde').code, 2)
    assert.equal(removeModule(root, '../knowledge-base/sample').code, 2)
    assert.equal(removeModule(root, '/tmp/escape').code, 2)
    assert.equal(existsSync(path.join(root, 'modules/fictional-frontend.json')), true)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('dry run changes no bytes', () => {
  const root = removalFixture()
  try {
    const index = readFileSync(path.join(root, 'modules/index.json'))
    const file = readFileSync(path.join(root, 'modules/fictional-frontend.json'))
    assert.equal(removeModule(root, 'fictional-frontend', true).code, 0)
    assert.deepEqual(readFileSync(path.join(root, 'modules/index.json')), index)
    assert.deepEqual(readFileSync(path.join(root, 'modules/fictional-frontend.json')), file)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('second removal is a no-op', () => {
  const root = removalFixture()
  try {
    assert.equal(removeModule(root, 'fictional-frontend').code, 0)
    const index = readFileSync(path.join(root, 'modules/index.json'))
    assert.equal(removeModule(root, 'fictional-frontend').code, 0)
    assert.deepEqual(readFileSync(path.join(root, 'modules/index.json')), index)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
