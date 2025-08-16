document.addEventListener('DOMContentLoaded', () => {
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

    const audioPlayer = new Audio();
    let currentAudioFile = null;

    let minBerryDistance = 3;
    let maxBerryDistance = 13;
    let recordFormat = 'mp4';

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
        'Левый верхний', 'Правый верхний', 'Центр', 'Левый нижний', 'Правый нижний'
    ];

    let allPaths = {};
    const PATHS_FILE = 'paths.json';
    let initialLoadComplete = false;

    const defaultPath = "[[8,4],[8,5],[9,5],[9,4],[9,3],[8,3],[7,3],[7,2],[7,1],[8,1],[8,2],[9,2],[9,1],[9,0],[8,0],[7,0],[6,0],[5,0],[4,0],[3,0],[2,0],[1,0],[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[1,6],[0,6],[0,7],[0,8],[0,9],[1,9],[1,8],[1,7],[2,7],[2,6],[2,5],[3,5],[4,5],[4,4],[4,3],[4,2],[3,2],[3,3],[3,4],[2,4],[1,4],[1,3],[2,3],[2,2],[1,2],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[6,2],[5,2],[5,3],[6,3],[6,4],[5,4],[5,5],[6,5],[6,6],[5,6],[5,7],[5,8],[4,8],[4,7],[4,6],[3,6],[3,7],[3,8],[2,8],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[9,8],[9,7],[9,6],[8,6],[8,7],[8,8],[7,8],[6,8],[6,7],[7,7],[7,6],[7,5],[7,4]]";

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
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');
    const downloadButton = document.getElementById('download-button');
    const toggleHead = document.getElementById('toggle-head');
    const toggleBerries = document.getElementById('toggle-berries');
    const toggleTail = document.getElementById('toggle-tail');
    const audioUpload = document.getElementById('audio-upload');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const trackNameDisplay = document.getElementById('track-name-display');
    const seekSlider = document.getElementById('seek-slider');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const durationDisplay = document.getElementById('duration-display');
    const gridSizeSlider = document.getElementById('grid-size-slider');
    const gridSizeDisplay = document.getElementById('grid-size-display');
    const minDistanceSlider = document.getElementById('min-distance-slider');
    const minDistanceDisplay = document.getElementById('min-distance-display');
    const maxDistanceSlider = document.getElementById('max-distance-slider');
    const maxDistanceDisplay = document.getElementById('max-distance-display');
    const formatWebmRadio = document.getElementById('format-webm');
    const formatMp4Radio = document.getElementById('format-mp4');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomDisplay = document.getElementById('zoom-display');
    const finishPositionSlider = document.getElementById('finish-position-slider');
    const finishPositionDisplay = document.getElementById('finish-position-display');
    const fadeSlider = document.getElementById('fade-slider');
    const fadeDisplay = document.getElementById('fade-display');
    const resetResourcesBtn = document.getElementById('reset-resources-btn');

    // --- UI Functions ---
    function showModal(message) {
        modal.textContent = message;
        modal.classList.add('show');
        setTimeout(() => {
            modal.classList.remove('show');
        }, 3000);
    }

    function updateFinishTargetPosition() {
        const index = parseInt(finishPositionSlider.value, 10);
        finishPositionDisplay.textContent = finishPositionNames[index];
        switch (index) {
            case 0: targetFinishX = 0; targetFinishY = 0; break;
            case 1: targetFinishX = GRID_SIZE - 1; targetFinishY = 0; break;
            case 2: targetFinishX = Math.floor(GRID_SIZE / 2); targetFinishY = Math.floor(GRID_SIZE / 2); break;
            case 3: targetFinishX = 0; targetFinishY = GRID_SIZE - 1; break;
            case 4: targetFinishX = GRID_SIZE - 1; targetFinishY = GRID_SIZE - 1; break;
        }
    }

    function updateFadeDuration() {
        const value = parseInt(fadeSlider.value, 10);
        FADE_DURATION_FRAMES = value * (30 / 10);
        fadeDisplay.textContent = `${(value * 0.1).toFixed(1)} с`;
    }

    // --- Media & Music ---
    function typeToTitle(type) {
        switch(type) {
            case 'image': return 'Добавить фон';
            case 'cover': return 'Добавить рубашку';
            case 'snake-head': return 'Добавить голову змейки';
            case 'berry': return 'Добавить ягоду';
            default: return '';
        }
    }
    
    function displayPreview(previewSrc, type, mediaElement) {
        const oldPreview = document.getElementById(`preview-${type}`);
        if (oldPreview) {
            const oldMediaElement = oldPreview.parentElement.dataset.mediaElement;
            if (oldMediaElement && oldMediaElement.tagName === 'VIDEO') {
                oldMediaElement.pause();
                URL.revokeObjectURL(oldMediaElement.src);
            }
            oldPreview.parentElement.remove();
        }
        const previewWrapper = document.createElement('div');
        previewWrapper.className = 'relative';
        previewWrapper.dataset.mediaElement = mediaElement;
        const previewImg = document.createElement('img');
        previewImg.src = previewSrc;
        previewImg.id = `preview-${type}`;
        previewImg.className = 'preview-img';
        if (mediaElement && mediaElement.tagName === 'VIDEO') {
            const videoIcon = document.createElement('i');
            videoIcon.className = 'fas fa-video absolute bottom-1 right-1 text-white text-xs bg-black bg-opacity-50 rounded-sm p-0.5';
            previewWrapper.appendChild(videoIcon);
        }
        previewWrapper.appendChild(previewImg);
        const placeholder = document.querySelector(`label[title*="${typeToTitle(type)}"]`);
        if (placeholder) {
            previewsContainer.insertBefore(previewWrapper, placeholder);
            placeholder.style.display = 'none';
        } else {
            previewsContainer.appendChild(previewWrapper);
        }
        let clickCount = 0;
        let clickTimeout = null;
        previewImg.addEventListener('click', () => {
            clickCount++;
            if (clickTimeout) clearTimeout(clickTimeout);
            if (clickCount === 1) {
                previewImg.classList.add('highlighted');
                clickTimeout = setTimeout(() => {
                    previewImg.classList.remove('highlighted');
                    clickCount = 0;
                }, 2000);
            } else if (clickCount === 2) {
                if (mediaElement && mediaElement.tagName === 'VIDEO') {
                    mediaElement.pause();
                    URL.revokeObjectURL(mediaElement.src);
                }
                previewWrapper.remove();
                if (placeholder) placeholder.style.display = 'flex';
                switch(type) {
                    case 'image': backgroundImage = null; break;
                    case 'cover': coverImage = null; break;
                    case 'snake-head': snakeHeadImage = null; break;
                    case 'berry': berryImage = null; berryPositions = []; resetGame(); break;
                }
                clickCount = 0;
            }
        });
    }

    function handleImageURL(url, type) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = () => {
                displayPreview(url, type, img);
                switch(type) {
                    case 'image': backgroundImage = img; break;
                    case 'cover': coverImage = img; break;
                    case 'snake-head': snakeHeadImage = img; break;
                    case 'berry': berryImage = img; break;
                }
                resolve();
            };
            img.onerror = () => {
                showModal(`Не удалось загрузить: ${url}`);
                reject();
            };
        });
    }

    function handleFileUpload(file, type) {
        if (!file) return;
        if (file.type.startsWith('video/')) {
            if (type !== 'image' && type !== 'cover') {
                showModal('Видео можно загружать только для фона и рубашки.');
                return;
            }
            const video = document.createElement('video');
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            const videoUrl = URL.createObjectURL(file);
            video.src = videoUrl;
            video.addEventListener('loadeddata', () => {
                const previewCanvas = document.createElement('canvas');
                previewCanvas.width = 100;
                previewCanvas.height = 100;
                const previewCtx = previewCanvas.getContext('2d');
                previewCtx.drawImage(video, 0, 0, 100, 100);
                displayPreview(previewCanvas.toDataURL(), type, video);
                video.play().catch(e => console.error("Video play failed:", e));
            });
            video.addEventListener('error', () => showModal('Не удалось загрузить видео.'));
            switch(type) {
                case 'image': backgroundImage = video; break;
                case 'cover': coverImage = video; break;
            }
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleImageURL(e.target.result, type).catch(() => {});
            };
            reader.readAsDataURL(file);
        } else {
            showModal('Неподдерживаемый тип файла.');
        }
    }
    
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // --- Path Management ---
    function updatePathSelect() {
        const selectedPathName = pathSelect.value;
        pathSelect.innerHTML = '';
        const compatiblePaths = Object.keys(allPaths).filter(pathName => allPaths[pathName].gridSize == GRID_SIZE);
        if (compatiblePaths.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Нет путей для этой сетки";
            pathSelect.appendChild(option);
            pathSelect.disabled = true;
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = "Выберите путь...";
            pathSelect.appendChild(defaultOption);
            compatiblePaths.forEach(pathName => {
                const option = document.createElement('option');
                option.value = pathName;
                option.textContent = pathName;
                pathSelect.appendChild(option);
            });
            pathSelect.disabled = false;
        }
        if (selectedPathName && compatiblePaths.includes(selectedPathName)) {
            pathSelect.value = selectedPathName;
        }
    }

    function savePathsToFile() {
        const data = JSON.stringify(allPaths, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = PATHS_FILE;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
    
    // --- Game Logic ---
    function init() {
        const rect = gameArea.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            requestAnimationFrame(init);
            return;
        }
        canvas.width = rect.width;
        canvas.height = rect.height;
        cellSize = canvas.width / GRID_SIZE;
        updateFinishTargetPosition();
        targetZoom = parseInt(zoomSlider.value, 10);
        zoomDisplay.textContent = `${targetZoom}x`;
        updateFadeDuration();
        resetGame();
        startBtn.classList.add('start-btn-idle');
        gameArea.classList.add('idle-highlight');
    }

    function drawScene(targetCtx, width, height, currentSnake, currentHeadScale, currentHeadOpacity, isRecording = false, currentBerryPositions = berryPositions) {
        const gameDisplayWidth = isRecording ? width : width;
        const gameDisplayHeight = isRecording ? width : height; 

        if (isRecording) {
            targetCtx.fillStyle = 'black';
            targetCtx.fillRect(0, 0, width, height);
        }

        const effectiveCellSize = gameDisplayWidth / GRID_SIZE;
        const offsetX = (width - gameDisplayWidth) / 2;
        const offsetY = isRecording ? 0 : (height - gameDisplayHeight) / 2;

        targetCtx.save();
        targetCtx.translate(offsetX, offsetY);

        if (backgroundImage) {
            const source = backgroundImage;
            const isVideo = source.tagName === 'VIDEO';
            const sourceWidth = isVideo ? source.videoWidth : source.width;
            const sourceHeight = isVideo ? source.videoHeight : source.height;
            const isReady = isVideo ? source.readyState >= 2 : source.complete;
            if (isReady && sourceWidth > 0 && sourceHeight > 0) {
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        const cellX = x * effectiveCellSize;
                        const cellY = y * effectiveCellSize;
                        targetCtx.drawImage(source, x * (sourceWidth / GRID_SIZE), y * (sourceHeight / GRID_SIZE), sourceWidth / GRID_SIZE, sourceHeight / GRID_SIZE, cellX, cellY, effectiveCellSize, effectiveCellSize);
                    }
                }
            }
        }

        if (!isGameEnd && (!isGameOver || isRecording)) {
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = gameDisplayWidth;
            maskCanvas.height = gameDisplayHeight;
            const maskCtx = maskCanvas.getContext('2d');
            if (coverImage) {
                const source = coverImage;
                const isVideo = source.tagName === 'VIDEO';
                const sourceWidth = isVideo ? source.videoWidth : source.width;
                const sourceHeight = isVideo ? source.videoHeight : source.height;
                const isReady = isVideo ? source.readyState >= 2 : source.complete;
                if (isReady && sourceWidth > 0 && sourceHeight > 0) {
                    for (let y = 0; y < GRID_SIZE; y++) {
                        for (let x = 0; x < GRID_SIZE; x++) {
                            const cellX = x * effectiveCellSize;
                            const cellY = y * effectiveCellSize;
                            maskCtx.drawImage(source, x * (sourceWidth / GRID_SIZE), y * (sourceHeight / GRID_SIZE), sourceWidth / GRID_SIZE, sourceHeight / GRID_SIZE, cellX, cellY, effectiveCellSize, effectiveCellSize);
                        }
                    }
                }
            }
            maskCtx.globalCompositeOperation = 'destination-out';
            const cutoutParts = [];
            if (showTailCutout && currentSnake.length > 1) {
                for (let i = 0; i < currentSnake.length - 1; i++) {
                    cutoutParts.push(currentSnake[i]);
                }
            }
            if (showBerriesCutout && berryImage) cutoutParts.push(...currentBerryPositions);
            if (showHeadCutout && currentSnake.length > 0) cutoutParts.push(currentSnake[currentSnake.length - 1]);
            cutoutParts.forEach(part => {
                maskCtx.fillRect(part[0] * effectiveCellSize, part[1] * effectiveCellSize, effectiveCellSize, effectiveCellSize);
            });
            targetCtx.drawImage(maskCanvas, 0, 0, gameDisplayWidth, gameDisplayHeight);
        }

        if (berryImage && (!isGameOver || isRecording)) {
            currentBerryPositions.forEach(pos => {
                targetCtx.drawImage(berryImage, pos[0] * effectiveCellSize, pos[1] * effectiveCellSize, effectiveCellSize, effectiveCellSize);
            });
        }

        if (currentSnake.length > 0) {
            const head = currentSnake[currentSnake.length - 1];
            const headX = head[0] * effectiveCellSize;
            const headY = head[1] * effectiveCellSize;
            const headSize = effectiveCellSize;
            if (isFinishing || isFading) {
                const pulsationScale = 1 + 0.1 * Math.sin(pulsationPhase * 0.1);
                const finalHeadScale = currentHeadScale * pulsationScale;
                targetCtx.save();
                targetCtx.translate(headX + headSize / 2, headY + headSize / 2);
                targetCtx.scale(finalHeadScale, finalHeadScale);
                targetCtx.globalAlpha = currentHeadOpacity;
                targetCtx.translate(-(headX + headSize / 2), -(headY + headSize / 2));
                if (snakeHeadImage) {
                    targetCtx.drawImage(snakeHeadImage, headX, headY, headSize, headSize);
                }
                targetCtx.restore();
            } else if (!isGameOver) {
                if (snakeHeadImage) {
                    targetCtx.drawImage(snakeHeadImage, headX, headY, headSize, headSize);
                }
            }
        }
        targetCtx.restore();
    }

    function draw() {
        if (canvas.width === 0 || canvas.height === 0) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScene(ctx, canvas.width, canvas.height, snake, headScale, headOpacity, false);
        if (showPathCheckbox.checked && path.length > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(path[0][0] * cellSize + cellSize / 2, path[0][1] * cellSize + cellSize / 2);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i][0] * cellSize + cellSize / 2, path[i][1] * cellSize + cellSize / 2);
            }
            ctx.stroke();
            ctx.restore();
        }
    }

    function gameLoop() {
        if (!isRunning) return;
        currentStep = (currentStep + 1) % path.length;
        const head = path[currentStep];
        snake.push(head);
        while (snake.length > snakeLength) {
            snake.shift();
        }
        if (isRecording) {
            const totalLength = GRID_SIZE * GRID_SIZE;
            const progress = Math.min(100, (snakeLength / totalLength) * 100);
            progressText.textContent = `REC: ${Math.round(progress)}%`;
            progressBar.style.width = `${progress}%`;
        }
        const berryIndex = berryPositions.findIndex(pos => pos[0] === head[0] && pos[1] === head[1]);
        if (berryIndex > -1) {
            snakeLength++;
            berryPositions.splice(berryIndex, 1);
            if (snakeLength >= GRID_SIZE * GRID_SIZE) {
                isGameEnd = true;
                triggerFinishSequence();
                return;
            }
            spawnNewBerry(snake, berryPositions, currentStep);
        }
        gameLoopTimeoutId = setTimeout(gameLoop, 100);
    }

    function spawnNewBerry(currentSnake, currentBerryPositions, currentStep) {
        if (!berryImage || path.length === 0) return false;
        const occupiedCoords = new Set(currentSnake.map(p => `${p[0]},${p[1]}`));
        currentBerryPositions.forEach(p => occupiedCoords.add(`${p[0]},${p[1]}`));
        const headIndex = currentStep;
        let possiblePositions = [];
        for (let i = 0; i < path.length; i++) {
            const pos = path[i];
            if (occupiedCoords.has(`${pos[0]},${pos[1]}`)) continue;
            const distance = (i - headIndex + path.length) % path.length;
            if (distance >= minBerryDistance && distance <= maxBerryDistance) {
                possiblePositions.push(pos);
            }
        }
        if (possiblePositions.length === 0) {
            for (let i = headIndex + 1; i < path.length; i++) {
                const pos = path[i];
                if (!occupiedCoords.has(`${pos[0]},${pos[1]}`)) {
                    possiblePositions.push(pos);
                    break;
                }
            }
        }
        if (possiblePositions.length > 0) {
            const newBerryPos = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
            currentBerryPositions.push(newBerryPos);
            return true;
        }
        return false;
    }

    function initialBerrySpawn() {
        berryPositions = [];
        if (!berryImage) return;
        for (let i = 0; i < maxBerries; i++) {
            const spawned = spawnNewBerry(snake, berryPositions, currentStep);
            if (!spawned) {
                if (!isRecording) showModal(`Не удалось разместить все ${maxBerries} ягод.`);
                break;
            }
        }
    }

    function triggerFinishSequence() {
        stopGame();
        isFinishing = true;
        isGameOver = true;
        const finalHeadPosition = snake[snake.length - 1];
        if (finalHeadPosition[0] !== targetFinishX || finalHeadPosition[1] !== targetFinishY) {
            let currentX = finalHeadPosition[0];
            let currentY = finalHeadPosition[1];
            let pathIndex = 0;
            let tempPathToTarget = [];
            while (currentX !== targetFinishX || currentY !== targetFinishY) {
                tempPathToTarget.push([currentX, currentY]);
                if (currentX < targetFinishX) currentX++;
                else if (currentX > targetFinishX) currentX--;
                if (currentY < targetFinishY) currentY++;
                else if (currentY > targetFinishY) currentY--;
            }
            tempPathToTarget.push([targetFinishX, targetFinishY]);
            pathToCenterInterval = setInterval(() => {
                if (pathIndex < tempPathToTarget.length) {
                    snake = [tempPathToTarget[pathIndex]];
                    pathIndex++;
                } else {
                    clearInterval(pathToCenterInterval);
                    pathToCenterInterval = null;
                    startZoomAnimation();
                }
            }, 100);
        } else {
            startZoomAnimation();
        }
    }

    function startZoomAnimation() {
        currentZoomProgress = 0;
        pulsationPhase = 0;
        isFinishing = true;
    }

    function startFadeAnimation() {
        isFading = true;
        currentFadeProgress = 0;
    }

    function startGame() {
        if (isRunning || path.length === 0) return;
        if (backgroundImage && backgroundImage.tagName === 'VIDEO') {
            backgroundImage.currentTime = 0;
            backgroundImage.play();
        }
        if (coverImage && coverImage.tagName === 'VIDEO') {
            coverImage.currentTime = 0;
            coverImage.play();
        }
        isFinishing = false;
        isFading = false;
        isGameEnd = false;
        headScale = 1;
        headOpacity = 1;
        currentZoomProgress = 0;
        currentFadeProgress = 0;
        pulsationPhase = 0;
        if (pathToCenterInterval) {
            clearInterval(pathToCenterInterval);
            pathToCenterInterval = null;
        }
        isRunning = true;
        gameArea.classList.remove('idle-highlight', 'recording-highlight');
        gameArea.classList.add('running-highlight');
        gameLoop();
    }

    function stopGame() {
        isRunning = false;
        clearTimeout(gameLoopTimeoutId);
        if (pathToCenterInterval) {
            clearInterval(pathToCenterInterval);
            pathToCenterInterval = null;
        }
        gameArea.classList.remove('running-highlight', 'recording-highlight');
        gameArea.classList.add('idle-highlight');
    }

    function resetGame() {
        stopGame();
        isGameOver = false;
        isGameEnd = false;
        isFinishing = false;
        isFading = false;
        headScale = 1;
        headOpacity = 1;
        currentZoomProgress = 0;
        currentFadeProgress = 0;
        pulsationPhase = 0;
        snake = [];
        snakeLength = 5;
        currentStep = 0;
        const initialHead = path.length > 0 ? path[0] : [0,0];
        snake.push(initialHead);
        initialBerrySpawn();
        if (!isRecording) {
            resetRecordingPanel();
        }
        gameArea.classList.remove('running-highlight', 'recording-highlight');
        gameArea.classList.add('idle-highlight');
    }

    function mainAnimationLoop() {
        if (!initialLoadComplete) {
            requestAnimationFrame(mainAnimationLoop);
            return;
        }
        if (isFinishing && !isFading) {
            if (currentZoomProgress < ZOOM_DURATION_FRAMES) {
                currentZoomProgress++;
                const progress = currentZoomProgress / ZOOM_DURATION_FRAMES;
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                headScale = 1 + (targetZoom - 1) * easedProgress;
            } else {
                headScale = targetZoom;
                pulsationPhase++;
                if (pulsationPhase > 60) {
                    startFadeAnimation();
                }
            }
        }
        if (isFading) {
            if (currentFadeProgress < FADE_DURATION_FRAMES) {
                currentFadeProgress++;
                const progress = currentFadeProgress / FADE_DURATION_FRAMES;
                headOpacity = 1 - progress;
            } else {
                headOpacity = 0;
                isFading = false;
                isFinishing = false;
                if (isRecording) {
                    recorder.stop();
                }
            }
        }
        draw();
        if (isRecording && recordCtx && recorder?.state === 'recording') {
            drawScene(recordCtx, recordCanvas.width, recordCanvas.height, snake, headScale, headOpacity, true, berryPositions);
        }
        requestAnimationFrame(mainAnimationLoop);
    }
    
    function resetRecordingPanel() {
        progressText.textContent = "Готов к записи";
        progressBar.style.width = "0%";
        downloadButton.classList.add('hidden');
        abortRecordingBtn.classList.add('hidden');
        downloadButton.href = '#';
    }

    async function setupAndStartRecording() {
        if (isRecording) {
            showModal("Запись уже идет.");
            return;
        }
        if (!canvas.captureStream) {
            showModal('Ошибка: Запись видео не поддерживается в вашем браузере.');
            return;
        }
        if (!path.length) {
            showModal("Не задан путь для движения змейки!");
            return;
        }
        if (path.length < GRID_SIZE * GRID_SIZE) {
            showModal(`Путь слишком короткий (${path.length}) для сетки ${GRID_SIZE}x${GRID_SIZE}.`);
            return;
        }
        const mimeType = recordFormat === 'mp4' ? 'video/mp4' : 'video/webm; codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            showModal(`Ошибка: Ваш браузер не поддерживает запись в формате ${recordFormat.toUpperCase()}.`);
            return;
        }
        isRecording = true;
        wasAborted = false;
        gameArea.classList.remove('idle-highlight', 'running-highlight');
        gameArea.classList.add('recording-highlight');
        [startBtn, stopBtn, resetBtn, recordBtn, applyPathBtn, imageUpload, coverUpload, snakeHeadUpload, berryUpload, berryCountSlider, savePathBtn, loadPathBtn, pathSelect].forEach(el => el.disabled = true);
        progressText.textContent = "REC: 0%";
        progressBar.style.width = "0%";
        downloadButton.classList.add('hidden');
        abortRecordingBtn.classList.remove('hidden');
        recordCanvas = document.createElement('canvas');
        recordCanvas.width = 1080;
        recordCanvas.height = 1920;
        recordCtx = recordCanvas.getContext('2d');
        const recordedChunks = [];
        const stream = recordCanvas.captureStream(30);
        recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };
        recorder.onstop = () => {
            gameArea.classList.remove('recording-highlight');
            gameArea.classList.add('idle-highlight');
            if (wasAborted) {
                recordCtx = null;
                recordCanvas = null;
                return;
            }
            const blob = new Blob(recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            downloadButton.href = url;
            downloadButton.download = `snake-animation.${recordFormat}`;
            downloadButton.classList.remove('hidden');
            abortRecordingBtn.classList.add('hidden');
            progressText.textContent = "Готово!";
            [startBtn, stopBtn, resetBtn, recordBtn, applyPathBtn, imageUpload, coverUpload, snakeHeadUpload, berryUpload, berryCountSlider, savePathBtn, loadPathBtn, pathSelect].forEach(el => el.disabled = false);
            isRecording = false;
            recordCtx = null;
            recordCanvas = null;
        };
        recorder.start();
        resetGame();
        startGame();
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        startBtn.addEventListener('click', () => {
            if (isRecording) {
                showModal("Нельзя запустить игру во время записи.");
                return;
            }
            resetGame();
            startGame();
        });
        stopBtn.addEventListener('click', stopGame);
        resetBtn.addEventListener('click', resetGame);
        recordBtn.addEventListener('click', setupAndStartRecording);
        
        abortRecordingBtn.addEventListener('click', () => {
            if (recorder && isRecording) {
                wasAborted = true;
                recorder.stop();
                stopGame();
                showModal("Запись отменена.");
                resetRecordingPanel();
            }
        });

        applyPathBtn.addEventListener('click', () => {
            try {
                const parsedPath = JSON.parse(pathInput.value);
                if (Array.isArray(parsedPath) && parsedPath.every(p => Array.isArray(p) && p.length === 2)) {
                    path = parsedPath;
                    pathMap.clear();
                    path.forEach((p, i) => pathMap.set(`${p[0]},${p[1]}`, i));
                    resetGame();
                    showModal('Путь успешно применен!');
                } else {
                    throw new Error('Неверный формат пути.');
                }
            } catch (e) {
                showModal('Ошибка в формате пути. Используйте массив координат, например: [[0,0], [0,1]]');
            }
        });

        gridSizeSlider.addEventListener('input', (e) => {
            GRID_SIZE = parseInt(e.target.value, 10);
            gridSizeDisplay.textContent = `${GRID_SIZE}x${GRID_SIZE}`;
            updatePathSelect();
            pathInput.value = '';
            path = [];
            pathMap.clear();
            showModal('Сетка изменена. Выберите подходящий путь.');
            init();
        });
        
        berryCountSlider.addEventListener('input', (e) => {
            maxBerries = parseInt(e.target.value, 10);
            berryCountDisplay.textContent = maxBerries;
            if (!isRecording) resetGame();
        });

        minDistanceSlider.addEventListener('input', (e) => {
            minBerryDistance = parseInt(e.target.value, 10);
            if (minBerryDistance > maxBerryDistance) {
                maxBerryDistance = minBerryDistance;
                maxDistanceSlider.value = maxBerryDistance;
                maxDistanceDisplay.textContent = maxBerryDistance;
            }
            minDistanceDisplay.textContent = minBerryDistance;
            resetGame();
        });

        maxDistanceSlider.addEventListener('input', (e) => {
            maxBerryDistance = parseInt(e.target.value, 10);
            if (maxBerryDistance < minBerryDistance) {
                minBerryDistance = maxBerryDistance;
                minDistanceSlider.value = minBerryDistance;
                minDistanceDisplay.textContent = minBerryDistance;
            }
            maxDistanceDisplay.textContent = maxBerryDistance;
            resetGame();
        });
        
        imageUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'image'));
        coverUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'cover'));
        snakeHeadUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'snake-head'));
        berryUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'berry'));
        
        toggleHead.addEventListener('change', (e) => { showHeadCutout = e.target.checked; });
        toggleBerries.addEventListener('change', (e) => { showBerriesCutout = e.target.checked; });
        toggleTail.addEventListener('change', (e) => { showTailCutout = e.target.checked; });
        
        audioUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (currentAudioFile) URL.revokeObjectURL(currentAudioFile);
                currentAudioFile = URL.createObjectURL(file);
                audioPlayer.src = currentAudioFile;
                trackNameDisplay.textContent = file.name;
                audioPlayer.play();
            }
        });
        playPauseBtn.addEventListener('click', () => {
            if (audioPlayer.src) {
                audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
            }
        });
        audioPlayer.addEventListener('play', () => playPauseIcon.className = 'fas fa-pause');
        audioPlayer.addEventListener('pause', () => playPauseIcon.className = 'fas fa-play');
        audioPlayer.addEventListener('ended', () => playPauseIcon.className = 'fas fa-play');
        audioPlayer.addEventListener('loadedmetadata', () => {
            seekSlider.max = audioPlayer.duration;
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        });
        audioPlayer.addEventListener('timeupdate', () => {
            seekSlider.value = audioPlayer.currentTime;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        });
        seekSlider.addEventListener('input', (e) => {
            if(audioPlayer.src) audioPlayer.currentTime = e.target.value;
        });
        volumeSlider.addEventListener('input', (e) => {
            audioPlayer.volume = e.target.value;
        });
        
        window.addEventListener('resize', init);
    }
    
    // --- Initialization ---
    function initializeApp() {
        allPaths['default'] = {
            gridSize: 10,
            path: JSON.parse(defaultPath)
        };
        updatePathSelect();
        pathInput.value = defaultPath;
        applyPathBtn.click();
        
        handleImageURL('images/default_background.svg', 'image');
        handleImageURL('images/default_cover.svg', 'cover');
        handleImageURL('images/default_snake_head.svg', 'snake-head');
        handleImageURL('images/default_berry.svg', 'berry');

        init();
        mainAnimationLoop();
        initialLoadComplete = true;
    }
    
    setupEventListeners();
    initializeApp();
});
