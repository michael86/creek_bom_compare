import { contextBridge, ipcRenderer } from 'electron'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('context', {
    locale: navigator.language,
    getDir: (dir) => ipcRenderer.invoke('getDir', dir),
    saveTemplate: (data, name) => ipcRenderer.invoke('saveTemplate', data, name),
    fetchTemplateNames: (name?) => ipcRenderer.invoke('fetchTemplateNames', name),
    deleteTemplate: (name) => ipcRenderer.invoke('deleteTemplate', name),
    fetchTemplate: (name) => ipcRenderer.invoke('fetchTemplate', name),
    testTemplate: (template, file, autoFind) =>
      ipcRenderer.invoke('testTemplate', template, file, autoFind),
    onTestTemplateResult: (callback) => {
      ipcRenderer.on('testTemplateResult', (_, valid) => {
        callback(valid)
      })
    },
    onRemoveTestTemplate: () => {
      console.log('removed listener')
      ipcRenderer.removeAllListeners('testTemplateResult')
    },
    compareBoms: (fileOne, fileTwo, template) => {
      ipcRenderer.invoke('compareBoms', fileOne, fileTwo, template)
    }
  })
} catch (error) {
  console.error(error)
}
