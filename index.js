const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');

let mainWindow;
let songList = [];
let currentIndex = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 760,
    minWidth: 1050,
    minHeight: 760,
    icon: path.join(__dirname, 'assets', 'mp-pink-logo.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  mainWindow.loadFile('index.html');
  buildSongList();
}

app.whenReady().then(() => {
  createWindow();
});

// ====================== CONSTRUCTION OF THE SONG LIST ======================

async function buildSongList() {
  const musicRoot = path.join(__dirname, 'songs');
  const albums = fs.readdirSync(musicRoot)
    .filter(item => fs.statSync(path.join(musicRoot, item)).isDirectory())
    .sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

  for (const [index, album] of albums.entries()) {
    const albumPath = path.join(musicRoot, album);

    if (fs.statSync(albumPath).isDirectory()) {
      const songs = fs.readdirSync(albumPath).filter(file => file.endsWith('.flac'));

      for (const song of songs) {
        const songPath = path.join(albumPath, song);
        let title = path.parse(song).name;
        let albumName = album;

        try {
          const metadata = await mm.parseFile(songPath);
          if (metadata.common.title) title = metadata.common.title;
          if (metadata.common.album) albumName = metadata.common.album;
        } catch (err) {
          console.warn(`Could not read metadata for ${song}:`, err.message);
        }

        songList.push({
          path: songPath,
          albumIndex: index,
          albumName: albumName,
          albumPath: albumPath,
          fileName: song,
          title: title,
        });
      }
    }
  }
}

// ====================== GET SONG LIST ======================

ipcMain.handle('get-song-list', async () => {
  return songList
});


// ====================== SET CURRENT INDEX ======================

ipcMain.handle('set-current-index', (_, index) => {
  currentIndex = index;
});

// ====================== PLAY SOMETHING FUNCTION ======================

ipcMain.handle('get-random-song', () => {
  const index = Math.floor(Math.random() * songList.length);
  currentIndex = index;
  const song = songList[index];

  return {
    url: `file://${song.path}`,
    title: song.title,
    album: song.albumName,
    albumIndex: song.albumIndex,
    cover: `file://${path.join(song.albumPath, 'cover.jpg')}`,
    index : index,
    path: song.path
  };
});

// ====================== NAVIGATION (PLAYING OF SONGS USING PREVIOUS OR NEXT) ======================

ipcMain.handle('navigate', (_, direction) => {
  if (direction === 'next') {
    currentIndex = (currentIndex + 1) % songList.length;
  } else if (direction === 'previous') {
    currentIndex = (currentIndex - 1 + songList.length) % songList.length;
  }

  const song = songList[currentIndex];
  return {
    url: `file://${song.path}`,
    title: song.title,
    album: song.albumName,
    albumIndex: song.albumIndex,
    cover: `file://${path.join(song.albumPath, 'cover.jpg')}`,
    index : currentIndex,
    path: song.path
  };
});


