import { PATH, fileEncoding, templateDir } from '@shared/constants'
import {
  CompareBoms,
  DeleteTemplate,
  FetchTemplate,
  FetchTemplateNames,
  NewCell,
  NewSheet,
  StyledCell,
  TableSchema,
  TestTemplate
} from '@shared/types'
import { app, dialog } from 'electron'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'
import XLSX, { WorkSheet, readFile } from 'xlsx-js-style'
import { fetchSheets, fetchXlsxAsAoa, findTableIndex } from '../utils'

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

export const testTemplate: TestTemplate = async (template, file) => {
  try {
    console.log('testing ', file)
    const [templateSchema, fileData] = await Promise.all([fetchTemplate(template), readFile(file)])
    if (!templateSchema || !fileData) throw new Error(`Failed to fetchTemplate or filedata`)

    for (const [sheet, sheetData] of Object.entries(fileData.Sheets)) {
      console.log('Processing sheet:', sheet)

      for (const { name } of templateSchema) {
        const lowercaseName = name.toLowerCase()

        const newCoords = _findCell(lowercaseName, sheetData)

        if (!newCoords) return false
      }
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export const findTableRow = (data: WorkSheet, template: TableSchema[]) => {
  const cells: { row: string; col: string; value: string }[] = []
  for (const { name } of template) {
    const { cell, value } = _findCell(name, data) || {}
    if (!cell || !value) return false

    cells.push({ row: cell.substring(1, cell.length), col: cell.charAt(0), value })
  }

  return cells.every((val, _, arr) => val.row === arr[0].row) ? cells : false
}

export const compareBoms: CompareBoms = async (fileOne, fileTwo, template) => {
  const [templateSchema, fileOneWb, fileTwoWb] = await Promise.all([
    fetchTemplate(template),
    readFile(fileOne),
    readFile(fileTwo)
  ])

  if (!templateSchema || !fileOneWb || !fileTwoWb) return false

  const [fileOneSheets, fileTwoSheets] = fetchSheets(fileOneWb, fileTwoWb)

  const filenameOne = fileOne.substring(fileOne.lastIndexOf('\\') + 1, fileOne.indexOf('.xls'))
  const filenameTwo = fileTwo.substring(fileTwo.lastIndexOf('\\') + 1, fileTwo.indexOf('.xls'))

  const fileOneNewSheets: NewSheet = {} //Collection of new sheets with formatted data
  const fileTwoNewSheets: NewSheet = {}
  const sheetOneNew: NewCell = [] // new sheet with formatted data, to be inserted into newSheets{respective}
  const sheetTwoNew: NewCell = []

  console.log(`comparing ${filenameOne} + ${filenameTwo}`)
  try {
    for (let i = 0; i < Math.max(fileOneSheets.length, fileTwoSheets.length); i++) {
      //iterate over highest sheets count
      const sheetNameOne = fileOneSheets[i] //Sheet names @type string
      const sheetNameTwo = fileTwoSheets[i]

      //Get each workbooks current sheet
      console.log('attempting to fetch sheets')
      const [sheetFileOne, sheetFileTwo] = fetchXlsxAsAoa(
        [fileOneWb, fileTwoWb],
        [sheetNameOne, sheetNameTwo]
      )
      if (!sheetFileOne || !sheetFileTwo) return false
      console.log('sheets fetched')

      //Get tables from current sheet
      console.log('attempting to fetch tables')
      const sheetOneTable = findTableIndex(sheetFileOne, templateSchema, true)
      const sheetTwoTable = findTableIndex(sheetFileTwo, templateSchema, true)
      if (typeof sheetOneTable === 'number' || typeof sheetTwoTable === 'number') return false //bugs out on delkim because of empty sheets
      console.log('tables fetched')

      //Get the max length of each table, due to incosistent table rows
      const maxTableLength = Math.max(sheetOneTable.length, sheetTwoTable.length)
      console.log('comparing tables')
      for (let index = 0; index < maxTableLength; index++) {
        const tableOneCurrentRow = sheetOneTable[index]?.toString().toLowerCase() //will either be string or undefined
        const tableTwoCurrentRow = sheetTwoTable[index]?.toString().toLowerCase()

        //cells between tables don't match
        if (tableOneCurrentRow !== tableTwoCurrentRow) {
          const cellLength = Math.max(sheetOneTable[index]?.length, sheetTwoTable[index]?.length)

          const newRowOne: StyledCell[] = []
          const newRowTwo: StyledCell[] = []

          //Iterate over the cell and make each cell green to hightlight
          for (let cell = 0; cell < cellLength; cell++) {
            newRowOne.push({
              v: sheetOneTable[index][cell],
              t: 's',
              s: { fill: { fgColor: { rgb: '32cd32' } } }
            })
            newRowTwo.push({
              v: sheetTwoTable[index][cell],
              t: 's',
              s: { fill: { fgColor: { rgb: '32cd32' } } }
            })
          }

          //Push new style to table sheet
          sheetOneNew.push(newRowOne)
          sheetTwoNew.push(newRowTwo)
        } else {
          //is match so just add
          sheetOneNew.push(sheetOneTable[index])
          sheetTwoNew.push(sheetTwoTable[index])
        }
      }
      console.log('table compared')
      fileOneNewSheets[`${sheetNameOne}-fileOne`] = sheetOneNew
      fileTwoNewSheets[`${sheetNameTwo}-fileTwo`] = sheetTwoNew
    }

    console.log('all tables compared')
    return writeToXLSXFile({ ...fileOneNewSheets, ...fileTwoNewSheets })
  } catch (error) {
    console.error(error)
    return false
  }
}

export const writeToXLSXFile = async (sheets: NewSheet) => {
  const workbook = XLSX.utils.book_new()

  for (let [key, value] of Object.entries(sheets)) {
    if (key.length > 31) key = key.substring(0, 31) //sheet names can't exceed 31 chars so trim

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(value), key)
  }

  const { filePath } = await dialog.showSaveDialog({
    title: 'Save File',
    defaultPath: app.getPath('documents'),
    filters: [{ name: 'Text Files', extensions: ['xlsx'] }]
  })

  if (!filePath) return false
  XLSX.writeFile(workbook, filePath)
  console.log('file saved')
  return true
}
