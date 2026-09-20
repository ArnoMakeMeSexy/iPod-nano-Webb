const S = {
  songs: JSON.parse(localStorage.getItem("nanoSongs") || "[]"),
  i: 0,
  playing: false,
  view: "home",
  player: null,
  ready: false,
  pendingPlay: false,
  wheel: { active: false, lastAngle: 0, accumulated: 0, lastMove: 0 }
};

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[char]));

function save() {
  localStorage.setItem("nanoSongs", JSON.stringify(S.songs));
}

function videoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be" || parsed.hostname.endsWith("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }
    }
  } catch (_) {
    return null;
  }
  return null;
}

function classify(title) {
  const cleaned = (title || "")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*(official|audio|video|lyrics?|mv|music)[^)]*\)/ig, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = cleaned.split(/\s[-–—|｜]\s/);
  return {
    name: parts[0] || "YouTube song",
    artist: parts[1] || "Unknown artist"
  };
}

function add(url, title = "") {
  const id = videoId(url);
  if (!id) {
    alert("請輸入有效的 YouTube 影片網址");
    return;
  }
  const info = classify(title);
  S.songs.push({ id, url, title: title || info.name, name: info.name, artist: info.artist });
  S.i = S.songs.length - 1;
  save();
  render();
}

function ytReady() {
  S.ready = true;
}
window.onYouTubeIframeAPIReady = ytReady;

function loadPlayer(id, startImmediately = false) {
  if (!S.ready || !window.YT || !YT.Player) {
    S.pendingPlay = startImmediately;
    alert("YouTube 播放器尚未載入完成，請稍候再按播放。");
    return;
  }

  S.pendingPlay = startImmediately;
  if (!S.player) {
    S.player = new YT.Player("yt", {
      width: "100%",
      height: "220",
      videoId: id,
      playerVars: {
        autoplay: startImmediately ? 1 : 0,
        controls: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event) => {
          if (S.pendingPlay) {
            S.pendingPlay = false;
            event.target.playVideo();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) S.playing = true;
          if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) S.playing = false;
          render();
        },
        onError: () => {
          S.playing = false;
          alert("這部 YouTube 影片無法嵌入播放，請換另一部影片。");
          render();
        }
      }
    });
    return;
  }

  S.player.loadVideoById(id);
  if (startImmediately) S.player.playVideo();
}

function play(index = S.i) {
  if (!S.songs.length) return;
  S.i = index;
  S.playing = true;
  loadPlayer(S.songs[S.i].id, true);
  render();
}

function toggle() {
  if (!S.songs.length) return;
  if (!S.player) {
    play();
    return;
  }
  if (S.playing) {
    S.player.pauseVideo();
  } else {
    S.player.playVideo();
  }
}

function next() {
  if (!S.songs.length) return;
  play((S.i + 1) % S.songs.length);
}

function prev() {
  if (!S.songs.length) return;
  play((S.i - 1 + S.songs.length) % S.songs.length);
}

function remove(index) {
  S.songs.splice(index, 1);
  if (S.i >= S.songs.length) S.i = Math.max(0, S.songs.length - 1);
  if (!S.songs.length && S.player) S.player.stopVideo();
  save();
  render();
}

function artists() {
  return [...new Set(S.songs.map((song) => song.artist))];
}

function render() {
  const song = S.songs[S.i];
  let html = "";
  $("count").textContent = `${S.songs.length} 首`;

  if (S.view === "home") {
    html = `<div class="hero"><div class="cover">♪</div><b>${song ? esc(song.name) : "Music"}</b><small>${song ? esc(song.artist) : "請加入歌曲"}</small><p>${S.playing ? "▶ 播放中" : "Ⅱ 暫停"}</p></div>`;
  }
  if (S.view === "menu") {
    html = `<ul class="list"><li onclick="list('songs')">Songs <span>›</span></li><li onclick="list('artists')">Artists <span>›</span></li><li onclick="list('playlists')">Playlists <span>›</span></li></ul>`;
  }
  if (S.view === "songs") {
    html = `<div class="library">${S.songs.length ? S.songs.map((item, index) => `<div class="song"><div class="meta" onclick="play(${index})"><b>${esc(item.name)}</b><small>${esc(item.artist)}</small></div><button onclick="remove(${index})">×</button></div>`).join("") : "<p>尚未加入歌曲</p>"}</div>`;
  }
  if (S.view === "artists") {
    html = `<ul class="list">${artists().map((artist) => `<li>${esc(artist)} <span>${S.songs.filter((item) => item.artist === artist).length}</span></li>`).join("") || "<li>沒有歌手</li>"}</ul>`;
  }
  if (S.view === "playlists") {
    html = `<ul class="list"><li>All Songs <span>${S.songs.length}</span></li><li>Favorites <span>0</span></li></ul>`;
  }
  if (S.view === "now") {
    html = song ? `<div class="now"><div class="cover">♪</div><b>${esc(song.name)}</b><small>${esc(song.artist)}</small><p>${S.playing ? "▶ 播放中" : "Ⅱ 暫停"}</p></div>` : "<div class=\"hero\">沒有正在播放的歌曲</div>";
  }

  $("screen").innerHTML = html;
  $("title").textContent = S.view === "home" ? (song?.name || "Music") : S.view[0].toUpperCase() + S.view.slice(1);
  $("mini").textContent = song ? `${song.artist} — ${song.name}` : "未播放";
}

function home() { S.view = "home"; render(); }
function list(type) { S.view = type; render(); }

$("menu").onclick = () => S.view === "menu" ? home() : list("menu");
$("select").onclick = () => { if (S.view === "home") toggle(); };
$("play").onclick = toggle;
$("next").onclick = next;
$("prev").onclick = prev;

// Rotate the click wheel to browse songs. Pointer Events cover mouse, touch and
// Apple Pencil, while pointer capture keeps the gesture alive around the wheel.
const wheel = document.querySelector(".wheel");
if (wheel) {
  wheel.style.touchAction = "none";

  const wheelAngle = (event) => {
    const rect = wheel.getBoundingClientRect();
    return Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2)
    ) * 180 / Math.PI;
  };

  wheel.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    S.wheel.active = true;
    S.wheel.lastAngle = wheelAngle(event);
    S.wheel.accumulated = 0;
    S.wheel.lastMove = 0;
    wheel.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  wheel.addEventListener("pointermove", (event) => {
    if (!S.wheel.active || event.pointerId !== undefined && !wheel.hasPointerCapture?.(event.pointerId)) return;
    const angle = wheelAngle(event);
    let delta = angle - S.wheel.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    S.wheel.lastAngle = angle;
    S.wheel.accumulated += delta;

    const step = 28;
    while (Math.abs(S.wheel.accumulated) >= step) {
      if (S.wheel.accumulated > 0) {
        next();
        S.wheel.accumulated -= step;
      } else {
        prev();
        S.wheel.accumulated += step;
      }
    }
    event.preventDefault();
  });

  const stopWheel = (event) => {
    if (!S.wheel.active) return;
    S.wheel.active = false;
    if (event.pointerId !== undefined) wheel.releasePointerCapture?.(event.pointerId);
  };
  wheel.addEventListener("pointerup", stopWheel);
  wheel.addEventListener("pointercancel", stopWheel);
  wheel.addEventListener("lostpointercapture", () => { S.wheel.active = false; });
}

$("add").onclick = () => {
  const input = $("url");
  if (input.value.trim()) {
    add(input.value.trim());
    input.value = "";
  }
};
$("playlist").onclick = () => alert("Playlist 匯入功能需要後端 API，目前請逐首加入 YouTube 網址。");

setInterval(() => {
  $("clock").textContent = new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
}, 1000);

render();
