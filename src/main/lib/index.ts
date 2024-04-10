import { PATH, fileEncoding, templateDir } from '@shared/constants'
import {
  CompareBoms,
  DeleteTemplate,
  ExtractTableData,
  FetchTemplate,
  FetchTemplateNames,
  NewTableSchema,
  StyledCell,
  TableSchema,
  TestTemplate
} from '@shared/types'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'
import XLSX, { WorkSheet, readFile } from 'xlsx-js-style'
import { fetchXlsxAsAoa, findTableIndex } from '../utils'

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

export const extractTableData: ExtractTableData = (fileTable, fileData) => {
  const newTable: NewTableSchema = []

  for (const { row, col, value: header } of fileTable) {
    for (let key in fileData) {
      if (
        key.toString()[0].toLowerCase() === col.toLowerCase() &&
        +key.toString().substring(1, key.length) >= +row
      ) {
        newTable.push({
          col: key.toString()[0],
          row: key.toString().substring(1, key.length),
          header,
          value: fileData[key].v
        })
      }
    }
  }

  return newTable
}

export const compareBoms: CompareBoms = async (fileOne, fileTwo, template) => {
  const [templateSchema, fileOneData, fileTwoData] = await Promise.all([
    fetchTemplate(template),
    readFile(fileOne),
    readFile(fileTwo)
  ])

  if (!templateSchema || !fileOneData || !fileTwoData) return
  false

  const fileOneSheets = Object.keys(fileOneData.Sheets)
  const fileTwoSheets = Object.keys(fileTwoData.Sheets)

  try {
    const finalSheetOne: (string | StyledCell)[][] = []
    const finalSheetTwo: (string | StyledCell)[][] = []

    for (let i = 0; i < Math.max(fileOneSheets.length, fileTwoSheets.length); i++) {
      const sheetOne = fileOneSheets[i]
      const sheetTwo = fileTwoSheets[i]
      const sheetOneData = fetchXlsxAsAoa(fileOneData, sheetOne)
      const sheetTwoData = fetchXlsxAsAoa(fileTwoData, sheetTwo)

      const sheetOneTable = findTableIndex(sheetOneData, templateSchema, true)
      const sheetTwoTable = findTableIndex(sheetTwoData, templateSchema, true)

      if (typeof sheetOneTable === 'number' || typeof sheetTwoTable === 'number') continue

      const maxTableLength = Math.max(sheetOneTable.length, sheetTwoTable.length)

      for (let index = 0; index < maxTableLength; index++) {
        const tableOneRow = sheetOneTable[index]
        const tableTwoRow = sheetTwoTable[index]
        const newRowOne: (string | StyledCell)[] = [] //to be inserted into finalSheet{respective}
        const newRowTwo: (string | StyledCell)[] = [] //to be inserted into finalSheet{respective}

        if (tableOneRow?.toString().toLowerCase() !== tableTwoRow?.toString().toLowerCase()) {
          const cellLength = Math.max(tableOneRow?.length, tableTwoRow?.length)

          for (let cell = 0; cell < cellLength; cell++) {
            const newCellOne = {
              v: tableOneRow[cell],
              t: 's',
              s: { fill: { fgColor: { rgb: '32cd32' } } }
            }
            const newCellTwo = {
              v: tableTwoRow[cell],
              t: 's',
              s: { fill: { fgColor: { rgb: '32cd32' } } }
            }

            newRowOne.push(newCellOne)
            newRowTwo.push(newCellTwo)
          }

          finalSheetOne.push(newRowOne)
          finalSheetTwo.push(newRowTwo)
        } else {
          //if match then just insert, no change needed
          finalSheetOne.push(tableOneRow)
          finalSheetTwo.push(tableTwoRow)
        }
      }
    }

    return writeToXLSXFile(
      [XLSX.utils.aoa_to_sheet(finalSheetOne), XLSX.utils.aoa_to_sheet(finalSheetTwo)],
      'test'
    )
  } catch (error) {
    console.error(error)
    return false
  }
}

export const writeToXLSXFile = (sheets: [WorkSheet, WorkSheet], fileName: string) => {
  const workbook = XLSX.utils.book_new()

  for (let i = 0; i < sheets.length; i++)
    XLSX.utils.book_append_sheet(workbook, sheets[i], `${fileName}-${i}`)

  XLSX.writeFile(workbook, `C:\\Users\\micha\\Desktop\\${fileName}-${Date.now()}.xlsx`)
  console.log('file created')
  return true
}
