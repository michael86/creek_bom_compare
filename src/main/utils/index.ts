import { FetchSheets, FindTableIndex } from '@shared/types'
import XLSX, { WorkBook } from 'xlsx-js-style'

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
