import { FetchXlsxAsAoa, FindTableIndex } from '@shared/types'
import XLSX, { WorkBook } from 'xlsx-js-style'

export const fetchXlsxAsAoa: FetchXlsxAsAoa = (wb: WorkBook, sheet: string) => {
  return XLSX.utils.sheet_to_json(wb.Sheets[sheet], {
    header: 1,
    defval: ''
  })
}

/**
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

    const fount = schema.every((header) => row.includes(header))

    if (!fount) continue
    if (!splice) return i

    return arr.splice(i)
  }

  return -1
}
