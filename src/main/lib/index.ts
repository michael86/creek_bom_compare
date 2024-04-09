import { PATH, fileEncoding, templateDir } from '@shared/constants'
import {
  CompareBoms,
  DeleteTemplate,
  ExtractTableData,
  FetchTemplate,
  FetchTemplateNames,
  NewTableSchema,
  TableSchema,
  TestTemplate
} from '@shared/types'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'
import XLSX, { WorkSheet, readFile } from 'xlsx-js-style'

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

  const { Sheets: fileOneSheets } = fileOneData
  const { Sheets: fileTwoSheets } = fileTwoData

  //Find where tables start in each file
  // One possible issue to address is if one sheet has multiple worksheets
  // Address this at a later date
  try {
    for (const key of Object.keys(fileOneSheets)) {
      const fileOneData = fileOneSheets[key]
      const fileOneTable = findTableRow(fileOneData, templateSchema)
      if (!fileOneTable) throw new Error('Failed to find table row in file one')

      const fileTwoData = fileTwoSheets[key]
      const fileTwoTable = findTableRow(fileTwoData, templateSchema)
      if (!fileTwoTable) throw new Error('Failed to find table row in file two')

      const fileOneNewTable = extractTableData(fileOneTable, fileOneData)
      const fileTwoNewTable = extractTableData(fileTwoTable, fileTwoData)
      if (!fileOneNewTable || !fileTwoNewTable) throw new Error('Failed to build new tables')

      //Sort our tables by column placement
      fileOneTable.sort((a, b) => (a.col > b.col ? 1 : -1))
      fileTwoTable.sort((a, b) => (a.col > b.col ? 1 : -1))

      //Sort actual data by col placement and then row placement
      fileOneNewTable
        .sort((a, b) => (a.col < b.col ? 1 : -1))
        .sort((a, b) => (a.col === b.col && a.row > b.row ? 1 : -1))

      fileTwoNewTable
        .sort((a, b) => (a.col < b.col ? 1 : -1))
        .sort((a, b) => (a.col === b.col && a.row > b.row ? 1 : -1))

      const tableOne = sortObjectsTo2DArray(fileOneNewTable)
      const tableTwo = sortObjectsTo2DArray(fileTwoNewTable)
      const [tableOneFormatted, tableTwoFormatted] = convertArraysToXlsxStyle(tableOne, tableTwo)

      writeToXLSXFile([tableOneFormatted, tableTwoFormatted], template)
    }
  } catch (error) {
    console.error(error)
    return false
  }
}

// export const compareToXLSX = (tableOne, tableTwo) => {
//   const highest = tableOne.length >= tableTwo.length ? 'one' : 'two'

//   const formattedFileOne: (string | { v: string; t: string; s: any })[][] = []
//   const formattedFileTwo: (string | { v: string; t: string; s: any })[][] = []

//   for (let i = 0; i < Math.max(tableOne.length, tableTwo.length); i++) {
//     if (highest === 'one') {
//       if (tableOne[i]?.toString() === tableTwo[i]?.toString()) {
//         formattedFileOne.push(tableOne[i])
//         formattedFileTwo.push(tableTwo[i])
//         continue
//       }

//       const fileOneNewRow: { v: string; t: string; s: any }[] = []
//       const fileTwoNewRow: { v: string; t: string; s: any }[] = []

//       for (let o = 0; o < Math.max(tableOne[i]?.length, tableTwo[i]?.length); o++) {
//         const style =
//           tableOne[i][o]?.v !== tableTwo[i][o]?.v ? { fill: { fgColor: { rgb: 'FF0000' } } } : {}

//         const entryFileOne = { ...tableOne[i][o], s: { ...style } }
//         const entryFileTwo = { ...tableTwo[i][o], s: { ...style } }

//         fileOneNewRow.push(entryFileOne)
//         fileTwoNewRow.push(entryFileTwo)
//       }

//       formattedFileOne.push(fileOneNewRow)
//       formattedFileTwo.push(fileTwoNewRow)
//     }
//   }

//   return [formattedFileOne, formattedFileTwo]
// }

export const writeToXLSXFile = (tables: any[][], fileName: string) => {
  const workbook = XLSX.utils.book_new()
  for (let i = 0; i < tables.length; i++) {
    const ws = XLSX.utils.aoa_to_sheet(tables[i])
    XLSX.utils.book_append_sheet(workbook, ws, `${fileName}-${i}`)
  }

  XLSX.writeFile(workbook, `C:\\Users\\micha\\Desktop\\${fileName}-${Date.now()}.xlsx`)
  console.log('file created')
}

function sortObjectsTo2DArray(objects: NewTableSchema): string[][] {
  // Find the minimum row and column values
  const minRow = Math.min(...objects.map((obj) => parseInt(obj.row)))
  const minCol = Math.min(...objects.map((obj) => obj.col.charCodeAt(0) - 'A'.charCodeAt(0)))

  // Adjust the row and column indices to start at 1 and 'A', respectively
  const result: string[][] = []

  for (const obj of objects) {
    const rowIndex = parseInt(obj.row) - minRow
    const colIndex = obj.col.charCodeAt(0) - 'A'.charCodeAt(0) - minCol

    // Ensure the row index is within the bounds of the result array
    while (result.length <= rowIndex) {
      result.push([])
    }

    // Fill any empty columns with empty strings
    while (result[rowIndex].length < colIndex) {
      result[rowIndex].push('')
    }

    // Insert the value into the appropriate position
    result[rowIndex][colIndex] = obj.value
  }

  return result
}
function convertArraysToXlsxStyle(arr1, arr2) {
  const maxLength = Math.max(arr1.length, arr2.length)
  const convertedArr1 = []
  const convertedArr2 = []

  for (let i = 0; i < maxLength; i++) {
    const row1 = arr1[i] || []
    const row2 = arr2[i] || []
    const convertedRow1 = []
    const convertedRow2 = []

    for (let j = 0; j < Math.max(row1.length, row2.length); j++) {
      const value1 = row1[j]
      const value2 = row2[j]

      if (value1 !== value2) {
        const modifiedValue1 = { v: value1, t: 's' }
        const modifiedValue2 = { v: value2, t: 's' }
        if (i < arr1.length && j < row1.length) {
          modifiedValue1.s = { fill: { fgColor: { rgb: 'FF000' } } }
          convertedRow1.push(modifiedValue1)
        } else {
          convertedRow1.push(value1)
        }
        if (i < arr2.length && j < row2.length) {
          modifiedValue2.s = { fill: { fgColor: { rgb: 'FF000' } } }
          convertedRow2.push(modifiedValue2)
        } else {
          convertedRow2.push(value2)
        }
      } else {
        convertedRow1.push(value1)
        convertedRow2.push(value2)
      }
    }

    convertedArr1.push(convertedRow1)
    convertedArr2.push(convertedRow2)
  }

  return [convertedArr1, convertedArr2]
}
