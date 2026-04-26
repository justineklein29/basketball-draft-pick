let playing = false;
let audio = new Audio();
audio.loop = true;

const tracks = [
  { name: "Slam Dunk Theme", artist: "OST", file: "music/_slam-dunk-kimi-ga-suki-da-to-sakebitai.mp3" },

];

let trackIdx = 0;

function setPlaying(state) {
  playing = state;

  const icon = document.getElementById("playIcon");
  const eq = document.getElementById("eq");
  const artist = document.getElementById("trackArtist");

  if (playing) {
    icon.innerHTML =
      '<rect x="2" y="2" width="3" height="10" fill="#080c18"/><rect x="7" y="2" width="3" height="10" fill="#080c18"/>';

    eq.querySelectorAll(".eq-bar").forEach((b) =>
      b.classList.add("active")
    );
  } else {
    icon.innerHTML =
      '<path d="M1 1L11 7L1 13V1Z" fill="#080c18"/>';

    eq.querySelectorAll(".eq-bar").forEach((b) =>
      b.classList.remove("active")
    );

    artist.textContent = "Click to play";
  }
}

function toggleMusic() {
  if (!playing) {
    trackIdx = (trackIdx + 1) % tracks.length;
    const track = tracks[trackIdx];

    document.getElementById("trackName").textContent = track.name;
    document.getElementById("trackArtist").textContent = track.artist;

    audio.pause();
    audio = new Audio(track.file);
    audio.loop = true;

    audio.play().catch(err => {
      console.log("Audio blocked until user interaction:", err);
    });

    setPlaying(true);
  } else {
    audio.pause();
    setPlaying(false);
  }
}