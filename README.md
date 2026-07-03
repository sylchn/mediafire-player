# MediaFire Player & Downloader

MediaFire Player is a high-performance, bandwidth-efficient web application built to run on **Cloudflare Workers**. It allows users to stream video, audio, and images directly from MediaFire links or download files at maximum speed in their browser without waiting for manual downloads.

This project is designed with a **bandwidth-efficient architecture** to ensure minimal server resource consumption.

---

## 🚀 Features

### Frontend Client
- **Seamless Streaming**: Play MediaFire videos (`MP4`, `WebM`, `MOV`) and audio (`MP3`, `WAV`, `FLAC`) directly in the browser.
- **Custom Media Player**: A sleek, custom-built HTML5 player with advanced controls:
  - Play/Pause, Seek, and Volume controls.
  - Playback speed controls (0.5x to 2x).
  - Double-tap/arrow-keys to skip forward/backward (10s increments).
  - Fullscreen mode support (including native fullscreen on iOS Safari).
  - Audio visualizer animation.
  - Interactive video progress watermark.
- **Image Viewer**: High-performance rendering of images (`JPG`, `PNG`, `GIF`, `WebP`) without downloading them.
- **Search History**: Saves user history in local storage for quick access.
- **Aesthetic UI**: Modern, glassmorphism-inspired dark mode UI styled using Tailwind CSS.

### Backend (Cloudflare Worker)
- **Direct Link Extraction**: Automatically scrapes MediaFire pages and utilizes the official API to fetch metadata (file size, type, name) and the direct download URL.
- **CORS Bypass Proxy**: Provides a secure streaming proxy fallback endpoint for files blocked by strict CORS policies or hotlinking protection.
- **Bandwidth-Efficient Flow**: 
  - Standard playback streams media directly from MediaFire's CDN to the client (0% Worker bandwidth).
  - Only redirects/proxies through the Worker as a fallback when direct playback is restricted.
- **Security & Anti-Abuse**:
  - Validates `Origin`, `Referer`, and `Sec-Fetch-Site` headers to prevent hotlinking or unauthorized API usage.
  - Implements cryptographically signed tokens (HMAC SHA-256) and session cookies to prevent automated scraping.
- **SEO Ready**: Automatically serves `robots.txt` and `sitemap.xml`, and contains pre-configured Schema.org structured data (JSON-LD) for search engine indexing.

---

## 🛠️ Architecture

```
[User Browser]
      │
      ├─► (1) Input MediaFire Link
      │
      ├─► (2) GET /api/get?url=... ────────► [Cloudflare Worker]
      │                                             │
      │                                   Scrapes Metadata & Link
      │                                             │
      ◄─- (3) Returns Direct Link & Signed Token ◄───┘
      │
      ├─► (4) Try Direct Playback from MediaFire CDN (Free Bandwidth)
      │
      └─► (5) [Fallback Only] Stream via Worker Proxy (gated by token)
```

---

## ⚙️ Configuration & Setup

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM** (packaged with Node.js)
- **Cloudflare Account** (for deployment)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/mediafire-player.git
cd mediafire-player
npm install
```

### 2. Local Environment Configuration
Create a `.dev.vars` file in the root directory (this file is ignored by `.gitignore` to protect secrets):
```env
STREAM_TOKEN_SECRET=your_32_character_long_hexadecimal_secret_here
```
> **Note**: Generate a secure secret using `openssl rand -hex 32` or any random text generator. This key signs and validates stream fallback sessions.

### 3. Tailwind CSS Compilation
To compile and minify the Tailwind CSS assets for the frontend:
```bash
npm run build:css
```

### 4. Deployment Configurations
Open [wrangler.toml](file:///c:/Users/FERDiAN/OneDrive/Dokumen/experimen/mediafire%20final%20(github)/wrangler.toml) and configure your Cloudflare settings:
```toml
name = "mediafire-player"
main = "src/index.js"
compatibility_date = "2025-04-01"

[vars]
ENVIRONMENT = "production"

[assets]
directory = "./src/frontend"
```

---

## 🧑‍💻 Running Locally

Start the local development server using wrangler:
```bash
npm run dev
```
Open the local server URL (usually `http://localhost:8787`) in your browser.

---

## 🚀 Deploying to Cloudflare

To deploy the Worker directly to your Cloudflare account:

1. **Login to Cloudflare CLI**:
   ```bash
   npx wrangler login
   ```
2. **Add Environment Secret**:
   Configure the `STREAM_TOKEN_SECRET` environment variable in your production Worker dashboard or via wrangler CLI:
   ```bash
   npx wrangler secret put STREAM_TOKEN_SECRET
   ```
   *(Enter your secret when prompted).*

3. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## ⚖️ Disclaimer

This project is developed for educational purposes only. MediaFire is a registered trademark of MediaFire, LLC. This project is not affiliated with, authorized, maintained, sponsored, or endorsed by MediaFire, LLC or any of its affiliates. Use this tool responsibly and respect intellectual property rights.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
