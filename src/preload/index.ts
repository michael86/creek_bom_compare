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
      ipcRenderer.invoke('saveTemplate', data, name),
    fetchTemplateNames: (name?: string) => ipcRenderer.invoke('fetchTemplateNames', name),
    deleteTemplate: (name) => ipcRenderer.invoke('deleteTemplate', name),
    fetchTemplate: (name) => ipcRenderer.invoke('fetchTemplate', name),
    testTemplate: (template, file) => ipcRenderer.invoke('testTemplate', template, file)
  })
} catch (error) {
  console.error(error)
}
