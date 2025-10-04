// AUDIO AND VOLUME
const audio = document.getElementById("audio");
const seek = document.getElementById("seek");
const elapsed = document.getElementById("elapsed");
const duration = document.getElementById("duration");
const volumeSlider = document.getElementById("volume");
const volumeIcon = document.getElementById("volume-icon");

// MENU
const menu = document.getElementById("menu");
const dropdown = menu.querySelector(".dropdown");

// BUTTONS
const random = document.getElementById("random");
const previous = document.getElementById("previous");
const playPauseBtn = document.getElementById("playPauseBtn");
const defaultImg = playPauseBtn.querySelector(".play-pause-default");
const hoverImg = playPauseBtn.querySelector(".play-pause-hover");
const next = document.getElementById("next");

// SONG INFOS
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const album = document.getElementById("album");
const windowTitle = document.getElementById("window-title");

// Recently Played Submenu
const recentlyPlayed = [];
const MAX_RECENT = 10; // Limit how many recent songs to keep
const recentSubmenu = document.querySelector('.recently-played-submenu');

// Choose Song Submenu
// const allSongs = await window.electronAPI.getAllSongs();
// const chooseSongSubmenu = document.querySelector('.choose-song-submenu');

// Reset Option
const reset = document.getElementById("reset-option")


let isAutoShuffle = false; 
let lastPlayedIndex = -1;
let isPlaying = false;


window.electronAPI.getSongList().then((songList) => {
  buildChooseSong();
});


// ====================== ENABLE BUTTONS ======================

function enableButtons() {
  playPauseBtn.classList.remove("disabled");
  next.classList.remove("disabled");
  previous.classList.remove("disabled");
}

// ====================== PLAY TO PAUSE ======================

function playToPause() {
  // Set play/pause button to "pause" state
  const playPauseBtn = document.getElementById("playPauseBtn");
  const defaultImg = playPauseBtn.querySelector(".play-pause-default");
  const hoverImg = playPauseBtn.querySelector(".play-pause-hover");
  playPauseBtn.dataset.state = "pause";
  defaultImg.src = "assets/pause_button.svg";
  hoverImg.src = "assets/pause_button_hovered.svg";
}

// ====================== RESET (REVERT TO DEFAULT STATE) ======================

reset.addEventListener("click", (e) => {
  playPauseBtn.classList.add("disabled");
  next.classList.add("disabled");
  previous.classList.add("disabled");

  // Window Title Text
  windowTitle.textContent = "Mayday Parade Music Player by Lightsailor";

  // Time
  duration.textContent = "0:00";

  // Song Metadata
  album.textContent = "";
  title.textContent = "";
  cover.src = "assets/cover_placeholder.png";

  // Remove Loaded Audio
  audio.src = ""
})

// ====================== MENU ======================

menu.addEventListener("click", (e) => {
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
});

// ====================== CHOOSE BACKGROUND FEATURE ======================

document.querySelectorAll(".bg-item").forEach(item => {
  item.addEventListener("click", () => {
    const videoPath = item.getAttribute("data-bg");
    const video = document.getElementById("video_bg");
    video.src = videoPath;
    video.load();
    video.play();
  });
});

// ====================== TIME OF SONGS ======================

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

audio.addEventListener("loadedmetadata", () => {
  seek.max = Math.floor(audio.duration);
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!seek.dragging) {
    seek.value = Math.floor(audio.currentTime);
    elapsed.textContent = formatTime(audio.currentTime);
    updateSeekBackground();
  }
});

// ====================== PLAY A SONG AUTOMATICALLY AFTER A SONG HAS ENDED ======================

audio.addEventListener("ended", async () => {
  if (isAutoShuffle) {
    const songData = await window.electronAPI.getRandomSong();
    loadSong(songData);
  }
});

// ====================== SEEK ======================

function updateSeekBackground() {
  const value = (seek.value - seek.min) / (seek.max - seek.min) * 100;
  seek.style.background = `linear-gradient(to right, #D56B7E ${value}%, #6f6f6f ${value}%)`;
}

seek.addEventListener("input", () => {
  audio.currentTime = seek.value;
  updateSeekBackground();
});

// ====================== DEFAULT VOLUME ======================

const startingVolume = 0.1;
let lastVolume = startingVolume;
audio.volume = startingVolume;
volumeSlider.value = startingVolume;

// ====================== VOLUME AND VOLUME ICON ======================

function updateVolumeBackground() {
  const value = (volumeSlider.value - volumeSlider.min) / (volumeSlider.max - volumeSlider.min) * 100;
  volumeSlider.style.background = `linear-gradient(to right, #D56B7E ${value}%, #6f6f6f ${value}%)`;
}

function updateVolumeIcon(volume) {
  if (volume === 0) {
    volumeIcon.src = "assets/volume-x.svg";
  } else if (volume <= 0.25) {
    volumeIcon.src = "assets/volume-1.svg";
  } 
  else {
    volumeIcon.src = "assets/volume-2.svg";
  }
}

volumeSlider.addEventListener("input", () => {
  const volume = parseFloat(volumeSlider.value);
  audio.volume = volume;
  updateVolumeBackground();

  if (volume > 0) {
    lastVolume = volume;
  }

  updateVolumeIcon(volume);
});

volumeIcon.addEventListener("click", () => {
  if (audio.volume > 0) {
    lastVolume = parseFloat(volumeSlider.value);
    volumeSlider.value = 0;
    audio.volume = 0;
  } else {
    volumeSlider.value = lastVolume;
    audio.volume = lastVolume;
  }
  updateVolumeIcon(audio.volume);
  updateVolumeBackground(); // Optional: update fill after toggle
});

// ====================== CHOOSE SONG ======================

// function buildChooseSong(songList) {
//   const submenuContainer = document.getElementById('submenuContainer');

//   const albums = new Map();
//   for (const song of songList) {
//     const albumIndex = song.albumIndex;

//     if (!albums.has(albumIndex)) {
//       albums.set(albumIndex, {
//         albumName: song.albumName,
//         albumPath: song.albumPath,
//         songs: [],
//       });
//     }
//     albums.get(albumIndex).songs.push(song);
//   }

//   const sortedAlbumIndexes = Array.from(albums.keys()).sort((a, b) => a - b);

//   for (const index of sortedAlbumIndexes) {
//     const albumData = albums.get(index);

//     const albumDiv = document.createElement('div');
//     albumDiv.className = 'album-item';

//     const albumTitle = document.createElement('div');
//     albumTitle.textContent

//   }


  // songs.forEach(song => {
  //   const option = document.createElement('list');
  //   option.value = song.fullPath;
  //   option.textContext = `${song.title} (${song.extension})`;
  //   option.dataset.filename = song.filename;
  //   select.appendChild(option);
  // });
//   }



// ====================== PLAY SOMETHING ======================

random.addEventListener("click", async () => {
  const songData = await window.electronAPI.getRandomSong();
  isAutoShuffle = true;
  loadSong(songData);

  // Reset seek bar to 0
  seek.value = 0;
  audio.currentTime = 0;
  updateSeekBackground();

  playToPause();
  enableButtons();
});

// ====================== LOADING OF SONG AND DISPLAYING ITS INFO ======================

const albumText = [
  "From the EP Tales Told By Dead Friends (2006)",
  "From the album A Lesson in Romantics (2007)",
  "From the album Anywhere but Here (2009)",
  "From the EP Valdosta EP (2009)",
  "From the album Mayday Parade (2011)",
  "From the album Monsters In The Closet (2013)",
  "From the album Black Lines (2015)",
  "From the album Sunnyland (2018)",
  "From the EP Out of Here (2020)",
  "From the album What It Means To Fall Apart (2021)",
  "From the EP More Like A Crash (2023)",
  "From the album Sweet (2025)",
  "From the album Sad (2025)"
];

async function loadSong(songData) {
  if (songData) {
    audio.src = songData.url;
    title.textContent = songData.title;

    // Edge case for song number 6
    if (songData.index === 6) {
      album.textContent = "From the EP Tales Told By Dead Friends (Anniversary Edition) (2016)"; 
    } else {
      album.textContent = albumText[songData.albumIndex] || songData.album;
    }

    cover.src = songData.cover;
    windowTitle.textContent = `${songData.title} — ${songData.album}`;
    audio.play();

    // Recently played section, will not push a song if the song is the same as the most recently played song
    if (
      recentlyPlayed.length === 0 ||
      recentlyPlayed[0].path !== songData.path
    ) {
      recentlyPlayed.unshift(songData); // Add to top

      if (recentlyPlayed.length > MAX_RECENT) {
        recentlyPlayed.pop(); // Trim to max
      }

      renderRecentlyPlayed();
    }

  }
}

// ====================== RECENTLY PLAYED ======================

function renderRecentlyPlayed() {
  recentSubmenu.innerHTML = ""; // Clear existing list

  recentlyPlayed.forEach((song, i) => {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.textContent = `${song.title} — ${song.album}`;
    item.addEventListener("click", () => {
      loadSong(song); // Play that song when clicked
      window.electronAPI.setCurrentIndex(song.index);
      enableButtons();
      playToPause();
    });
    recentSubmenu.appendChild(item);
  });
}

// ====================== NO SONG WILL REPEAT TWICE IN A ROW ======================

async function getRandomSongWithoutRepeat() {
  let tries = 0;
  let songData;

  do {
    songData = await window.electronAPI.getRandomSong();
    // Extract index from song URL (assuming index is embedded in the songList order)
    // We'll instead extract based on full path matching
    const newIndex = songList.findIndex(song => `file://${song.path}` === songData.url);
    if (newIndex !== lastPlayedIndex) {
      lastPlayedIndex = newIndex;
      break;
    }

    tries++;
  } while (tries < 10);

  return songData;
}

// ====================== PREVIOUS BUTTON ======================

previous.addEventListener("click", async () => {
  if (previous.classList.contains("disabled")) return;

  if (audio.currentTime > 2) {
    // Restart current song
    audio.currentTime = 0;
    seek.value = 0;
    updateSeekBackground();
  } else {
    // Actually go to previous song
    const songData = await window.electronAPI.navigate("previous");
    loadSong(songData);
    playToPause();
  }
});


// ====================== NEXT BUTTON ======================

next.addEventListener("click", async () => {
  if (next.classList.contains("disabled")) return;
  const songData = await window.electronAPI.navigate("next");
  loadSong(songData);
  playToPause();
});

// ====================== PLAY/PAUSE BUTTON ======================

playPauseBtn.addEventListener("click", () => {
  if (playPauseBtn.classList.contains("disabled")) return;
  
  const isPlaying = playPauseBtn.dataset.state === "pause";

  if (isPlaying) {
    // Change to play state
    playPauseBtn.dataset.state = "play";
    defaultImg.src = "assets/play_button.svg";
    hoverImg.src = "assets/play_button_hovered.svg";
    audio.pause();

  } else {
    // Change to pause state
    playPauseBtn.dataset.state = "pause";
    defaultImg.src = "assets/pause_button.svg";
    hoverImg.src = "assets/pause_button_hovered.svg";
    audio.play();
  }
});

// ====================== KEYBINDS ======================

document.addEventListener("keydown", (event) => {
  const activeTag = document.activeElement.tagName.toLowerCase();
  if (activeTag === "input" || activeTag === "textarea") return;

  switch (event.code) {
    case "Space":
      event.preventDefault();
      playPauseBtn.click();
      break;

    case "ArrowLeft":
      previous.click();
      break;

    case "ArrowRight":
      next.click();
      break;

    case "Enter":
      random.click();
      break;
  }
});


// ====================== CONTINUOUS UPDATES ======================

// adjustTitleFontSizeByLength()
getRandomSongWithoutRepeat()
updateSeekBackground();
updateVolumeBackground();
seek.addEventListener('input', updateSeekBackground);
volumeSlider.addEventListener('input', updateVolumeBackground);
