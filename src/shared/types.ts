import { WorkSheet } from 'xlsx'

export type GetDir = (dir: string) => Promise<string>
export type SaveTemplate = (data: TableSchema[], name: string) => Promise<boolean>
export type NavItems = 'templates' | 'boms'
export type TableSchema = { name: string }
export type FetchTemplateNames = () => Promise<string[]>
export type DeleteTemplate = (name: string) => Promise<boolean>
export type FetchTemplate = (name: string) => Promise<TableSchema[] | undefined>
export type TestTemplate = (template: string, file: string) => Promise<boolean>
export type OnTestTemplateResult = (callback: (valid: boolean) => void) => void
export type CompareBoms = (fileOne: string, fileTwo: string, template: string) => void
export type ExtractTableData = (
  fileTable: { row: string; col: string; value: string }[],
  fileData: WorkSheet
) => NewTableSchema
export type NewTableSchema = { row: string; col: string; header: string; value: string }[]
export type XLSXCell =
  | {
      t?: string | number
      v?: string | number
      r?: string | number
      h?: string | number
      w?: string | number
      ref?: string
      left?: number
      right?: number
      top?: number
      bottom?: number
      header?: number
      footer?: string
    }
  | undefined

export type ContextBridge = {
  locale: string
  getDir: GetDir
  saveTemplate: SaveTemplate
  fetchTemplateNames: FetchTemplateNames
  deleteTemplate: DeleteTemplate
  fetchTemplate: FetchTemplate
  testTemplate: TestTemplate
}
