import {
  CompareBoms,
  DeleteTemplate,
  FetchTemplate,
  FetchTemplateNames,
  GetDir,
  SaveTemplate,
  TestTemplate
} from '@shared/types'

declare global {
  interface Window {
    // electron: ElectronAPI
    context: {
      locale: string
      getDir: GetDir
      saveTemplate: SaveTemplate
      fetchTemplateNames: FetchTemplateNames
      deleteTemplate: DeleteTemplate
      fetchTemplate: FetchTemplate
      testTemplate: TestTemplate
      onTestTemplateResult: (boolean) => void
      onRemoveTestTemplate: () => void
      compareBoms: CompareBoms
    }
  }
}
