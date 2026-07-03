let currentData = null;

const $ = id => document.getElementById(id);
const urlInput = $('urlInput');
const playBtn = $('playBtn');
const loadingState = $('loadingState');
const loadingText = $('loadingText');
const errorState = $('errorState');
const errorMessage = $('errorMessage');
const playerSection = $('playerSection');
const featuresSection = $('featuresSection');

const videoPlayer = $('videoPlayer');
const audioPlayer = $('audioPlayer');
const imagePlayer = $('imagePlayer');
const unsupportedPlayer = $('unsupportedPlayer');
const videoElement = $('videoElement');
const audioElement = $('audioElement');
const imageElement = $('imageElement');
const videoStage = $('videoStage');
const videoCenterPlay = $('videoCenterPlay');
const videoFeedback = $('videoFeedback');
const videoLoadStatus = $('videoLoadStatus');
const videoLoadText = $('videoLoadText');
const videoExitFullscreen = $('videoExitFullscreen');
const customMediaControls = $('customMediaControls');
const mediaPlayToggle = $('mediaPlayToggle');
const mediaPlayIcon = $('mediaPlayIcon');
const mediaPauseIcon = $('mediaPauseIcon');
const mediaProgressFill = $('mediaProgressFill');
const mediaProgressRange = $('mediaProgressRange');
const mediaCurrentTime = $('mediaCurrentTime');
const mediaDuration = $('mediaDuration');
const mediaMuteBtn = $('mediaMuteBtn');
const mediaVolumeRange = $('mediaVolumeRange');
const mediaVolumeFill = $('mediaVolumeFill');
const mediaSpeedBtn = $('mediaSpeedBtn');
const mediaSpeedLabel = $('mediaSpeedLabel');
const mediaSpeedMenu = $('mediaSpeedMenu');
const mediaFullscreenBtn = $('mediaFullscreenBtn');

const fileNameEl = $('fileName');
const fileTypeEl = $('fileType');
const fileSizeEl = $('fileSize');
const mediaTypeIcon = $('mediaTypeIcon');
const downloadLink = $('downloadLink');
const unsupportedDownload = $('unsupportedDownload');

const historyBtn = $('historyBtn');
const historyPanel = $('historyPanel');
const historyOverlay = $('historyOverlay');
const historyDrawer = $('historyDrawer');
const closeHistory = $('closeHistory');
const historyList = $('historyList');
const clearHistoryBtn = $('clearHistory');
const audioVisualizer = $('audioVisualizer');
let activeMediaElement = null;
let videoFeedbackTimer = null;
let fullscreenUiTimer = null;
let fullscreenExitTransitionTimer = null;
let cursorHideTimer = null;
const audioBars = [...audioVisualizer.querySelectorAll('.audio-bar')];
const speedButtons = [...mediaSpeedMenu.querySelectorAll('button')];
const historyDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const historyTimeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' });
const MEDIA_ICONS = {
  video: { bg: 'bg-blue-500/10', svg: '<svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' },
  audio: { bg: 'bg-purple-500/10', svg: '<svg class="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303" /></svg>' },
  image: { bg: 'bg-emerald-500/10', svg: '<svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75" /></svg>' },
  unknown: { bg: 'bg-amber-500/10', svg: '<svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75" /></svg>' },
};

async function getProtectedProxyUrl(directLink) {
  const res = await fetch('/api/fallback?url=' + encodeURIComponent(directLink), {
    credentials: 'same-origin',
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok || !json.success || !json.data?.proxyUrl) {
    throw new Error(json.error || 'Protected fallback is unavailable');
  }

  return json.data.proxyUrl;
}

function showToast(msg, type = 'info') {
  const c = $('toastContainer');
  const cls = { info: 'border-accent/30 text-accent-light', success: 'border-emerald-500/30 text-emerald-300', error: 'border-red-500/30 text-red-300' };
  const el = document.createElement('div');
  el.className = 'toast-enter flex items-center gap-2 px-3 py-2.5 rounded bg-bg-card border text-xs font-medium ' + (cls[type] || cls.info);
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s';
    setTimeout(() => el.remove(), 200);
  }, 3500);
}

const stateTimeouts = new Map();

function showState(state) {
  const hide = (el, id) => {
    if (!el.classList.contains('hidden')) {
      el.classList.remove('trans-visible');
      el.classList.add('trans-hidden');
      const tid = setTimeout(() => el.classList.add('hidden'), 300);
      stateTimeouts.set(id, tid);
    }
  };

  const show = (el, id) => {
    if (stateTimeouts.has(id)) {
      clearTimeout(stateTimeouts.get(id));
      stateTimeouts.delete(id);
    }
    el.classList.remove('hidden');
    requestAnimationFrame(() => {
      el.classList.remove('trans-hidden');
      el.classList.add('trans-visible');
    });
  };

  if (state !== 'loading') hide(loadingState, 'loading');
  if (state !== 'error') hide(errorState, 'error');
  if (state !== 'player') hide(playerSection, 'player');

  if (state === 'loading' || state === 'player') {
    hide(featuresSection, 'features');
  } else {
    show(featuresSection, 'features');
  }

  if (state === 'loading') show(loadingState, 'loading');
  else if (state === 'error') show(errorState, 'error');
  else if (state === 'player') show(playerSection, 'player');
}

function getMediaIcon(type) {
  return MEDIA_ICONS[type] || MEDIA_ICONS.unknown;
}

function resetPlayers() {
  [videoPlayer, audioPlayer, imagePlayer, unsupportedPlayer].forEach(p => p.classList.add('hidden'));
  videoElement.pause();
  videoElement.removeAttribute('src');
  audioElement.pause();
  audioElement.removeAttribute('src');
  imageElement.removeAttribute('src');
  setActiveMedia(null);
}

function formatMediaTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

function updateControlState() {
  const media = activeMediaElement;
  if (!media) return;

  const duration = Number.isFinite(media.duration) ? media.duration : 0;
  const current = Number.isFinite(media.currentTime) ? media.currentTime : 0;
  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  mediaCurrentTime.textContent = formatMediaTime(current);
  mediaDuration.textContent = formatMediaTime(duration);
  mediaProgressRange.value = String(Math.round(progress * 10));
  mediaProgressFill.style.width = `${progress}%`;

  if (media === videoElement) {
    const watermarkDuration = $('watermarkDuration');
    const watermarkPercent = $('watermarkPercent');
    if (watermarkDuration) {
      watermarkDuration.textContent = `${formatMediaTime(current)} / ${formatMediaTime(duration)}`;
    }
    if (watermarkPercent) {
      watermarkPercent.textContent = `${Math.round(progress)}%`;
    }
  }

  mediaPlayIcon.classList.toggle('hidden', !media.paused);
  mediaPauseIcon.classList.toggle('hidden', media.paused);
  mediaPlayToggle.classList.toggle('is-playing', !media.paused);
  videoCenterPlay.classList.toggle('hidden', !media.paused || media !== videoElement);
  mediaMuteBtn.classList.toggle('is-muted', media.muted || media.volume === 0);
  mediaVolumeRange.value = String(media.muted ? 0 : media.volume);
  mediaVolumeFill.style.width = `${Number(mediaVolumeRange.value) * 100}%`;
  mediaSpeedLabel.textContent = `${Number(media.playbackRate).toLocaleString('en-US', { maximumFractionDigits: 2 })}x`;
  speedButtons.forEach(btn => {
    btn.classList.toggle('is-active', Number(btn.dataset.speed) === media.playbackRate);
  });
}

function setActiveMedia(media) {
  activeMediaElement = media;
  customMediaControls.classList.toggle('hidden', !media);
  mediaFullscreenBtn.classList.toggle('hidden', media !== videoElement);

  if (media) {
    updateControlState();
  } else {
    mediaCurrentTime.textContent = '0:00';
    mediaDuration.textContent = '0:00';
    mediaProgressRange.value = '0';
    mediaProgressFill.style.width = '0%';
    const watermarkDuration = $('watermarkDuration');
    const watermarkPercent = $('watermarkPercent');
    if (watermarkDuration) watermarkDuration.textContent = '0:00 / 0:00';
    if (watermarkPercent) watermarkPercent.textContent = '0%';
    mediaVolumeRange.value = '1';
    mediaVolumeFill.style.width = '100%';
    mediaSpeedLabel.textContent = '1x';
    mediaSpeedMenu.classList.add('hidden');
    mediaSpeedBtn.setAttribute('aria-expanded', 'false');
    mediaPlayIcon.classList.remove('hidden');
    mediaPauseIcon.classList.add('hidden');
    mediaPlayToggle.classList.remove('is-playing');
    videoCenterPlay.classList.add('hidden');
    hideVideoLoadStatus();
  }
}

function toggleActivePlayback() {
  const media = activeMediaElement;
  if (!media) return;

  if (media.paused) {
    media.play().catch(err => showToast(err.message || 'Playback failed', 'error'));
  } else {
    media.pause();
  }
}

function toggleSpeedMenu(show) {
  const shouldShow = typeof show === 'boolean' ? show : mediaSpeedMenu.classList.contains('hidden');
  mediaSpeedMenu.classList.toggle('hidden', !shouldShow);
  mediaSpeedBtn.setAttribute('aria-expanded', String(shouldShow));
}

function showVideoFeedback(label, value, position = 'center') {
  if (activeMediaElement !== videoElement) return;

  videoFeedback.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  videoFeedback.classList.remove('hidden', 'is-leaving', 'is-forward', 'is-rewind', 'is-volume');
  videoFeedback.classList.add(`is-${position}`);
  videoFeedback.classList.add('is-visible');

  if (videoFeedbackTimer) clearTimeout(videoFeedbackTimer);
  videoFeedbackTimer = setTimeout(() => {
    videoFeedback.classList.add('is-leaving');
    videoFeedback.classList.remove('is-visible');
    videoFeedbackTimer = setTimeout(() => videoFeedback.classList.add('hidden'), 180);
  }, 850);
}

function setVideoLoadStatus(message, type = 'loading') {
  if (!videoLoadStatus || activeMediaElement !== videoElement) return;

  videoLoadText.textContent = message;
  videoLoadStatus.classList.remove('hidden', 'is-error', 'is-ready');
  videoLoadStatus.classList.toggle('is-error', type === 'error');
  videoLoadStatus.classList.toggle('is-ready', type === 'ready');

  if (type === 'ready') {
    setTimeout(() => {
      if (videoLoadStatus.classList.contains('is-ready')) {
        videoLoadStatus.classList.add('hidden');
      }
    }, 900);
  }
}

function hideVideoLoadStatus() {
  if (videoLoadStatus) videoLoadStatus.classList.add('hidden');
}

function updateFullscreenUi() {
  const isVideoFullscreen = document.fullscreenElement === videoStage;
  videoStage.classList.toggle('is-fullscreen', isVideoFullscreen);

  if (isVideoFullscreen) {
    // Force inline styles so videoStage and video fill the viewport transparently
    videoStage.style.background = 'transparent';
    
    // Force inline styles so video fills the fullscreen viewport exactly like native HTML5
    // object-fit: contain ensures aspect ratio is preserved (letterbox, no crop)
    Object.assign(videoElement.style, {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      margin: '0',
      padding: '0',
      border: 'none',
      boxSizing: 'border-box',
      background: 'transparent',
    });

    showFullscreenExitControl();
    showVideoFeedback('Fullscreen', 'Press Esc or tap Exit', 'forward');

    // Lock screen orientation to match video orientation on mobile devices
    if (screen.orientation && screen.orientation.lock) {
      const isLandscape = videoElement.videoWidth > videoElement.videoHeight;
      screen.orientation.lock(isLandscape ? 'landscape' : 'portrait').catch(err => {
        console.warn('Screen orientation lock failed:', err);
      });
    }
  } else {
    // Restore normal styles
    videoStage.classList.remove('no-cursor');
    if (cursorHideTimer) {
      clearTimeout(cursorHideTimer);
      cursorHideTimer = null;
    }
    videoStage.style.background = '';
    
    // Clear inline overrides so normal-mode CSS takes over again
    Object.assign(videoElement.style, {
      width: '',
      height: '',
      maxWidth: '',
      maxHeight: '',
      objectFit: '',
      margin: '',
      padding: '',
      border: '',
      boxSizing: '',
      background: '',
    });

    hideFullscreenExitControl(true);
    if (fullscreenUiTimer) clearTimeout(fullscreenUiTimer);

    // Unlock screen orientation when leaving fullscreen
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  }
}

function showFullscreenExitControl() {
  if (document.fullscreenElement !== videoStage) return;

  videoStage.classList.remove('no-cursor');

  if (cursorHideTimer) clearTimeout(cursorHideTimer);
  cursorHideTimer = setTimeout(() => {
    if (document.fullscreenElement === videoStage && !videoElement.paused) {
      videoStage.classList.add('no-cursor');
    }
  }, 3000);

  if (fullscreenExitTransitionTimer) clearTimeout(fullscreenExitTransitionTimer);
  videoStage.classList.add('is-showing-exit');
  if (fullscreenUiTimer) clearTimeout(fullscreenUiTimer);
  fullscreenUiTimer = setTimeout(() => hideFullscreenExitControl(), 1200);
}

function hideFullscreenExitControl(immediate = false) {
  if (fullscreenExitTransitionTimer) clearTimeout(fullscreenExitTransitionTimer);

  videoStage.classList.remove('is-showing-exit');
}

function seekActiveMedia(offsetSeconds) {
  performDoubleTapSkip(offsetSeconds > 0);
}

function adjustActiveVolume(delta) {
  const media = activeMediaElement;
  if (!media) return;

  const nextVolume = Math.min(1, Math.max(0, media.volume + delta));
  media.volume = nextVolume;
  media.muted = nextVolume === 0;
  updateControlState();
  showVideoFeedback('Volume', `${Math.round((media.muted ? 0 : media.volume) * 100)}%`, 'volume');
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

function displayMedia(data) {
  currentData = data;
  resetPlayers();

  fileNameEl.textContent = data.fileName;
  fileTypeEl.textContent = data.extension.toUpperCase();
  fileSizeEl.textContent = data.fileSize;
  downloadLink.href = data.directLink;
  unsupportedDownload.href = data.directLink;

  const icon = getMediaIcon(data.mediaType);
  mediaTypeIcon.className = 'w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ' + icon.bg;
  mediaTypeIcon.innerHTML = icon.svg;

  async function ensureProxyUrl() {
    if (!data.proxyUrl) {
      data.proxyUrl = await getProtectedProxyUrl(data.directLink);
    }

    return data.proxyUrl;
  }

  function withFallback(el) {
    let tried = false;
    el.onerror = async () => {
      if (!tried) {
        tried = true;
        try {
          showToast('Requesting protected proxy...', 'info');
          if (el === videoElement) setVideoLoadStatus('Trying protected stream...');
          if (el === videoElement) el.dataset.streamState = 'fallback';
          el.src = await ensureProxyUrl();
          el.load();
        } catch (err) {
          if (el === videoElement) {
            el.dataset.streamState = 'failed';
            setVideoLoadStatus('Video failed to load', 'error');
          }
          showToast(err.message, 'error');
        }
      } else if (el === videoElement) {
        el.dataset.streamState = 'failed';
        setVideoLoadStatus('Video failed to load', 'error');
      }
    };
    if (el === videoElement) {
      el.dataset.streamState = 'primary';
      setVideoLoadStatus('Loading video...');
    }
    el.src = data.streamUrl;
    el.playbackRate = 1;
    el.load();
  }

  switch (data.mediaType) {
    case 'video':
      videoPlayer.classList.remove('hidden');
      withFallback(videoElement);
      setActiveMedia(videoElement);
      break;
    case 'audio':
      audioPlayer.classList.remove('hidden');
      withFallback(audioElement);
      setActiveMedia(audioElement);
      audioElement.onplay = () => audioBars.forEach(b => b.style.animationPlayState = 'running');
      audioElement.onpause = () => audioBars.forEach(b => b.style.animationPlayState = 'paused');
      audioBars.forEach(b => b.style.animationPlayState = 'paused');
      break;
    case 'image':
      imagePlayer.classList.remove('hidden');
      imageElement.onerror = async () => {
        if (imageElement.src !== data.proxyUrl) {
          try {
            showToast('Requesting protected proxy...', 'info');
            imageElement.src = await ensureProxyUrl();
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      };
      imageElement.src = data.streamUrl;
      imageElement.alt = data.fileName;
      break;
    default:
      unsupportedPlayer.classList.remove('hidden');
  }

  showState('player');
}

async function playMedia() {
  const url = urlInput.value.trim();
  if (!url) {
    showToast('Enter a MediaFire link', 'error');
    urlInput.focus();
    return;
  }
  if (!url.includes('mediafire.com')) {
    showToast('Link must be from mediafire.com', 'error');
    return;
  }

  playBtn.disabled = true;
  showState('loading');

  try {
    const res = await fetch('/api/get?url=' + encodeURIComponent(url));
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch data');
    saveHistory(url, json.data);
    displayMedia(json.data);
    showToast('Media loaded successfully!', 'success');
  } catch (err) {
    errorMessage.textContent = err.message;
    showState('error');
    showToast(err.message, 'error');
  } finally {
    playBtn.disabled = false;
  }
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('mfp_history') || '[]');
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function saveHistory(url, data) {
  const h = getHistory().filter(x => x.url !== url);
  h.unshift({ url, fileName: data.fileName, mediaType: data.mediaType, extension: data.extension, fileSize: data.fileSize, ts: Date.now() });
  localStorage.setItem('mfp_history', JSON.stringify(h.slice(0, 20)));
}

function renderHistory() {
  const h = getHistory();
  if (!h.length) {
    historyList.innerHTML = '<p class="text-center text-muted text-xs py-8">No history available</p>';
    return;
  }
  historyList.innerHTML = h.map(item => {
    const ic = getMediaIcon(item.mediaType);
    const d = new Date(item.ts);
    const t = `${historyDateFormatter.format(d)}, ${historyTimeFormatter.format(d)}`;
    return `<button class="w-full flex items-center gap-2.5 p-2.5 rounded border border-bg-border hover:bg-bg-hover text-left transition-colors" data-url="${escapeAttribute(item.url)}">
      <div class="w-7 h-7 rounded-sm ${ic.bg} flex items-center justify-center flex-shrink-0">${ic.svg}</div>
      <div class="flex-1 min-w-0">
        <p class="text-white text-xs font-medium truncate">${escapeHtml(item.fileName)}</p>
        <p class="text-muted text-[10px] mt-0.5">${escapeHtml(item.extension).toUpperCase()} &middot; ${escapeHtml(item.fileSize)} &middot; ${escapeHtml(t)}</p>
      </div>
    </button>`;
  }).join('');
  historyList.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    urlInput.value = b.dataset.url;
    toggleHistory(false);
    playMedia();
  }));
}

function toggleHistory(show) {
  if (show) {
    renderHistory();
    historyPanel.classList.remove('hidden');
    requestAnimationFrame(() => {
      historyOverlay.style.opacity = '1';
      historyDrawer.style.transform = 'translateX(0)';
    });
  } else {
    historyOverlay.style.opacity = '0';
    historyDrawer.style.transform = 'translateX(100%)';
    setTimeout(() => historyPanel.classList.add('hidden'), 200);
  }
}

const sliderTrack = $('sliderTrack');
const getStartedBtn = $('getStartedBtn');
const homeBtn = $('homeBtn');
const logoBtn = $('logoBtn');

function goToApp() {
  requestAnimationFrame(() => {
    sliderTrack.style.transform = 'translateX(-50%)';
    setTimeout(() => urlInput.focus(), 800);
  });
}

function goToHome() {
  requestAnimationFrame(() => {
    sliderTrack.style.transform = 'translateX(0)';
  });
}

getStartedBtn.addEventListener('click', goToApp);
if (homeBtn) homeBtn.addEventListener('click', goToHome);
if (logoBtn) logoBtn.addEventListener('click', goToHome);

playBtn.addEventListener('click', playMedia);
urlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') playMedia();
});
urlInput.addEventListener('paste', () => setTimeout(() => {
  if (urlInput.value.includes('mediafire.com')) playMedia();
}, 100));
historyBtn.addEventListener('click', () => toggleHistory(true));
closeHistory.addEventListener('click', () => toggleHistory(false));
historyOverlay.addEventListener('click', () => toggleHistory(false));
clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem('mfp_history');
  renderHistory();
  showToast('History cleared', 'info');
});

[videoElement, audioElement].forEach(media => {
  ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'volumechange', 'emptied'].forEach(eventName => {
    media.addEventListener(eventName, () => {
      if (activeMediaElement === media) updateControlState();
    });
  });
});

videoElement.addEventListener('loadstart', () => setVideoLoadStatus('Loading video...'));
videoElement.addEventListener('loadedmetadata', () => {
  setVideoLoadStatus('Metadata loaded', 'ready');
  if (document.fullscreenElement === videoStage && screen.orientation && screen.orientation.lock) {
    const isLandscape = videoElement.videoWidth > videoElement.videoHeight;
    screen.orientation.lock(isLandscape ? 'landscape' : 'portrait').catch(err => {
      console.warn('Screen orientation lock failed on metadata load:', err);
    });
  }
});
videoElement.addEventListener('canplay', () => setVideoLoadStatus('Ready to play', 'ready'));
videoElement.addEventListener('waiting', () => setVideoLoadStatus('Buffering video...'));
videoElement.addEventListener('stalled', () => setVideoLoadStatus('Connection is slow...'));
videoElement.addEventListener('playing', hideVideoLoadStatus);
videoElement.addEventListener('error', () => {
  if (videoElement.dataset.streamState === 'failed') {
    setVideoLoadStatus('Video failed to load', 'error');
  } else {
    setVideoLoadStatus('Checking fallback stream...');
  }
});

mediaPlayToggle.addEventListener('click', toggleActivePlayback);
videoCenterPlay.addEventListener('click', toggleActivePlayback);

let videoClickTimeout = null;
let videoLastTapTime = 0;
let skipAccumulator = 0;
let skipAccumulatorTimer = null;
let lastSkipDirection = null;

function resetSkipSession() {
  skipAccumulator = 0;
  lastSkipDirection = null;
  if (skipAccumulatorTimer) {
    clearTimeout(skipAccumulatorTimer);
    skipAccumulatorTimer = null;
  }
}

function formatAccumulatorTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const h = Math.floor(seconds / 3600);
  const rem = seconds % 3600;
  const m = Math.floor(rem / 60);
  const s = rem % 60;
  
  if (h > 0) {
    let parts = [`${h}h`];
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);
    return parts.join(' ');
  }
  
  let parts = [`${m}m`];
  if (s > 0) parts.push(`${s}s`);
  return parts.join(' ');
}

function performDoubleTapSkip(isRightHalf) {
  const direction = isRightHalf ? 'forward' : 'rewind';
  
  if (skipAccumulatorTimer) {
    clearTimeout(skipAccumulatorTimer);
  }

  if (lastSkipDirection !== direction) {
    skipAccumulator = 0;
    lastSkipDirection = direction;
  }

  skipAccumulator += 10;
  
  const offset = direction === 'forward' ? 10 : -10;
  const media = activeMediaElement;
  if (media && Number.isFinite(media.duration) && media.duration > 0) {
    media.currentTime = Math.min(media.duration, Math.max(0, media.currentTime + offset));
    updateControlState();
  }

  showVideoFeedback(
    direction === 'forward' ? 'Forward' : 'Rewind',
    formatAccumulatorTime(skipAccumulator),
    direction
  );

  skipAccumulatorTimer = setTimeout(() => {
    resetSkipSession();
  }, 800);
}

let lastPointerDownTime = 0;
let lastPointerDownX = 0;
let lastPointerDownY = 0;

videoElement.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  lastPointerDownTime = new Date().getTime();
  lastPointerDownX = e.clientX;
  lastPointerDownY = e.clientY;
});

videoElement.addEventListener('pointerup', (e) => {
  if (e.button !== 0) return;
  const currentTime = new Date().getTime();
  const duration = currentTime - lastPointerDownTime;
  const deltaX = Math.abs(e.clientX - lastPointerDownX);
  const deltaY = Math.abs(e.clientY - lastPointerDownY);

  const isMouse = e.pointerType === 'mouse';
  const isTouchTap = e.pointerType === 'touch' && duration < 250 && deltaX < 20 && deltaY < 20;

  if (isMouse || isTouchTap || !e.pointerType) {
    handleVideoTap(e);
  }
});

function handleVideoTap(e) {
  const rect = videoElement.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const isRightHalf = clickX > width / 2;
  const direction = isRightHalf ? 'forward' : 'rewind';

  const currentTime = new Date().getTime();
  const tapLength = currentTime - videoLastTapTime;
  videoLastTapTime = currentTime;

  const inActiveSkipSession = skipAccumulator > 0 && lastSkipDirection !== null;
  const isSameSide = lastSkipDirection === direction;

  if (inActiveSkipSession && isSameSide) {
    if (videoClickTimeout) {
      clearTimeout(videoClickTimeout);
      videoClickTimeout = null;
    }
    performDoubleTapSkip(isRightHalf);
  } else if (tapLength < 300 && tapLength > 0) {
    if (videoClickTimeout) {
      clearTimeout(videoClickTimeout);
      videoClickTimeout = null;
    }
    performDoubleTapSkip(isRightHalf);
  } else {
    if (videoClickTimeout) clearTimeout(videoClickTimeout);
    
    if (inActiveSkipSession && !isSameSide) {
      resetSkipSession();
    }

    videoClickTimeout = setTimeout(() => {
      toggleActivePlayback();
      videoClickTimeout = null;
    }, 250); // 250ms for responsive single-tap action
  }
}

mediaProgressRange.addEventListener('input', () => {
  const media = activeMediaElement;
  if (!media || !Number.isFinite(media.duration) || media.duration <= 0) return;
  const ratio = Number(mediaProgressRange.value) / Number(mediaProgressRange.max);
  media.currentTime = ratio * media.duration;
  updateControlState();
});

mediaVolumeRange.addEventListener('input', () => {
  const media = activeMediaElement;
  if (!media) return;
  media.volume = Number(mediaVolumeRange.value);
  media.muted = media.volume === 0;
  updateControlState();
  showVideoFeedback('Volume', `${Math.round((media.muted ? 0 : media.volume) * 100)}%`, 'volume');
});

mediaMuteBtn.addEventListener('click', () => {
  const media = activeMediaElement;
  if (!media) return;
  media.muted = !media.muted;
  updateControlState();
  showVideoFeedback('Volume', media.muted ? 'Muted' : `${Math.round(media.volume * 100)}%`, 'volume');
});

mediaSpeedBtn.addEventListener('click', () => toggleSpeedMenu());
speedButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const media = activeMediaElement;
    if (!media) return;
    media.playbackRate = Number(btn.dataset.speed);
    toggleSpeedMenu(false);
    updateControlState();
  });
});

mediaFullscreenBtn.addEventListener('click', () => {
  if (activeMediaElement !== videoElement || !videoStage) return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (videoStage.requestFullscreen) {
    videoStage.requestFullscreen();
  } else if (videoElement.webkitEnterFullscreen) {
    // Native fullscreen fallback for iOS Safari (iPhone)
    videoElement.webkitEnterFullscreen();
  } else if (videoElement.requestFullscreen) {
    videoElement.requestFullscreen();
  }
});

videoExitFullscreen.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
});

document.addEventListener('fullscreenchange', updateFullscreenUi);


['mousemove', 'pointerdown', 'touchstart'].forEach(eventName => {
  videoStage.addEventListener(eventName, showFullscreenExitControl, { passive: true });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') toggleHistory(false);
  if (e.key === 'Escape') toggleSpeedMenu(false);
  if (document.fullscreenElement === videoStage) showFullscreenExitControl();
  if (isTypingTarget(document.activeElement)) return;

  if (e.key === ' ' && activeMediaElement && document.activeElement === document.body) {
    e.preventDefault();
    toggleActivePlayback();
  }
  if (e.key === 'ArrowLeft' && activeMediaElement) {
    e.preventDefault();
    seekActiveMedia(-10);
  }
  if (e.key === 'ArrowRight' && activeMediaElement) {
    e.preventDefault();
    seekActiveMedia(10);
  }
  if (e.key === 'ArrowUp' && activeMediaElement) {
    e.preventDefault();
    adjustActiveVolume(0.05);
  }
  if (e.key === 'ArrowDown' && activeMediaElement) {
    e.preventDefault();
    adjustActiveVolume(-0.05);
  }
});
document.addEventListener('click', e => {
  if (!mediaSpeedMenu.classList.contains('hidden') && !mediaSpeedBtn.contains(e.target) && !mediaSpeedMenu.contains(e.target)) {
    toggleSpeedMenu(false);
  }
});


// FAQ Accordion Toggle Logic
(function() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const button = item.querySelector('button');
    const answer = item.querySelector('.faq-answer');

    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close other accordion items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
          otherItem.querySelector('button').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();
