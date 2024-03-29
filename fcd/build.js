const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const moment = require('moment')
const CSON = require('cson')
const { isEqual, last, padStart, size } = require('lodash')
const assert = require('assert')

const DEST = path.resolve(__dirname, '../assets/data/fcd')

// current: currentData in forms of {meta, data}
// next: data part
// if current.data different with next, bump meta's version
const getMeta = (current, next) => {
  if (isEqual(current.data, next)) {
    return current.meta
  }

  const { version } = current.meta
  const today = moment().format('YYYY/MM/DD')

  if (version.slice(0, 10) === today) {
    const v = parseInt(last(version.split('/')), 10) + 1
    return {
      ...current.meta,
      version: `${today}/${padStart(v, 2, '0')}`,
    }
  }

  return {
    ...current.meta,
    version: `${today}/01`,
  }
}

async function writeJSON(fname, data) {
  const JSON_OPTIONS = { spaces: '' }
  await fs.outputJSON(path.resolve(DEST, fname), data, JSON_OPTIONS)
}

async function readCSON(name) {
  const data = await fs.readFile(name)
  return CSON.parse(data)
}

async function buildData(name) {
  const dest = path.resolve(DEST, name.replace('.cson', '.json'))
  const current = await fs.readJSON(dest)
  const data = name.endsWith('cson') ? await readCSON(name) : await fs.readJSON(name)
  const meta = getMeta(current, data)
  await writeJSON(name.replace('.cson', '.json'), { meta, data })
}

async function buildMeta(flist) {
  const meta = await Promise.map(flist, async (fname) => {
    const fpath = path.resolve(DEST, fname)
    const data = JSON.parse(await fs.readFile(fpath))
    return data.meta
  })
  await writeJSON('meta.json', meta)
}

const validateShipTag = async () => {
  const file = await fs.readFile('shiptag.cson', 'utf-8')
  const data = CSON.parse(file)

  const count = size(data.mapname)

  assert(count > 0)
  assert(size(data.color) === count)
  assert(size(data.fleetname['zh-CN']) === count)
  assert(size(data.fleetname['zh-TW']) === count)
  assert(size(data.fleetname['ja-JP']) === count)
  assert(size(data.fleetname['en-US']) === count)
}

;(async () => {
  await validateShipTag()

  await Promise.all([
    buildData('map.json'),
    buildData('shipavatar.json'),
    buildData('shiptag.cson'),
  ])

  await buildMeta(['map.json', 'shipavatar.json', 'shiptag.json'].sort())
})()
