const SITE_NAME = 'MediaFire Player';
const SUPPORTED_FORMATS = ['MP4', 'WebM', 'MOV', 'MP3', 'WAV', 'FLAC', 'JPG', 'PNG', 'GIF'];

function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function getHTML({ origin }) {
  const canonicalUrl = `${origin}/`;
  const ogImageUrl = `${origin}/icon/android-chrome-512x512.png`;
  const pageTitle = 'MediaFire Downloader & Player - Stream Media Online';
  const pageDescription = 'Stream MediaFire video, audio, and images online or download files directly with maximum speed. Fast, free, and secure MediaFire Downloader & Player.';
  const fontStylesheet = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        'name': SITE_NAME,
        'url': canonicalUrl,
        'description': pageDescription,
        'inLanguage': 'en',
        'publisher': {
          '@type': 'Organization',
          '@id': `${canonicalUrl}#organization`,
          'name': SITE_NAME,
          'url': canonicalUrl,
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software`,
        'name': SITE_NAME,
        'applicationCategory': 'MultimediaApplication',
        'operatingSystem': 'Web',
        'url': canonicalUrl,
        'description': pageDescription,
        'featureList': [
          'Stream MediaFire video links in the browser',
          'Play MediaFire audio links online',
          'View MediaFire image files without downloading first',
          'Protected fallback stream support',
        ],
        'fileFormat': SUPPORTED_FORMATS,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Is this MediaFire streaming service free?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, MediaFire Player is 100% free to use. There are no registration requirements, no limits, and no installation needed.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Why do some MediaFire links require a proxy fallback?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Some files on MediaFire have strict browser CORS protections or hotlinking blocks. Our player automatically detects these cases and utilizes a secure fallback stream to bypass restrictions safely.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Are my files stored on your servers?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. We do not host, re-upload, or store any files on our servers. The player streams files directly from the MediaFire CDN to your browser. Your privacy and data remain 100% secure.'
            }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  <meta name="keywords" content="mediafire downloader, MediaFire player, MediaFire video player, stream MediaFire video, MediaFire audio player, MediaFire image viewer, download MediaFire files">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="theme-color" content="#0c0c1d">
  <meta name="application-name" content="${SITE_NAME}">
  <meta name="apple-mobile-web-app-title" content="${SITE_NAME}">

  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${canonicalUrl}">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="512">
  <meta property="og:image:height" content="512">
  <meta property="og:image:alt" content="${SITE_NAME} icon">
  <meta property="og:locale" content="en_US">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDescription}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <link rel="icon" type="image/x-icon" href="/icon/favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="/icon/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/icon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/icon/android-chrome-512x512.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png">
  <link rel="manifest" href="/icon/site.webmanifest">

  <script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>
  <link rel="stylesheet" href="/tailwind.css?v=2.0.45">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${fontStylesheet}">
</head>
<body class="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-bg">
  <div id="toastContainer" class="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none" aria-live="polite"></div>

  <div id="sliderTrack" class="flex w-[200%] h-full transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform translate-x-0">
    <div id="pageLanding" class="w-1/2 h-full flex-shrink-0 flex flex-col items-center justify-center relative overflow-hidden bg-grid">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style="background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%);"></div>
      
      <div class="relative z-10 text-center px-6 w-full max-w-2xl mx-auto flex flex-col items-center">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/20 bg-accent/10 text-accent-light text-[10px] font-bold uppercase tracking-wider mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse"></span>
          MF Player v2.0
        </div>

        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Stream <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-purple-400">MediaFire</span> <br/>
          No Downloads.
        </h1>

        <p class="text-sm md:text-base text-muted-light max-w-md mx-auto mb-10 leading-relaxed">
          Stream videos, audio, and images directly from MediaFire links, or download them with maximum speed in your browser.
        </p>

        <div class="w-full max-w-xs mx-auto mb-10 relative">
          <div class="absolute -inset-1 bg-gradient-to-r from-accent to-purple-500 rounded-2xl blur opacity-30"></div>
          <div class="relative bg-bg-card border border-bg-border rounded-2xl p-4 flex items-center justify-between shadow-2xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <div class="text-left">
                <div class="w-24 h-2.5 rounded-full bg-bg-border mb-2"></div>
                <div class="w-16 h-2 rounded-full bg-bg-border/50"></div>
              </div>
            </div>
            <div class="w-6 h-6 rounded-full border-2 border-accent/40 border-t-accent animate-spin"></div>
          </div>
        </div>

        <button id="getStartedBtn" class="flex items-center gap-2 px-8 py-3.5 bg-white text-bg font-bold rounded-xl active:scale-95 transition-transform shadow-lg">
          Start Streaming
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </button>
      </div>
    </div>

    <div id="pageApp" class="w-1/2 h-full flex-shrink-0 flex flex-col relative overflow-y-auto overflow-x-hidden bg-grid">
      <div class="fixed top-[20%] left-3/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none z-0" style="background: radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 60%);"></div>
      <header class="border-b border-bg-border sticky top-0 bg-bg z-30">
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-1 sm:gap-3">
            <button id="homeBtn" class="flex items-center justify-center w-8 h-8 rounded text-muted hover:text-white hover:bg-bg-hover transition-colors mr-1 sm:hidden group" aria-label="Back">
               <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div id="logoBtn" class="flex items-center gap-2.5 cursor-pointer group">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div class="text-left">
                <span class="text-[14px] sm:text-base font-bold text-white leading-none block">MF Player</span>
                <p class="text-[10px] text-muted mt-0.5 hidden sm:block">MediaFire Streamer</p>
              </div>
            </div>
          </div>
          <button id="historyBtn" class="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] sm:text-xs text-muted hover:text-white hover:bg-bg-hover transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
        </div>
      </header>

    <main id="mainContent" class="flex-1 max-w-4xl mx-auto w-full px-4 pb-8 flex flex-col transition-all duration-500">
      <div class="my-auto w-full flex flex-col items-center pt-8">
      <div class="text-center mb-8 relative z-10">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">Stream & Download from <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-purple-400">MediaFire</span></h2>
        <p class="text-sm sm:text-base text-muted max-w-lg mx-auto">Paste a MediaFire file link, then click Play to stream or download instantly.</p>
      </div>

      <div id="playerSection" class="hidden trans trans-hidden w-full space-y-3 mb-6">
        <div class="stagger bg-bg-card border border-bg-border rounded-md p-4 pro-player-header">
          <div class="flex items-center gap-3">
            <div id="mediaTypeIcon" class="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
              <h3 id="fileName" class="text-white text-sm font-semibold truncate"></h3>
              <div class="flex items-center gap-2 mt-0.5">
                <span id="fileType" class="text-[11px] text-accent-light font-medium uppercase"></span>
                <span class="text-muted-dark text-[11px]">·</span>
                <span id="fileSize" class="text-[11px] text-muted"></span>
              </div>
            </div>
            <a id="downloadLink" href="#" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 px-2.5 py-1.5 rounded border border-bg-border text-[11px] text-muted hover:text-white hover:border-accent/30 transition-colors pro-download-btn">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </a>
          </div>
        </div>

        <div class="stagger bg-bg-card border border-bg-border rounded-md overflow-hidden pro-player-shell">
          <div id="videoPlayer" class="hidden player-container pro-video-frame">
            <div id="videoStage" class="pro-video-stage">
              <video id="videoElement" playsinline preload="metadata"></video>
              <div class="pro-watermark" id="videoPercentage" aria-hidden="true">
                <span id="watermarkDuration" class="pro-watermark-duration">0:00 / 0:00</span>
                <span id="watermarkPercent" class="pro-watermark-percent">0%</span>
              </div>
              <div id="videoLoadStatus" class="pro-load-status hidden" aria-live="polite">
                <span class="pro-load-spinner"></span>
                <span id="videoLoadText">Loading video...</span>
              </div>
              <button id="videoExitFullscreen" class="pro-exit-fullscreen hidden" type="button" aria-label="Exit fullscreen">
                <span>Exit fullscreen</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75v3.5A1.75 1.75 0 017.25 9H3.75m16.5 0h-3.5A1.75 1.75 0 0115 7.25v-3.5m0 16.5v-3.5A1.75 1.75 0 0116.75 15h3.5M3.75 15h3.5A1.75 1.75 0 019 16.75v3.5" />
                </svg>
              </button>
              <div id="videoFeedback" class="pro-video-feedback hidden" aria-live="polite"></div>
              <button id="videoCenterPlay" class="pro-center-play" type="button" aria-label="Play video">
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          </div>

          <div id="audioPlayer" class="hidden p-6 pro-audio-frame">
            <div class="flex flex-col items-center gap-5">
              <div class="flex items-end gap-1 h-12" id="audioVisualizer">
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:10px; animation-delay:0s;"></div>
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:18px; animation-delay:0.1s;"></div>
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:14px; animation-delay:0.2s;"></div>
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:22px; animation-delay:0.3s;"></div>
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:12px; animation-delay:0.4s;"></div>
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:26px; animation-delay:0.5s;"></div>
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:16px; animation-delay:0.6s;"></div>
                <div class="audio-bar animate-wave w-1.5 bg-accent-light rounded-t-sm" style="height:20px; animation-delay:0.7s;"></div>
              </div>
              <audio id="audioElement" class="sr-only" preload="metadata"></audio>
            </div>
          </div>

          <div id="customMediaControls" class="hidden pro-controls">
            <div class="pro-time-row">
              <span id="mediaCurrentTime">0:00</span>
              <div class="pro-seek">
                <div id="mediaProgressFill" class="pro-seek-fill"></div>
                <input id="mediaProgressRange" type="range" min="0" max="1000" value="0" step="1" aria-label="Playback progress">
              </div>
              <span id="mediaDuration">0:00</span>
            </div>
            <div class="pro-control-row">
              <button id="mediaPlayToggle" class="pro-control-btn pro-control-primary" type="button" aria-label="Play or pause">
                <svg id="mediaPlayIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <svg id="mediaPauseIcon" class="hidden w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
              </button>
              <button id="mediaMuteBtn" class="pro-control-btn" type="button" aria-label="Mute">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25L12 4.5v15l-5.25-3.75H3a.75.75 0 01-.75-.75v-6a.75.75 0 01.75-.75h3.75z" />
                </svg>
              </button>
              <div class="pro-volume-wrap">
                <div id="mediaVolumeFill" class="pro-volume-fill"></div>
                <input id="mediaVolumeRange" class="pro-volume" type="range" min="0" max="1" value="1" step="0.01" aria-label="Volume">
              </div>
              <div class="pro-speed-wrap ml-auto">
                <button id="mediaSpeedBtn" class="pro-speed-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
                  <span id="mediaSpeedLabel">1x</span>
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div id="mediaSpeedMenu" class="hidden pro-speed-menu" role="listbox" aria-label="Playback speed">
                  <button type="button" data-speed="0.5">0.5x</button>
                  <button type="button" data-speed="0.75">0.75x</button>
                  <button type="button" data-speed="1" class="is-active">1x</button>
                  <button type="button" data-speed="1.25">1.25x</button>
                  <button type="button" data-speed="1.5">1.5x</button>
                  <button type="button" data-speed="2">2x</button>
                </div>
              </div>
              <button id="mediaFullscreenBtn" class="pro-control-btn" type="button" aria-label="Fullscreen">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9V5.25A1.5 1.5 0 015.25 3.75H9m5.25 0h3.5A1.5 1.5 0 0120.25 5.25V9m0 5.25v3.5a1.5 1.5 0 01-1.5 1.5h-3.5m-5.25 0h-3.5a1.5 1.5 0 01-1.5-1.5v-3.5" />
                </svg>
              </button>
            </div>
          </div>

          <div id="imagePlayer" class="hidden p-4 pro-image-frame">
            <div class="flex items-center justify-center">
              <img id="imageElement" src="" alt="" class="max-w-full max-h-[65vh] object-contain rounded">
            </div>
          </div>

          <div id="unsupportedPlayer" class="hidden p-8 text-center">
            <div class="w-12 h-12 rounded-md bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p class="text-white text-sm font-semibold mb-1">Format Not Supported</p>
            <p class="text-muted text-xs mb-4">Your browser cannot play this file.</p>
            <a id="unsupportedDownload" href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-xs font-medium rounded hover:bg-accent-dim transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>

      <section id="inputSection" class="relative z-10 w-full mb-6">
        <div class="bg-bg-card border border-bg-border rounded-md p-2.5 shadow-lg relative z-10">
          <label for="urlInput" class="sr-only">MediaFire URL</label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input 
              type="url" 
              id="urlInput" 
              placeholder="https://www.mediafire.com/file/xxxxx/nama_file.mp4/file"
              class="flex-1 px-4 py-3 bg-bg-input border border-bg-border rounded text-white text-sm placeholder-muted outline-none focus:border-accent/50 transition-colors font-medium"
              autocomplete="off"
              spellcheck="false"
            >
            <button 
              id="playBtn"
              class="flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dim text-white text-sm font-bold rounded transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Play
            </button>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted">
          <span class="flex items-center gap-1.5">
            <span class="step-num bg-accent/20 text-accent-light">1</span>
            Paste MediaFire Link
          </span>
          <svg class="w-3 h-3 text-muted-dark hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span class="flex items-center gap-1.5">
            <span class="step-num bg-accent/20 text-accent-light">2</span>
            Click Play
          </span>
          <svg class="w-3 h-3 text-muted-dark hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span class="flex items-center gap-1.5">
            <span class="step-num bg-accent/20 text-accent-light">3</span>
            Stream instantly!
          </span>
        </div>
      </section>

      <div id="loadingState" class="hidden trans trans-hidden mb-6">
        <div class="bg-bg-card border border-bg-border rounded-md p-8 text-center">
          <div class="spinner mx-auto mb-3"></div>
          <p class="text-white text-sm font-medium" id="loadingText">Extracting MediaFire link...</p>
          <p class="text-muted text-xs mt-1">Scraping MediaFire page</p>
        </div>
      </div>

      <div id="errorState" class="hidden trans trans-hidden mb-6">
        <div class="bg-bg-card border border-red-500/20 rounded-md p-5">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p class="text-red-300 text-sm font-semibold">Failed to Load</p>
              <p class="text-red-400/70 text-sm mt-1" id="errorMessage"></p>
            </div>
          </div>
        </div>
      </div>

      <div id="featuresSection" class="trans trans-visible w-full mt-2 relative z-10">
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-bg-card border border-bg-border rounded-md p-4 text-center">
            <div class="w-9 h-9 rounded bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <svg class="w-4.5 h-4.5 text-blue-400 p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </div>
            <p class="text-white text-xs font-semibold">Video</p>
            <p class="text-muted text-[10px] mt-0.5 font-medium">MP4, WebM, MOV</p>
          </div>
          <div class="bg-bg-card border border-bg-border rounded-md p-4 text-center">
            <div class="w-9 h-9 rounded bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <svg class="w-4.5 h-4.5 text-purple-400 p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 0019.5 12.553V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
            </div>
            <p class="text-white text-xs font-semibold">Audio</p>
            <p class="text-muted text-[10px] mt-0.5 font-medium">MP3, WAV, FLAC</p>
          </div>
          <div class="bg-bg-card border border-bg-border rounded-md p-4 text-center">
            <div class="w-9 h-9 rounded bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <svg class="w-4.5 h-4.5 text-emerald-400 p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p class="text-white text-xs font-semibold">Images</p>
            <p class="text-muted text-[10px] mt-0.5 font-medium">JPG, PNG, GIF</p>
          </div>
        </div>
      </div>

      </div>
      <div id="seoSection" class="trans trans-visible w-full mt-6 bg-bg-card border border-bg-border rounded-md p-5 sm:p-6 relative z-10 text-left shadow-lg">
        <h2 class="text-base sm:text-lg font-bold text-white mb-3 tracking-tight">
          Stream & Download with <span class="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-purple-400">MediaFire Downloader & Player</span>
        </h2>
        <p class="text-[11px] sm:text-xs text-muted-light leading-relaxed mb-6">
          MediaFire is a great file hosting service, but downloading large video or audio files can take a lot of time and local storage. With our <strong>MediaFire Downloader & Player</strong>, you can play MediaFire MP4 videos, MP3 music, and view images instantly in your browser without waiting for downloads to finish. Additionally, it serves as a fast <strong>MediaFire downloader</strong>, allowing you to generate direct download links and download files with maximum speed.
        </p>

        <h3 class="text-xs sm:text-sm font-bold text-white mb-3 flex items-center gap-2 border-t border-bg-border/30 pt-4">
          <svg class="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-3.75 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          Frequently Asked Questions
        </h3>
        
        <div class="space-y-2.5" id="faqAccordion">
          
          <div class="faq-item group bg-bg-input border border-bg-border/60 rounded overflow-hidden transition-all duration-300 hover:border-accent/30 hover:bg-bg-hover/10">
            <h4 class="m-0 p-0 text-inherit font-inherit">
              <button id="faqBtn1" aria-controls="faqAns1" class="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[11px] sm:text-xs text-white transition-colors" aria-expanded="false">
                <span>Is this MediaFire streaming service free?</span>
                <svg class="w-3 h-3 text-muted transition-transform duration-300 group-[.is-open]:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
              </button>
            </h4>
            <div id="faqAns1" role="region" aria-labelledby="faqBtn1" class="faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="p-3.5 pt-0 text-[10px] sm:text-[11px] leading-relaxed text-muted-light border-t border-bg-border/20 mt-1">
                Yes, MediaFire Player is 100% free to use. There are no registration requirements, no limits, and no installation needed.
              </div>
            </div>
          </div>

          <div class="faq-item group bg-bg-input border border-bg-border/60 rounded overflow-hidden transition-all duration-300 hover:border-accent/30 hover:bg-bg-hover/10">
            <h4 class="m-0 p-0 text-inherit font-inherit">
              <button id="faqBtn2" aria-controls="faqAns2" class="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[11px] sm:text-xs text-white transition-colors" aria-expanded="false">
                <span>Why do some MediaFire links require a proxy fallback?</span>
                <svg class="w-3 h-3 text-muted transition-transform duration-300 group-[.is-open]:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
              </button>
            </h4>
            <div id="faqAns2" role="region" aria-labelledby="faqBtn2" class="faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="p-3.5 pt-0 text-[10px] sm:text-[11px] leading-relaxed text-muted-light border-t border-bg-border/20 mt-1">
                Some files on MediaFire have strict browser CORS protections or hotlinking blocks. Our player automatically detects these cases and utilizes a secure fallback stream to bypass restrictions safely.
              </div>
            </div>
          </div>

          <div class="faq-item group bg-bg-input border border-bg-border/60 rounded overflow-hidden transition-all duration-300 hover:border-accent/30 hover:bg-bg-hover/10">
            <h4 class="m-0 p-0 text-inherit font-inherit">
              <button id="faqBtn3" aria-controls="faqAns3" class="w-full flex items-center justify-between p-3.5 text-left font-semibold text-[11px] sm:text-xs text-white transition-colors" aria-expanded="false">
                <span>Are my files stored on your servers?</span>
                <svg class="w-3 h-3 text-muted transition-transform duration-300 group-[.is-open]:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
              </button>
            </h4>
            <div id="faqAns3" role="region" aria-labelledby="faqBtn3" class="faq-answer max-h-0 overflow-hidden transition-all duration-300 ease-in-out">
              <div class="p-3.5 pt-0 text-[10px] sm:text-[11px] leading-relaxed text-muted-light border-t border-bg-border/20 mt-1">
                No. We do not host, re-upload, or store any files on our servers. The player streams files directly from the MediaFire CDN to your browser. Your privacy and data remain 100% secure.
              </div>
            </div>
          </div>

        </div>
      </div>

    </main>

    <footer class="border-t border-bg-border py-4 text-center mt-auto">
      <p class="text-muted-dark px-3 text-[11px] leading-relaxed">
        Copyright &copy; ${new Date().getFullYear()} <a href="https://sylica.eu.org" target="_blank" rel="noopener noreferrer" class="hover:text-accent-light transition-colors font-medium">SyLica</a>. All media files are hosted by third-party providers.
      </p>
    </footer>
    </div>
  </div>

  <div id="historyPanel" class="fixed inset-0 z-40 hidden">
    <div id="historyOverlay" class="absolute inset-0 bg-black/50 transition-opacity duration-200 opacity-0"></div>
    <div id="historyDrawer" class="absolute right-0 top-0 h-full w-full max-w-sm bg-bg border-l border-bg-border transform translate-x-full transition-transform duration-200">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between px-4 py-3 border-b border-bg-border">
          <h2 class="text-white font-bold text-sm">History</h2>
          <button id="closeHistory" class="w-7 h-7 rounded-sm bg-bg-card flex items-center justify-center text-muted hover:text-white transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div id="historyList" class="flex-1 overflow-y-auto p-3 space-y-1.5"></div>
        <div class="px-3 py-3 border-t border-bg-border">
          <button id="clearHistory" class="w-full py-2 rounded bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/15 transition-colors">
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>

  <script src="/app.js?v=2.0.45" defer></script>
</body>
</html>`;
}
