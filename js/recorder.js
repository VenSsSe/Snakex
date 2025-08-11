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
        showModal(`Путь слишком короткий (${path.length}) для сетки ${GRID_SIZE}x${GRID_SIZE}. Змейка не сможет заполнить все поле.`);
        return;
    }
    const mimeType = recordFormat === 'mp4' ? 'video/mp4' : 'video/webm; codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
        showModal(`Ошибка: Ваш браузер не поддерживает запись в формате ${recordFormat.toUpperCase()}. Попробуйте WebM.`);
        return;
    }
    isRecording = true;
    wasAborted = false;
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
