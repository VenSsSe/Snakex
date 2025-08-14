function init() {
    handleImageURL('images/default_background.svg', 'image');
    handleImageURL('images/default_cover.svg', 'cover');
    handleImageURL('images/default_snake_head.svg', 'snake-head');
    handleImageURL('images/default_berry.svg', 'berry');

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

function drawRainbowBorder(ctx, canvasWidth, canvasHeight, thickness, offset) {
    if (!isRainbowBorderEnabled || thickness <= 0) return;
    const time = Date.now() / 500;
    const saturation = 90 + 10 * Math.sin(time);
    const lightness = 55 + 15 * Math.cos(time * 0.5);
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i <= 12; i++) {
        const position = i / 12;
        const hue = (offset + position * 360) % 360;
        gradient.addColorStop(position, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(canvasWidth, 0); ctx.lineTo(canvasWidth, canvasHeight); ctx.lineTo(0, canvasHeight); ctx.closePath();
    ctx.moveTo(thickness, thickness); ctx.lineTo(thickness, canvasHeight - thickness); ctx.lineTo(canvasWidth - thickness, canvasHeight - thickness); ctx.lineTo(canvasWidth - thickness, thickness); ctx.closePath();
    ctx.fill("evenodd");
    ctx.restore();
}

function applyPillowEffect(ctxToApply, cellX, cellY, intensity, effectiveCellSize) {
    const alpha = intensity;
    if (alpha === 0) return;
    const centerX = cellX + effectiveCellSize / 2;
    const centerY = cellY + effectiveCellSize / 2;
    const radialGradient = ctxToApply.createRadialGradient(centerX, centerY, 0, centerX, centerY, effectiveCellSize * 0.8);
    radialGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.4})`);
    radialGradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.1})`);
    radialGradient.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.2})`);
    ctxToApply.fillStyle = radialGradient;
    ctxToApply.fillRect(cellX, cellY, effectiveCellSize, effectiveCellSize);
    const inset = effectiveCellSize * 0.1;
    const innerCellX = cellX + inset;
    const innerCellY = cellY + inset;
    const innerSize = effectiveCellSize - inset * 2;
    const highlightGradient = ctxToApply.createLinearGradient(innerCellX, innerCellY, innerCellX + innerSize, innerCellY + innerSize);
    highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.6})`);
    highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctxToApply.fillStyle = highlightGradient;
    ctxToApply.fillRect(innerCellX, innerCellY, innerSize, innerSize);
    const shadowGradient = ctxToApply.createLinearGradient(innerCellX + innerSize, innerCellY + innerSize, innerCellX, innerCellY);
    shadowGradient.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.5})`);
    shadowGradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
    ctxToApply.fillStyle = shadowGradient;
    ctxToApply.fillRect(innerCellX, innerCellY, innerSize, innerSize);
    ctxToApply.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctxToApply.lineWidth = Math.max(1, effectiveCellSize * 0.02);
    ctxToApply.beginPath();
    ctxToApply.moveTo(cellX + effectiveCellSize - ctxToApply.lineWidth, cellY + ctxToApply.lineWidth);
    ctxToApply.lineTo(cellX + ctxToApply.lineWidth, cellY + ctxToApply.lineWidth);
    ctxToApply.lineTo(cellX + ctxToApply.lineWidth, cellY + effectiveCellSize - ctxToApply.lineWidth);
    ctxToApply.stroke();
}

function applyGlintEffect(ctxToApply, cellX, cellY, intensity, effectiveCellSize) {
    const alpha = intensity;
    if (alpha === 0) return;
    const shadowGradient = ctxToApply.createRadialGradient(cellX + effectiveCellSize / 2, cellY + effectiveCellSize / 2, effectiveCellSize / 2, cellX + effectiveCellSize / 2, cellY + effectiveCellSize / 2, effectiveCellSize);
    shadowGradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    shadowGradient.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.5})`);
    ctxToApply.fillStyle = shadowGradient;
    ctxToApply.fillRect(cellX, cellY, effectiveCellSize, effectiveCellSize);
    const highlightX = cellX + effectiveCellSize * 0.2;
    const highlightY = cellY + effectiveCellSize * 0.2;
    const glintGradient = ctxToApply.createRadialGradient(highlightX, highlightY, 0, highlightX, highlightY, effectiveCellSize * 0.4);
    glintGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.7})`);
    glintGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctxToApply.fillStyle = glintGradient;
    ctxToApply.fillRect(cellX, cellY, effectiveCellSize, effectiveCellSize);
    ctxToApply.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.6})`;
    ctxToApply.lineWidth = Math.max(1, effectiveCellSize * 0.03);
    ctxToApply.beginPath();
    ctxToApply.moveTo(cellX + effectiveCellSize, cellY);
    ctxToApply.lineTo(cellX + effectiveCellSize, cellY + effectiveCellSize);
    ctxToApply.lineTo(cellX, cellY + effectiveCellSize);
    ctxToApply.stroke();
}

function applyVignetteEffect(ctxToApply, cellX, cellY, intensity, effectiveCellSize) {
    const alpha = intensity;
    if (alpha === 0) return;
    const centerX = cellX + effectiveCellSize / 2;
    const centerY = cellY + effectiveCellSize / 2;
    const gradient = ctxToApply.createRadialGradient(centerX, centerY, effectiveCellSize / 2 * (1 - alpha), centerX, centerY, effectiveCellSize / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${alpha * 0.8})`);
    ctxToApply.fillStyle = gradient;
    ctxToApply.fillRect(cellX, cellY, effectiveCellSize, effectiveCellSize);
}

function applyConvexityEffect(ctxToApply, cellX, cellY, style, intensity, effectiveCellSize) {
    switch (style) {
        case 'glint': applyGlintEffect(ctxToApply, cellX, cellY, intensity, effectiveCellSize); break;
        case 'vignette': applyVignetteEffect(ctxToApply, cellX, cellY, intensity, effectiveCellSize); break;
        default: applyPillowEffect(ctxToApply, cellX, cellY, intensity, effectiveCellSize); break;
    }
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
                    if (isVolumeEffectEnabledBg) {
                        applyConvexityEffect(targetCtx, cellX, cellY, volumeEffectStyleBg, volumeEffectIntensityBg, effectiveCellSize);
                    }
                }
            }
        }
    } else {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cellX = x * effectiveCellSize;
                const cellY = y * effectiveCellSize;
                const gradient = targetCtx.createRadialGradient(cellX + effectiveCellSize * 0.25, cellY + effectiveCellSize * 0.25, effectiveCellSize * 0.1, cellX + effectiveCellSize / 2, cellY + effectiveCellSize / 2, effectiveCellSize * 0.7);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, '#d4d4d4');
                targetCtx.fillStyle = gradient;
                targetCtx.fillRect(cellX, cellY, effectiveCellSize, effectiveCellSize);
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
        } else {
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    const cellX = x * effectiveCellSize;
                    const cellY = y * effectiveCellSize;
                    const gradient = maskCtx.createRadialGradient(cellX + effectiveCellSize * 0.25, cellY + effectiveCellSize * 0.25, 0, cellX + effectiveCellSize / 2, cellY + effectiveCellSize / 2, effectiveCellSize);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                    gradient.addColorStop(0.2, 'rgba(80, 80, 80, 0.2)');
                    gradient.addColorStop(1, '#1a1a1a');
                    maskCtx.fillStyle = gradient;
                    maskCtx.fillRect(cellX, cellY, effectiveCellSize, effectiveCellSize);
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
        if (isVolumeEffectEnabledCover) {
            maskCtx.globalCompositeOperation = 'source-atop';
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    applyConvexityEffect(maskCtx, x * effectiveCellSize, y * effectiveCellSize, volumeEffectStyleCover, volumeEffectIntensityCover, effectiveCellSize);
                }
            }
        }
        maskCtx.globalCompositeOperation = 'source-over';
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
            } else {
                targetCtx.fillStyle = 'lime';
                targetCtx.fillRect(headX, headY, headSize, headSize);
            }
            targetCtx.restore();
        } else if (!isGameOver) {
            if (snakeHeadImage) {
                targetCtx.drawImage(snakeHeadImage, headX, headY, headSize, headSize);
            } else {
                targetCtx.fillStyle = 'lime';
                targetCtx.fillRect(headX, headY, headSize, headSize);
            }
        }
    }

    const gridWidth = gameDisplayWidth;
    const gridHeight = gameDisplayHeight;
    drawRainbowBorder(targetCtx, gridWidth, gridHeight, rainbowBorderThickness, rainbowOffset);
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
    startBtn.classList.remove('start-btn-idle');
    startBtn.classList.add('start-btn-running');
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
    startBtn.classList.remove('start-btn-running');
    startBtn.classList.add('start-btn-idle');
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
    startBtn.classList.remove('start-btn-running');
    startBtn.classList.add('start-btn-idle');
    gameArea.classList.remove('running-highlight', 'recording-highlight');
    gameArea.classList.add('idle-highlight');
}

function mainAnimationLoop() {
    if (!initialLoadComplete) {
        requestAnimationFrame(mainAnimationLoop);
        return;
    }
    if (isRainbowBorderEnabled) {
        rainbowOffset = (rainbowOffset + 1) % 360;
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