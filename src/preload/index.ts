import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {
    pickFile: (extensions: string[]) => ipcRenderer.invoke('pickFile', extensions),
    readExcelWithPassword: (filePath: string) => ipcRenderer.invoke('readExcelWithPassword', filePath),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
        console.error(error);
    }
} else {
    // @ts-ignore (define in dts)
    window.api = api;
}

