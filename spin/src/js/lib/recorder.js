import { appSettings } from '../settings.js';
import { showRecordingView, hideRecordingView } from '../components/recorder_view.js';

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

const recordBtn = document.getElementById('recordBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const timer = document.getElementById('timer');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownText = document.getElementById('countdownText');
const iframeContainer = document.getElementById('iframeContainer');

function setStatusMessage(message, type = 'default') {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    if (type === 'error') statusMessage.classList.add('status-error');
    else if (type === 'success') statusMessage.classList.add('status-success');
    else if (type === 'info') statusMessage.classList.add('status-info');
}

function handleRecordingAttempt() {
    if (isRecording) {
        stopRecording();
        return;
    }

    const isSiteLoaded = !!iframeContainer.querySelector('iframe');
    if (!isSiteLoaded) {
        alert('Сначала загрузите сайт, чтобы открыть предпросмотр.');
        return;
    }

    if (typeof hideRecordingView === 'function') {
        hideRecordingView();
    }

    initiateRecordingSequence();
}

async function initiateRecordingSequence() {
    let capturedStream;

    try {
        const [width, height] = appSettings.demoResolution.split('x').map(Number);
        capturedStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                width: { ideal: width, max: width },
                height: { ideal: height, max: height },
                frameRate: { ideal: 60, max: 60 }
            },
            audio: true
        });
    } catch (err) {
        console.error("Ошибка при запросе захвата экрана:", err);
        setStatusMessage('Вы отменили или не смогли начать захват экрана.', 'error');
        return;
    }

    const mainIframe = iframeContainer.querySelector('iframe');
    if (!mainIframe) {
        alert('Не найден iframe для записи.');
        capturedStream.getTracks().forEach(track => track.stop());
        return;
    }

    try {
        await mainIframe.requestFullscreen();

        if (appSettings.countdownEnabled) {
            startCountdown(capturedStream);
        } else {
            startRecording(capturedStream);
        }

    } catch (err) {
        console.error("Не удалось войти в полноэкранный режим:", err);
        setStatusMessage('Ошибка: не удалось перейти в полноэкранный режим.', 'error');
        capturedStream.getTracks().forEach(track => track.stop());
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
        const [width, height] = appSettings.demoResolution.split('x').map(Number);
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

            downloadHandler = () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = `recording-${new Date().toISOString()}.${fileExtension}`;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
                downloadHandler = null;
            };

            downloadBtn.classList.remove('hidden');
        };

        mediaStream.getVideoTracks()[0].onended = () => stopRecording();

        mediaRecorder.start();

        isRecording = true;
        isPaused = false;

        recordBtn.classList.add('btn-record-active');
        recordBtn.textContent = 'Идет запись';
        pauseBtn.classList.remove('hidden');
        stopBtn.classList.remove('hidden');
        timer.classList.remove('hidden');
        downloadBtn.classList.add('hidden');

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
    if (isPaused) {
        mediaRecorder.pause();
        clearInterval(timerInterval);
        elapsedTime = Date.now() - startTime;
        pauseBtn.textContent = 'Продолжить';
        recordBtn.classList.remove('btn-record-active');
    } else {
        mediaRecorder.resume();
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimer, 1000);
        pauseBtn.textContent = 'Пауза';
        recordBtn.classList.add('btn-record-active');
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

    if (typeof showRecordingView === 'function') {
        showRecordingView();
    }
}

function resetRecordingUI() {
    isRecording = false;
    isPaused = false;
    clearInterval(timerInterval);
    elapsedTime = 0;

    recordBtn.classList.remove('btn-record-active');
    recordBtn.textContent = 'Запись';
    pauseBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');
    timer.classList.add('hidden');
    updateTimer();
}

function updateTimer() {
    const currentElapsedTime = isRecording && !isPaused ? Date.now() - startTime : elapsedTime;
    const totalSeconds = Math.floor(currentElapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formatTime = (num) => num.toString().padStart(2, '0');
    timer.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
}

export function initRecorder() {
    recordBtn.addEventListener('click', handleRecordingAttempt);
    pauseBtn.addEventListener('click', togglePause);
    stopBtn.addEventListener('click', stopRecording);

    downloadBtn.addEventListener('click', () => {
        if (typeof downloadHandler === 'function') {
            downloadHandler();
        }
    });

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
