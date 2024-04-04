import { GetDir, SaveTemplate } from '@shared/types'

declare global {
  interface Window {
    // electron: ElectronAPI
    context: {
      locale: string
      getDir: GetDir
      saveTemplate: SaveTemplate
    }
  }
}
