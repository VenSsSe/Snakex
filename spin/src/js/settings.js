export const appSettings = {
    videoFormat: 'mp4',
    demoResolution: '1920x1080',
    countdownEnabled: true,
};

function updateSettingsUI() {
    const toggleVideoFormatBtn = document.getElementById('toggleVideoFormatBtn');
    const demoResolutionSelect = document.getElementById('demoResolutionSelect');
    const toggleCountdownBtn = document.getElementById('toggleCountdownBtn');

    if (toggleVideoFormatBtn) {
        toggleVideoFormatBtn.textContent = appSettings.videoFormat.toUpperCase();
    }
    if (demoResolutionSelect) {
        demoResolutionSelect.value = appSettings.demoResolution;
    }
    if (toggleCountdownBtn) {
        toggleCountdownBtn.textContent = appSettings.countdownEnabled ? 'Вкл' : 'Выкл';
    }
}

function toggleVideoFormat() {
    appSettings.videoFormat = appSettings.videoFormat === 'mp4' ? 'webm' : 'mp4';
    updateSettingsUI();
}

function toggleCountdown() {
    appSettings.countdownEnabled = !appSettings.countdownEnabled;
    updateSettingsUI();
}

export function initSettings(showRecordingView, applyDemoResolution) {
    const toggleVideoFormatBtn = document.getElementById('toggleVideoFormatBtn');
    const showDemoBtn = document.getElementById('showDemoBtn');
    const demoResolutionSelect = document.getElementById('demoResolutionSelect');
    const toggleCountdownBtn = document.getElementById('toggleCountdownBtn');

    if (toggleVideoFormatBtn) {
        toggleVideoFormatBtn.addEventListener('click', toggleVideoFormat);
    }
    if (showDemoBtn) {
        showDemoBtn.addEventListener('click', () => {
            const isSiteLoaded = !!document.querySelector('#iframeContainer iframe');
            if (isSiteLoaded) {
                showRecordingView();
            } else {
                alert('Сначала загрузите сайт, чтобы открыть предпросмотр.');
            }
        });
    }
    if (demoResolutionSelect) {
        demoResolutionSelect.addEventListener('change', (event) => {
            appSettings.demoResolution = event.target.value;
            applyDemoResolution();
        });
    }
    if (toggleCountdownBtn) {
        toggleCountdownBtn.addEventListener('click', toggleCountdown);
    }

    updateSettingsUI();
}