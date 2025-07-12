
console.log("JAVAscript");
let songs;
let currFolder;
let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${minutes}:${secs}`;
}

function loadSongsToUI(songs) {
  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="music icon" />
        <div class="info">
          <div>${song}</div>
          <div>Song Artist</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="play icon" />
        </div>
      </li>
    `;
  }

  document.querySelectorAll(".songList li").forEach((li) => {
    li.addEventListener("click", () => {
      const songName = li.querySelector(".info div").innerText.trim();
      playMusic(songName);
    });
  });
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    document.querySelector("#play").src = "pause.svg";
  }
  document.querySelector(".songinfo").innerText = decodeURI(track);
  document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

async function DisplayAlbums() {
  let res = await fetch("./songs/songs.json");
  let albums = await res.json();

  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (const album of albums) {
    cardContainer.innerHTML += `
      <div data-folder="${album.folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="none">
            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="#000" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
        <img src="songs/${album.folder}/${album.image}" alt="Album Art" onerror="this.onerror=null; this.src='default.jpg';" />
        <h4>${album.title || "Untitled Album"}</h4>
        <p>${album.Description || "No description available"}</p>
      </div>
    `;
  }

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      let folder = card.dataset.folder;
      let album = albums.find(a => a.folder === folder);
      if (album) {
        songs = album.songs;
        currFolder = `./songs/${folder}`;
        loadSongsToUI(songs);
        playMusic(songs[0]);
      }
    });
  });
}

async function main() {
  let res = await fetch("./songs/songs.json");
  let albums = await res.json();
  console.log("Albums loaded", albums);

  let firstAlbum = albums[0];
  if (!firstAlbum) return;

  songs = firstAlbum.songs;
  currFolder = `./songs/${firstAlbum.folder}`;

  loadSongsToUI(songs);
  playMusic(songs[0], true);
  DisplayAlbums();

  let playBtn = document.querySelector("#play");
  playBtn.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      playBtn.src = "pause.svg";
    } else {
      currentSong.pause();
      playBtn.src = "play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = `${percent}%`;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  document.querySelector("#previous").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index > 0) playMusic(songs[index - 1]);
  });

  document.querySelector("#next").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index + 1 < songs.length) playMusic(songs[index + 1]);
  });

  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
    document.querySelector(".volume img").src = currentSong.volume > 0 ? "volume.svg" : "mute.svg";
  });

  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      currentSong.volume = 0;
      e.target.src = "mute.svg";
      document.querySelector(".range input").value = 0;
    } else {
      currentSong.volume = 0.1;
      e.target.src = "volume.svg";
      document.querySelector(".range input").value = 10;
    }
  });
}

main();

