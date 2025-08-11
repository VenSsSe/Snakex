startBtn.addEventListener('click', () => {
    if(isRecording) {
        showModal("Нельзя запустить игру во время записи.");
        return;
    }
    resetGame();
    startGame();
});
stopBtn.addEventListener('click', stopGame);
resetBtn.addEventListener('click', resetGame);

berryCountSlider.addEventListener('input', (e) => {
    maxBerries = parseInt(e.target.value, 10);
    berryCountDisplay.textContent = maxBerries;
    if (!isRecording) resetGame();
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
        console.error(e);
    }
});

showPathCheckbox.addEventListener('change', draw);

toggleHead.addEventListener('change', (e) => { showHeadCutout = e.target.checked; });
toggleBerries.addEventListener('change', (e) => { showBerriesCutout = e.target.checked; });
toggleTail.addEventListener('change', (e) => { showTailCutout = e.target.checked; });

// Event Listeners for Volume
toggleVolumeEffectBg.addEventListener('change', (e) => { isVolumeEffectEnabledBg = e.target.checked; });
volumeStyleSelectBg.addEventListener('change', (e) => { volumeEffectStyleBg = e.target.value; });
volumeIntensitySliderBg.addEventListener('input', (e) => {
    const intensityValue = parseInt(e.target.value, 10);
    volumeEffectIntensityBg = intensityValue / 100;
    volumeIntensityDisplayBg.textContent = `${intensityValue}%`;
});

toggleVolumeEffectCover.addEventListener('change', (e) => { isVolumeEffectEnabledCover = e.target.checked; });
volumeStyleSelectCover.addEventListener('change', (e) => { volumeEffectStyleCover = e.target.value; });
volumeIntensitySliderCover.addEventListener('input', (e) => {
    const intensityValue = parseInt(e.target.value, 10);
    volumeEffectIntensityCover = intensityValue / 100;
    volumeIntensityDisplayCover.textContent = `${intensityValue}%`;
});

toggleRainbowBorder.addEventListener('change', (e) => { isRainbowBorderEnabled = e.target.checked; });
rainbowBorderSlider.addEventListener('input', (e) => {
    const thicknessValue = parseInt(e.target.value, 10);
    rainbowBorderThickness = thicknessValue;
    rainbowBorderDisplay.textContent = `${thicknessValue}px`;
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

gridSizeSlider.addEventListener('input', (e) => {
    GRID_SIZE = parseInt(e.target.value, 10);
    gridSizeDisplay.textContent = `${GRID_SIZE}x${GRID_SIZE}`;
    updatePathSelect();
    pathInput.value = '';
    path = [];
    pathMap.clear();
    showModal('Сетка изменена. Выберите подходящий путь или создайте новый.');
    init();
});

formatWebmRadio.addEventListener('change', (e) => { if (e.target.checked) recordFormat = 'webm'; });
formatMp4Radio.addEventListener('change', (e) => {
    if (e.target.checked) {
        if (MediaRecorder.isTypeSupported('video/mp4')) {
            recordFormat = 'mp4';
        } else {
            showModal('Ваш браузер не поддерживает запись в MP4. Будет использоваться WebM.');
            formatWebmRadio.checked = true;
            recordFormat = 'webm';
        }
    }
});

zoomSlider.addEventListener('input', (e) => {
    targetZoom = parseInt(e.target.value, 10);
    zoomDisplay.textContent = `${targetZoom}x`;
});

fadeSlider.addEventListener('input', (e) => { updateFadeDuration(); });
finishPositionSlider.addEventListener('input', updateFinishTargetPosition);

imageUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'image'));
coverUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'cover'));
snakeHeadUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'snake-head'));
berryUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'berry'));

recordBtn.addEventListener('click', setupAndStartRecording);

abortRecordingBtn.addEventListener('click', () => {
    if (recorder && isRecording) {
        wasAborted = true;
        isRecording = false;
        recorder.stop();
        stopGame();
        showModal("Запись отменена.");
        resetRecordingPanel();
        [startBtn, stopBtn, resetBtn, recordBtn, applyPathBtn, imageUpload, coverUpload, snakeHeadUpload, berryUpload, berryCountSlider, savePathBtn, loadPathBtn, pathSelect].forEach(el => el.disabled = false);
    }
});

window.addEventListener('resize', init);

pathSelect.addEventListener('change', () => {
    const pathName = pathSelect.value;
    if (pathName && allPaths[pathName]) {
        pathInput.value = JSON.stringify(allPaths[pathName].path);
        applyPathBtn.click();
    }
});

loadPathBtn.addEventListener('click', () => {
    pathFileInput.click();
});

pathFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const newPaths = JSON.parse(e.target.result);
            Object.assign(allPaths, newPaths);
            savePathsToFile();
            updatePathSelect();
            showModal('Файл с путями успешно загружен и объединен.');
        } catch (error) {
            showModal('Ошибка при чтении файла. Убедитесь, что это корректный JSON.');
            console.error('Error parsing paths file:', error);
        }
    };
    reader.readAsText(file);
    pathFileInput.value = '';
});

savePathBtn.addEventListener('click', () => {
    const pathDataString = pathInput.value;
    if (!pathDataString) {
        showModal('Нет пути для сохранения.');
        return;
    }
    try {
        const pathData = JSON.parse(pathDataString);
        const pathName = prompt('Введите имя для этого пути:', `Path-Grid${GRID_SIZE}-${Object.keys(allPaths).length + 1}`);
        if (pathName) {
            if (allPaths[pathName]) {
                if (!confirm(`Путь с именем "${pathName}" уже существует. Перезаписать?`)) {
                    return;
                }
            }
            allPaths[pathName] = {
                gridSize: GRID_SIZE,
                path: pathData
            };
            savePathsToFile();
            updatePathSelect();
            pathSelect.value = pathName;
            showModal(`Путь "${pathName}" сохранен.`);
        }
    } catch (e) {
        showModal('Не удалось сохранить путь. Проверьте формат JSON в поле ввода.');
        console.error(e);
    }
});