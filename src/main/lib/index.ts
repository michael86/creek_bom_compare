import { PATH, fileEncoding, templateDir } from '@shared/constants'
import {
  DeleteTemplate,
  FetchTemplate,
  FetchTemplateNames,
  TableSchema,
  TestTemplate
} from '@shared/types'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'
import { readFile } from 'xlsx'

export const getDir = (dir: string) => `${PATH}\\${dir}`

export const saveTemplate = async (data: TableSchema[], name: string) => {
  try {
    const dir = getDir(templateDir)
    await ensureDir(dir)

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

export const fetchTemplateNames: FetchTemplateNames = async () => {
  try {
    const dir = getDir(templateDir)
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

export const fetchTemplate: FetchTemplate = async (name) => {
  try {
    const target = path.join(templateDir, `${name}.json`)
    const dir = getDir(target)
    const data = await fs.readFile(dir, fileEncoding)
    return JSON.parse(data)
  } catch (error) {
    console.error(error)

    return
  }
}

export const testTemplate: TestTemplate = async (template, file) => {
  try {
    const templateSchema = await fetchTemplate(template)
    if (!templateSchema) throw new Error(`Failed to fetchTemplate`)

    const fileData = readFile(file)
    const sheets = Object.keys(fileData.Sheets)

    for (const sheet of sheets) {
      console.log('Processing sheet: ', sheet)
      const sheetData = fileData.Sheets[sheet]

      for (const entry of templateSchema) {
        const { col, row, name } = entry
        const cell = `${col.toUpperCase()}${row}`
        const value = sheetData[cell]
        if (!value.includes(name)) {
          return false
        }
        console.log(`comparing ${cell}`)
        console.log('sheetData[cell] ', sheetData[cell].includes(name.toLowerCase()))
      }
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
