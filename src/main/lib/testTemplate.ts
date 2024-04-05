import { TestTemplate } from '@shared/types'
import { readFile } from 'xlsx'
import { fetchTemplate } from '.'

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
        console.log(`comparing ${cell}`)
        console.log('sheetData[cell] ', sheetData[cell])
        // console.log('type ', typeof sheetData[cell])
      }
    }

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
