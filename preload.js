const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getRandomSong: () => ipcRenderer.invoke('get-random-song'),
  navigate: (direction) => ipcRenderer.invoke('navigate', direction),
  getSongList: () => ipcRenderer.invoke('get-song-list'),
  setCurrentIndex: (index) => ipcRenderer.invoke('set-current-index', index)
});