import { fileEncoding, templateDir } from '@shared/constants'
import { DeleteTemplate, FetchTemplate, TableSchema } from '@shared/types'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'

export const getDir = (dir: string) => `${__dirname}\\${dir}`

export const saveTemplate = async (data: TableSchema[], name: string) => {
  try {
    const dir = getDir(templateDir)
    await ensureDir(dir)

    console.log('name ', name)

    const file = path.join(dir, `${name}.json`)

    const options = {
      encoding: fileEncoding,
      flag: 'w'
    }

    fs.outputFile(file, JSON.stringify(data), options)
      .then(() => {
        console.log('Saved file')
      })
      .catch((error) => {
        throw new Error(error)
      })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export const fetchTemplate: FetchTemplate = async (name) => {
  try {
    const target = name ? path.join(templateDir, `${name}.json`) : templateDir
    const dir = getDir(target)
    await ensureDir(dir) //incase it doesn't exists
    const files = await fs.readdir(dir)
    return files.map((file) => file.replace('.json', ''))
  } catch (error) {
    console.error(error)
    return []
  }
}

export const deleteTemplate: DeleteTemplate = async (name) => {
  try {
    const target = path.join(templateDir, `${name}.json`)
    const file = getDir(target)
    fs.remove(file)
      .then(() => {
        console.log('deleted file ', name)
      })
      .catch((error) => {
        console.error(error)
        return false
      })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
