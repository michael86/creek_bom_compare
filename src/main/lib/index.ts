import { PATH, fileEncoding, templateDir } from '@shared/constants'
import {
  DeleteTemplate,
  FetchTemplate,
  FetchTemplateNames,
  TableSchema,
  TestTemplate,
  XLSXCell
} from '@shared/types'
import { BrowserWindow } from 'electron'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'
import { WorkSheet, readFile } from 'xlsx'

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

export const _findCell = (name: string, sheetData: WorkSheet) => {
  const lowercaseName = name.toLowerCase()

  for (const [cell, cellValue] of Object.entries(sheetData)) {
    if (!cellValue?.v) continue
    const value = String(cellValue.v).toLowerCase()

    if (value === lowercaseName) {
      console.log(`Found table ${cellValue.v} at ${cell}`)
      return { value, cell }
    }
  }

  return
}

export const testTemplate: TestTemplate = async (template, file, autoFind) => {
  try {
    console.log('file ', file)
    const [templateSchema, fileData] = await Promise.all([fetchTemplate(template), readFile(file)])
    if (!templateSchema || !fileData) throw new Error(`Failed to fetchTemplate or filedata`)

    const newTable: { [key: string]: string } = {}

    for (const [sheet, sheetData] of Object.entries(fileData.Sheets)) {
      console.log('Processing sheet:', sheet)

      for (const { col, row, name } of templateSchema) {
        const lowercaseName = name.toLowerCase()
        const coords = `${col.toUpperCase()}${row}`
        const cell: XLSXCell = sheetData[coords]
        const value = String(cell?.v).toLowerCase()

        if (!value || value !== lowercaseName) {
          if (autoFind) {
            const newCoords = _findCell(lowercaseName, sheetData)

            if (!newCoords) return false
            newTable[newCoords.cell] = newCoords.value
            continue
          }

          return false
        }
      }
    }

    if (Object.keys(newTable).length) {
      const newData: TableSchema[] = []

      for (const [key, entry] of Object.entries(newTable)) {
        newData.push({ name: entry, col: key[0], row: key.substring(1, key.length) })
      }
      const mainWindow = BrowserWindow.getFocusedWindow()
      mainWindow?.webContents.send('testTemplateResult', newData)
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
