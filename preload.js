const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    reminderMessage: (message) => ipcRenderer.send('reminder-message', message),
    returnToiPlayer: () => ipcRenderer.send('return-to-iPlayer', true)
})
