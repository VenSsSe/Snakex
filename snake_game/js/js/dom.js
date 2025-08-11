// --- DOM Elements ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gameArea = document.getElementById('game-area');
const modal = document.getElementById('modal');

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const recordBtn = document.getElementById('record-btn');
const abortRecordingBtn = document.getElementById('abort-recording-btn');

const imageUpload = document.getElementById('image-upload');
const coverUpload = document.getElementById('cover-upload');
const snakeHeadUpload = document.getElementById('snake-head-upload');
const berryUpload = document.getElementById('berry-upload');
const previewsContainer = document.getElementById('previews');

const pathInput = document.getElementById('path-input');
const applyPathBtn = document.getElementById('apply-path-btn');
const showPathCheckbox = document.getElementById('show-path-checkbox');
const savePathBtn = document.getElementById('save-path-btn');
const loadPathBtn = document.getElementById('load-path-btn');
const pathSelect = document.getElementById('path-select');
const pathFileInput = document.getElementById('path-file-input');

const berryCountSlider = document.getElementById('berry-count-slider');
const berryCountDisplay = document.getElementById('berry-count-display');

const recordingStatus = document.getElementById('recording-status');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const downloadButton = document.getElementById('download-button');

const toggleHead = document.getElementById('toggle-head');
const toggleBerries = document.getElementById('toggle-berries');
const toggleTail = document.getElementById('toggle-tail');

// Music Player Elements
const audioUpload = document.getElementById('audio-upload');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const volumeSlider = document.getElementById('volume-slider');
const trackNameDisplay = document.getElementById('track-name-display');
const seekSlider = document.getElementById('seek-slider');
const currentTimeDisplay = document.getElementById('current-time-display');
const durationDisplay = document.getElementById('duration-display');

// Volume Controls
const toggleVolumeEffectBg = document.getElementById('toggle-volume-effect-bg');
const volumeIntensitySliderBg = document.getElementById('volume-intensity-slider-bg');
const volumeIntensityDisplayBg = document.getElementById('volume-intensity-display-bg');
const volumeStyleSelectBg = document.getElementById('volume-style-select-bg');

const toggleVolumeEffectCover = document.getElementById('toggle-volume-effect-cover');
const volumeIntensitySliderCover = document.getElementById('volume-intensity-slider-cover');
const volumeIntensityDisplayCover = document.getElementById('volume-intensity-display-cover');
const volumeStyleSelectCover = document.getElementById('volume-style-select-cover');

const toggleRainbowBorder = document.getElementById('toggle-rainbow-border');
const rainbowBorderSlider = document.getElementById('rainbow-border-slider');
const rainbowBorderDisplay = document.getElementById('rainbow-border-display');

const minDistanceSlider = document.getElementById('min-distance-slider');
const minDistanceDisplay = document.getElementById('min-distance-display');
const maxDistanceSlider = document.getElementById('max-distance-slider');
const maxDistanceDisplay = document.getElementById('max-distance-display');
const gridSizeSlider = document.getElementById('grid-size-slider');
const gridSizeDisplay = document.getElementById('grid-size-display');

const formatWebmRadio = document.getElementById('format-webm');
const formatMp4Radio = document.getElementById('format-mp4');

const zoomSlider = document.getElementById('zoom-slider');
const zoomDisplay = document.getElementById('zoom-display');

const finishPositionSlider = document.getElementById('finish-position-slider');
const finishPositionDisplay = document.getElementById('finish-position-display');

const fadeSlider = document.getElementById('fade-slider');
const fadeDisplay = document.getElementById('fade-display');
