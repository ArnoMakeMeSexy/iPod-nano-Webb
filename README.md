# iPod nano Web App V2

目標：在 iPhone Safari 上做成「現代版 iPod nano」體驗。

## 已整合
- iPod nano 風格 Click Wheel
- Music / Songs / Artists / Playlists / Now Playing
- YouTube 官方 IFrame Player API
- YouTube URL 加入歌曲
- 上一首 / 下一首 / 播放 / 暫停
- 歌曲刪除
- LocalStorage 音樂庫
- PWA manifest，可加入 iPhone 主畫面
- 基礎歌手 / 歌曲分類

## Playlist 與 AI
真正的一鍵匯入整個 YouTube Playlist、以及 AI 自動辨識歌手/歌曲，應透過後端處理：
YouTube Data API → 後端 → 前端
AI API → 後端 → 前端

不要把 YouTube API Key 或 AI API Key 放進 GitHub Pages 的 JS。

## GitHub Pages
Repository → Settings → Pages → Deploy from branch → main / root。

## 使用方式
1. 打開網站。
2. 貼 YouTube 影片網址。
3. 按「加入歌曲」。
4. 用 MENU 進 Songs / Artists / Playlists。
5. 點歌曲播放。
6. iPhone Safari 可加入主畫面，接近 App 體驗。

## 注意
YouTube 播放使用官方嵌入方式；不要下載或擷取 YouTube 音訊檔。
