import { TableSchema } from '@shared/types'
import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getDir: (dir: string) => ipcRenderer.invoke('getDir', dir),
    saveTemplate: (data: TableSchema[], name: string) =>
      ipcRenderer.invoke('saveTemplate', data, name)
  })
} catch (error) {
  console.error(error)
}
