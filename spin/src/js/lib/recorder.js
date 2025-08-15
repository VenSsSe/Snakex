import { appSettings } from '../rec.js';
import { addRecording } from '../history.js';

export let isRecording = false;
let isPaused = false;
let startTime;
let elapsedTime = 0;
let timerInterval;
let mediaRecorder;
let recordedChunks = [];
let mediaStream;
let actualMimeType = '';
let downloadHandler = null;

const recordBtnSettings = document.getElementById('recordBtnSettings');
const pauseBtnSettings = document.getElementById('pauseBtnSettings');
const stopBtnSettings = document.getElementById('stopBtnSettings');
const downloadBtnSettings = document.getElementById('downloadBtnSettings');
const timerSettings = document.getElementById('timerSettings');

const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');
const iframeContainer = document.getElementById('iframeContainer');

function updateRECButton(isRecording) {
    if (isRecording) {
        recordBtnSettings.classList.add('btn-record-active');
        recordBtnSettings.textContent = 'Идет запись';
    } else {
        recordBtnSettings.classList.remove('btn-record-active');
        recordBtnSettings.textContent = 'Запись';
    }
}

function updatePauseButton(isPaused) {
    if (isPaused) {
        pauseBtnSettings.textContent = 'Продолжить';
    } else {
        pauseBtnSettings.textContent = 'Пауза';
    }
}

function showPauseButton() {
    pauseBtnSettings.classList.remove('hidden');
}

function hidePauseButton() {
    pauseBtnSettings.classList.add('hidden');
}

function showStopButton() {
    stopBtnSettings.classList.remove('hidden');
}

function hideStopButton() {
    stopBtnSettings.classList.add('hidden');
}

function showDownloadButton() {
    downloadBtnSettings.classList.remove('hidden');
}

function hideDownloadButton() {
    downloadBtnSettings.classList.add('hidden');
}

function showTimer() {
    timerSettings.classList.remove('hidden');
}

function hideTimer() {
    timerSettings.classList.add('hidden');
}

async function handleRecordingAttempt() {
    if (isRecording) {
        stopRecording();
        return;
    }

    const isSiteLoaded = !!iframeContainer.querySelector('iframe');
    if (!isSiteLoaded) {
        alert('Сначала загрузите сайт, чтобы начать запись.');
        return;
    }

    try {
        const [width, height] = appSettings.resolution.split('x').map(Number);
        const capturedStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                width: { ideal: width, max: width },
                height: { ideal: height, max: height },
                frameRate: { ideal: 60, max: 60 }
            },
            audio: true
        });

        const mainIframe = iframeContainer.querySelector('iframe');
        if (!mainIframe) {
            alert('Не найден iframe для записи.');
            capturedStream.getTracks().forEach(track => track.stop());
            return;
        }

        await mainIframe.requestFullscreen();

        if (appSettings.countdownEnabled) {
            startCountdown(capturedStream);
        } else {
            startRecording(capturedStream);
        }
    } catch (err) {
        console.error("Ошибка при захвате экрана или входе в полноэкранный режим:", err);
        setStatusMessage('Вы отменили, не смогли начать захват экрана или войти в полноэкранный режим.', 'error');
    }
}

function startCountdown(stream) {
    countdownOverlay.classList.remove('hidden');

    let count = 3;
    countdownText.textContent = count;

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.textContent = count;
        } else if (count === 0) {
            countdownText.textContent = 'Go!';
        } else {
            clearInterval(countdownInterval);
            countdownOverlay.classList.add('hidden');
            startRecording(stream);
        }
    }, 1000);
}

async function startRecording(stream) {
    mediaStream = stream;

    try {
        const [width, height] = appSettings.resolution.split('x').map(Number);
        const getBitrate = (h) => {
            if (h >= 4320) return 80000000;
            if (h >= 2160) return 40000000;
            if (h >= 1440) return 20000000;
            if (h >= 1080) return 10000000;
            return 6000000;
        };
        const videoBitrate = getBitrate(height);

        recordedChunks = [];

        const preferredFormat = appSettings.videoFormat;
        const preferredMimeType = `video/${preferredFormat}`;
        actualMimeType = MediaRecorder.isTypeSupported(preferredMimeType) ? preferredMimeType : 'video/webm';

        if (actualMimeType !== preferredMimeType) {
            console.warn(`Формат ${preferredMimeType} не поддерживается. Используется ${actualMimeType}.`);
        }

        const recorderOptions = {
            mimeType: actualMimeType,
            videoBitsPerSecond: videoBitrate
        };
        mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: actualMimeType });
            const url = URL.createObjectURL(blob);
            const fileExtension = actualMimeType.split('/')[1].split(';')[0];
            const fileName = `recording-${new Date().toISOString()}.${fileExtension}`;

            addRecording(blob, fileName);

            downloadHandler = () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    // Don't revoke URL here, it's used by the history
                }, 100);
            };

            showDownloadButton();
        };

        mediaStream.getVideoTracks()[0].onended = () => stopRecording();

        mediaRecorder.start();

        isRecording = true;
        isPaused = false;

        updateRECButton(true);
        showPauseButton();
        showStopButton();
        showTimer();
        hideDownloadButton();

        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimer, 1000);

    } catch (err) {
        console.error("Ошибка при настройке MediaRecorder:", err);
        setStatusMessage('Не удалось настроить запись. Проверьте консоль.', 'error');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        mediaStream.getTracks().forEach(track => track.stop());
        resetRecordingUI();
    }
}

function togglePause() {
    if (!mediaRecorder) return;

    isPaused = !isPaused;
    updatePauseButton(isPaused);
    updateRECButton(!isPaused);

    if (isPaused) {
        mediaRecorder.pause();
        clearInterval(timerInterval);
        elapsedTime = Date.now() - startTime;
    } else {
        mediaRecorder.resume();
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

export function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    } else if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }

    resetRecordingUI();
}

function resetRecordingUI() {
    isRecording = false;
    isPaused = false;
    clearInterval(timerInterval);
    elapsedTime = 0;

    updateRECButton(false);
    hidePauseButton();
    hideStopButton();
    hideTimer();
    updateTimer();
}

function updateTimer() {
    const currentElapsedTime = isRecording && !isPaused ? Date.now() - startTime : elapsedTime;
    const totalSeconds = Math.floor(currentElapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formatTime = (num) => num.toString().padStart(2, '0');
    const timeString = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    timerSettings.textContent = timeString;
}

export function initRecorder() {
    recordBtnSettings.addEventListener('click', handleRecordingAttempt);
    pauseBtnSettings.addEventListener('click', togglePause);
    stopBtnSettings.addEventListener('click', stopRecording);

    const downloadFn = () => {
        if (typeof downloadHandler === 'function') {
            downloadHandler();
        }
    };

    downloadBtnSettings.addEventListener('click', downloadFn);

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && isRecording) {
            console.log('Выход из полноэкранного режима во время записи. Остановка.');
            stopRecording();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11' && isRecording) {
            e.preventDefault();
            console.log('F11 нажат во время записи. Остановка.');
            stopRecording();
        }
    });
}
