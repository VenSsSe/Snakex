import { appSettings } from '../settings.js';

const recordingView = document.getElementById('recordingView');
const closeRecordingViewBtn = document.getElementById('closeRecordingViewBtn');
const demoIframeContainer = document.getElementById('recordingViewIframeContainer');
const wrapper = document.getElementById('recordingViewIframeWrapper');

export function applyDemoResolution() {
    if (!demoIframeContainer) return;

    const [width, height] = appSettings.demoResolution.split('x').map(Number);

    demoIframeContainer.style.width = `${width}px`;
    demoIframeContainer.style.height = `${height}px`;

    if (!wrapper) return;

    requestAnimationFrame(() => {
        const scale = Math.min(
            wrapper.clientWidth / width,
            wrapper.clientHeight / height,
            1
        );
        demoIframeContainer.style.transform = `scale(${scale})`;
    });
}

export function showRecordingView() {
    if (recordingView) {
        recordingView.classList.remove('hidden');
        applyDemoResolution();
    }
}

export function hideRecordingView() {
    if (recordingView) {
        recordingView.classList.add('hidden');
    }
}

export function initRecorderView() {
    if (closeRecordingViewBtn) {
        closeRecordingViewBtn.addEventListener('click', hideRecordingView);
    }

    if (recordingView) {
        recordingView.addEventListener('click', (event) => {
            if (event.target === recordingView) {
                hideRecordingView();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && recordingView && !recordingView.classList.contains('hidden')) {
            hideRecordingView();
        }
    });

    window.addEventListener('resize', () => {
        if (recordingView && !recordingView.classList.contains('hidden')) {
            applyDemoResolution();
        }
    });
}