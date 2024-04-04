import { fileEncoding } from '@shared/constants'
import { TableSchema } from '@shared/types'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'

export const getDir = (dir: string) => `${__dirname}\\${dir}`

export const saveTemplate = async (data: TableSchema[], name: string) => {
  try {
    const dir = getDir('tables')
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
