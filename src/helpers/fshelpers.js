const fsPro = require('fs').promises,
  path = require('path')

const baseDir = path.join(process.cwd(), '/data')
const ext = 'json'

module.exports = class FsHelpers {
  static write = async (filename, data) => {
    const filepath = path.normalize(`${baseDir}/${filename}.${ext}`)
    const stringifiedData = JSON.stringify(data)

    await fsPro.writeFile(filepath, stringifiedData)
  }

  static read = async (filename) => {
    const filepath = path.normalize(`${baseDir}/${filename}.${ext}`)
    const fileData = await fsPro.readFile(filepath)
    return JSON.parse(fileData)
  }

  static update = async (filename, data) => {
    const filepath = path.normalize(`${baseDir}/${filename}.${ext}`)
    await fsPro.truncate(filepath)
    this.write(filename, data)
  }
}
