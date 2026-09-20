const S={songs:JSON.parse(localStorage.getItem("nanoSongs")||"[]"),i:0,playing:false,view:"home",player:null,ready:false};
const $=x=>document.getElementById(x);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function save(){localStorage.setItem("nanoSongs",JSON.stringify(S.songs))}
function vid(url){try{let u=new URL(url);if(u.hostname.includes("youtu.be"))return u.pathname.slice(1).split("/")[0];return u.searchParams.get("v")}catch{return null}}
function classify(t){let x=(t||"").replace(/\[[^\]]*\]/g," ").replace(/\([^)]*(official|audio|video|lyrics?|mv|music)[^)]*\)/ig," ").replace(/\s+/g," ").trim(),p=x.split(/\s[-–—|｜]\s/);return p.length>1?{artist:p[0],name:p.slice(1).join(" - ")}:{artist:"Unknown Artist",name:x||"Unknown Song"}}
function add(url,title){let id=vid(url);if(!id)return alert("請輸入有效 YouTube 影片網址");let c=classify(title);S.songs.push({id,url,title:title||c.name,name:c.name,artist:c.artist});S.i=S.songs.length-1;save();render()}
function ytReady(){S.ready=true}
window.onYouTubeIframeAPIReady=ytReady;
function loadPlayer(id){if(!S.ready)return; if(!S.player){S.player=new YT.Player("yt",{height:"1",width:"1",videoId:id,playerVars:{playsinline:1,controls:0,rel:0,modestbranding:1},events:{onStateChange:e=>{if(e.data===1){S.playing=true;render()} if(e.data===0){next()}}}})}else S.player.loadVideoById(id)}
function play(i=S.i){if(!S.songs.length)return;S.i=i;S.playing=true;loadPlayer(S.songs[i].id);render()}
function toggle(){if(!S.songs.length)return;if(!S.player){play();return}if(S.playing){S.player.pauseVideo();S.playing=false}else{S.player.playVideo();S.playing=true}render()}
function next(){if(!S.songs.length)return;S.i=(S.i+1)%S.songs.length;play()}
function prev(){if(!S.songs.length)return;S.i=(S.i-1+S.songs.length)%S.songs.length;play()}
function remove(i){S.songs.splice(i,1);if(S.i>=S.songs.length)S.i=Math.max(0,S.songs.length-1);save();render()}
function home(){S.view="home";render()}
function list(type){S.view=type;render()}
function artists(){return [...new Set(S.songs.map(x=>x.artist))]}
function render(){
 let s=S.songs[S.i],html="";
 $("count").textContent=`${S.songs.length} 首`;
 if(S.view==="home")html=`<div class="hero"><div class="cover">♪</div><b>${s?esc(s.name):"Music"}</b><small>${s?esc(s.artist):"請加入歌曲"}</small><p>${S.playing?"▶ 播放中":"Ⅱ 暫停"}</p></div>`;
 if(S.view==="menu")html=`<ul class="list"><li onclick="list('songs')">Songs <span>›</span></li><li onclick="list('artists')">Artists <span>›</span></li><li onclick="list('playlists')">Playlists <span>›</span></li><li onclick="list('now')">Now Playing <span>›</span></li></ul>`;
 if(S.view==="songs")html=`<div class="library">${S.songs.length?S.songs.map((x,i)=>`<div class="song"><div class="meta" onclick="play(${i})"><b>${esc(x.name)}</b><small>${esc(x.artist)}</small></div><button onclick="play(${i})">▶</button><button class="del" onclick="remove(${i})">刪</button></div>`).join(""):"<div class='hero'>沒有歌曲</div>"}</div>`;
 if(S.view==="artists")html=`<ul class="list">${artists().map(a=>`<li>${esc(a)} <span>${S.songs.filter(x=>x.artist===a).length}</span></li>`).join("")||"<li>沒有歌手</li>"}</ul>`;
 if(S.view==="playlists")html=`<ul class="list"><li>All Songs <span>${S.songs.length}</span></li><li>Favorites <span>0</span></li></ul>`;
 if(S.view==="now")html=s?`<div class="now"><div class="cover">♪</div><b>${esc(s.name)}</b><small>${esc(s.artist)}</small><div class="progress"><i style="width:${S.player&&S.player.getDuration?((S.player.getCurrentTime()/S.player.getDuration())*100||0):0}%"></i></div></div>`:`<div class="hero">沒有正在播放</div>`;
 $("screen").innerHTML=html;$("title").textContent=S.view==="home"?(s?.name||"Music"):S.view[0].toUpperCase()+S.view.slice(1);$("mini").textContent=s?`${s.artist} — ${s.name}`:"未播放";
}
$("menu").onclick=()=>S.view==="menu"?home():list("menu");$("select").onclick=()=>{if(S.view==="home")toggle()};$("play").onclick=toggle;$("next").onclick=next;$("prev").onclick=prev;
$("add").onclick=()=>{let u=$("url").value.trim();if(u){add(u);$("url").value=""}};
$("playlist").onclick=()=>{let u=prompt("貼上 YouTube Playlist URL：");if(!u)return;try{let x=new URL(u);if(!x.searchParams.get("list"))throw 0;window.open(u,"_blank","noopener");alert("V2 已預留 Playlist 匯入流程。要做到整份自動加入，需要接 YouTube Data API 後端；下一步可直接加上 Cloudflare Worker。")}catch{alert("不是有效的 Playlist URL")}};
setInterval(()=>{$("clock").textContent=new Date().toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"});if(S.view==="now")render()},1000);render();