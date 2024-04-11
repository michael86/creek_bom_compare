import { fileEncoding, templateDir } from '@shared/constants'
import {
  CompareBoms,
  DeleteTemplate,
  FetchTemplate,
  FetchTemplateNames,
  NewSheet,
  TableSchema,
  TestTemplate
} from '@shared/types'
import { app, dialog } from 'electron'
import fs from 'fs-extra'
import path from 'path'
import XLSX, { readFile } from 'xlsx-js-style'
import { compareSheets, getDir, testSheet, writeToFile } from '../utils'

/**
 *
 * @param data  -> typically templateSchema[]
 * @param name  -> Name of file
 * @param dir -> directory for file to be saved. Optional, defaults to template directory
 * @returns -> Promise(boolean) based on result
 */
export const saveTemplate = async (data: TableSchema[], name: string, dir = templateDir) => {
  try {
    writeToFile(dir, data, name)

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 *
 * Returns an array containing all the saved table templates
 * To get a single template, see fetchTemplate
 *
 * @returns [string]
 */
export const fetchTemplateNames: FetchTemplateNames = async () => {
  try {
    const dir = getDir(templateDir)
    const files = await fs.readdir(dir)
    return files.map((file) => file.replace('.json', ''))
  } catch (error) {
    console.error(error)
    return []
  }
}

/**
 *
 * Deletes a template
 *
 * @param name string -> template name
 * @returns
 */
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

/**
 *
 * @param name name of template
 * @returns the data from given template
 */
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

/**
 *
 * Will test the template name against the file provided
 *
 * @param template -> string - template name
 * @param file -> string - location of file
 * @returns boolean based on results
 */

export const testTemplate: TestTemplate = async (template, file) => {
  try {
    console.log('testing ', file)
    const [templateSchema, fileData] = await Promise.all([fetchTemplate(template), readFile(file)])
    if (!templateSchema || !fileData) throw new Error(`Failed to fetchTemplate or filedata`)
    return testSheet(templateSchema, fileData)
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 *
 * Will take in two files and compare them, results in a file being created
 *
 * @param fileOne Name of first file
 * @param fileTwo Name of second file
 * @param template Name of template to use
 * @returns boolean
 */
export const compareBoms: CompareBoms = async (fileOne, fileTwo, template) => {
  const [templateSchema, fileOneWb, fileTwoWb] = await Promise.all([
    fetchTemplate(template),
    readFile(fileOne),
    readFile(fileTwo)
  ])

  if (!templateSchema || !fileOneWb || !fileTwoWb) return false

  console.log('comparing sheets')
  try {
    const result = compareSheets(fileOneWb, fileTwoWb, templateSchema)
    if (!result) throw new Error(`Failed to compare sheets ${result}`)
    return writeToXLSXFile({ ...result.fileOneNewSheets, ...result.fileTwoNewSheets })
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
