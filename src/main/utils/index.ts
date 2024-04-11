import { PATH, fileEncoding } from '@shared/constants'
import {
  FetchSheets,
  FindTableIndex,
  NewCell,
  NewSheet,
  StyledCell,
  TableSchema
} from '@shared/types'
import fs, { ensureDir } from 'fs-extra'
import path from 'path'
import XLSX, { WorkBook, WorkSheet } from 'xlsx-js-style'

/**
 *
 * Will extract the sheets from a work book.
 * if wb is passed as an array then sheet should also be passed as an array
 *
 * @param wb a single workboom or array of workbooks
 * @param sheet a string or array of strings.
 * @returns worksheets or array of worksheets
 */

export const fetchXlsxAsAoa = (wb: WorkBook | WorkBook[], sheet: string | string[]) => {
  if (!Array.isArray(wb)) {
    return XLSX.utils.sheet_to_json(wb.Sheets[sheet as string], {
      header: 1,
      defval: ''
    })
  }

  return [
    XLSX.utils.sheet_to_json(wb[0].Sheets[sheet[0]], {
      header: 1,
      defval: ''
    }),
    XLSX.utils.sheet_to_json(wb[1].Sheets[sheet[1]], {
      header: 1,
      defval: ''
    })
  ]
}

/**
 *
 * Takes in a Worksheet (2d arr)
 * if splice is set to true will return a 2d arr where each child is a row
 * if splice is false, will return the start index of the table, normally where headers are
 *
 * @param arr 2d array containing strings
 * @param template TemplateSchema {name: string}
 * @param splice boolean, optional, set to true to return spliced array instead of index
 * @returns number or 2d array
 */
export const findTableIndex: FindTableIndex = (arr, template, splice = false) => {
  const schema = Object.values(template).map((t) => t.name)

  if (!schema.length) return -1

  for (let i = 0; i < arr.length; i++) {
    const row = arr[i].map((s) => (typeof s === 'string' ? s.toLowerCase() : s))

    const fount = schema.every((header) => row.includes(header.toLowerCase()))

    if (!fount) continue
    if (!splice) return i

    return arr.splice(i)
  }

  return -1
}

/**
 *
 * Pass in two XLSX workbooks and returns the sheets for each files as arrays
 *
 * @param wbOne XLSX.WorkBook
 * @param wbTwo XLSX.WorkBook
 * @returns array of sheets
 */
export const fetchSheets: FetchSheets = (wbOne, wbTwo) => [
  Object.keys(wbOne.Sheets),
  Object.keys(wbTwo.Sheets)
]

/**
 *
 * @param dir string
 * @returns complete patch to dir provided
 */
export const getDir = (dir: string) => `${PATH}\\${dir}`

/**
 *
 * @param location location to create -> string
 * @returns
 */
export const createDirectory = async (location: string) => {
  const dir = getDir(location)
  await ensureDir(dir)
  return dir
}

/**
 *
 * Will take in two given xlsx workbooks, extract the sheets, compare the rows
 * and return two new objects containing {sheetName-filename: 2d array of rows}
 *
 * @param fileOneWb xlsx workbook
 * @param fileTwoWb xlsx workbook
 * @param templateSchema template schema -> [string]
 * @returns
 */

export const compareSheets = (fileOneWb, fileTwoWb, templateSchema) => {
  const fileOneNewSheets: NewSheet = {} //Collection of new sheets with formatted data
  const fileTwoNewSheets: NewSheet = {}
  const [fileOneSheets, fileTwoSheets] = fetchSheets(fileOneWb, fileTwoWb)
  const sheetOneNew: NewCell = [] // new sheet with formatted data, to be inserted into newSheets{respective}
  const sheetTwoNew: NewCell = []

  for (let i = 0; i < Math.max(fileOneSheets.length, fileTwoSheets.length); i++) {
    //iterate over highest sheets count
    const sheetNameOne = fileOneSheets[i] //Sheet names @type string
    const sheetNameTwo = fileTwoSheets[i]

    //Get each workbooks current sheet

    const [sheetFileOne, sheetFileTwo] = fetchXlsxAsAoa(
      [fileOneWb, fileTwoWb],
      [sheetNameOne, sheetNameTwo]
    )
    if (!sheetFileOne || !sheetFileTwo) return false

    //Get tables from current sheet

    const sheetOneTable = findTableIndex(sheetFileOne, templateSchema, true)
    const sheetTwoTable = findTableIndex(sheetFileTwo, templateSchema, true)
    if (typeof sheetOneTable === 'number' || typeof sheetTwoTable === 'number') return false //bugs out on delkim because of empty sheets

    //Get the max length of each table, due to incosistent table rows
    const maxTableLength = Math.max(sheetOneTable.length, sheetTwoTable.length)

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

    fileOneNewSheets[`${sheetNameOne}-fileOne`] = sheetOneNew
    fileTwoNewSheets[`${sheetNameTwo}-fileTwo`] = sheetTwoNew
  }

  return { fileOneNewSheets, fileTwoNewSheets }
}

export const writeToFile = async (location: string, data: any, name: string) => {
  try {
    const dir = await createDirectory(location)

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
    console.error(`main/utils/index: writeToDir \n${error}`)
    return false
  }
}

/**
 *
 * Find the Column and Row for a given cell value
 *
 * @param target string -> Cell contents
 * @param sheetData WorkSheet -> Xlsx Worksheet, typically a 2D array
 * @returns void if not found, {value, cell} if found. Cell will be the COL/ROW location within the table
 */
export const findCell = (target: string, sheetData: WorkSheet) => {
  const lowercaseValue = target.toLowerCase()

  for (const [cell, cellValue] of Object.entries(sheetData)) {
    if (!cellValue?.v) continue
    const value = String(cellValue.v).toLowerCase()

    if (value === lowercaseValue) {
      console.log(`Found table ${cellValue.v} at ${cell}`)
      return { value, cell }
    }
  }

  return
}

/**
 *
 * Will take in a xlsx workbook, iterate over sheets, and attempte to find the table headers
 *
 * @param templateSchema array of table header names
 * @param fileData XLSX Workbook
 * @returns boolean
 */

export const testSheet = (templateSchema: TableSchema[], fileData: WorkBook) => {
  for (const [sheet, sheetData] of Object.entries(fileData.Sheets)) {
    console.log('test sheet:', sheet)

    for (const { name } of templateSchema) {
      const lowercaseName = name.toLowerCase()

      const newCoords = findCell(lowercaseName, sheetData)

      if (!newCoords) return false
    }
  }

  return true
}
