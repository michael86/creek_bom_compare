export type GetDir = (dir: string) => string
export type SaveTemplate = (data: TableSchema[], name: string) => Promise<boolean>
export type NavItems = 'templates' | 'boms'
export type TableSchema = { name: string; col: string; row: string }
