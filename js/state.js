// --- Game State ---
let GRID_SIZE = 10;
let cellSize;
let snake = [];
let snakeLength = 5;
let path = [];
let pathMap = new Map();
let currentStep = 0;
let isRunning = false;
let isGameOver = false;
let isRecording = false;
let wasAborted = false;
let isGameEnd = false;
let gameLoopTimeoutId;
let recorder = null;
let recordCtx = null;
let recordCanvas = null;

let backgroundImage = null;
let coverImage = null;
let snakeHeadImage = null;
let berryImage = null;
let berryPositions = [];
let maxBerries = 1;

let showHeadCutout = true;
let showBerriesCutout = true;
let showTailCutout = true;

// Music Player State
const audioPlayer = new Audio();
let currentAudioFile = null;

// Volume State
let isVolumeEffectEnabledBg = false;
let volumeEffectStyleBg = 'default';
let volumeEffectIntensityBg = 0.2;
let isVolumeEffectEnabledCover = false;
let volumeEffectStyleCover = 'default';
let volumeEffectIntensityCover = 0.2;

let isRainbowBorderEnabled = false;
let rainbowBorderThickness = 1;
let rainbowOffset = 0;

let minBerryDistance = 3;
let maxBerryDistance = 13;
let recordFormat = 'webm';

let headScale = 1;
let targetZoom = 1;

let isFinishing = false;
let isFading = false;
let currentZoomProgress = 0;
let currentFadeProgress = 0;
const ZOOM_DURATION_FRAMES = 100;
let FADE_DURATION_FRAMES = 10;
let targetFinishX;
let targetFinishY;
let pathToCenterInterval = null;
let pulsationPhase = 0;
let headOpacity = 1;

const finishPositionNames = [
    'Левый верхний',
    'Правый верхний',
    'Центр',
    'Левый нижний',
    'Правый нижний'
];

let allPaths = {};
const PATHS_FILE = 'paths.json';
let initialLoadComplete = false;

const defaultPath = "[[8,4],[8,5],[9,5],[9,4],[9,3],[8,3],[7,3],[7,2],[7,1],[8,1],[8,2],[9,2],[9,1],[9,0],[8,0],[7,0],[6,0],[5,0],[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[1,6],[0,6],[0,7],[0,8],[0,9],[1,9],[1,8],[1,7],[2,7],[2,6],[2,5],[3,5],[4,5],[4,4],[4,3],[4,2],[3,2],[3,3],[3,4],[2,4],[1,4],[1,3],[2,3],[2,2],[1,2],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[6,2],[5,2],[5,3],[6,3],[6,4],[5,4],[5,5],[6,5],[6,6],[5,6],[5,7],[5,8],[4,8],[4,7],[4,6],[3,6],[3,7],[3,8],[2,8],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[9,8],[9,7],[9,6],[8,6],[8,7],[8,8],[7,8],[6,8],[6,7],[7,7],[7,6],[7,5],[7,4]]";
