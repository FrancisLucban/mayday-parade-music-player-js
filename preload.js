const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getRandomSong: () => ipcRenderer.invoke('get-random-song'),
  navigate: (direction) => ipcRenderer.invoke('navigate', direction),
});