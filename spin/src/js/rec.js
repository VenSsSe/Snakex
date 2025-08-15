import { populateHistoryList, createdUrls } from './history.js'; // Import createdUrls as well for cleanup

export const appSettings = {
    videoFormat: 'mp4',
    resolution: '1920x1080',
    countdownEnabled: true,
};

let isHistoryView = false; // New state variable

const recSettingsContent = document.getElementById('recSettingsContent');
const recHistoryContent = document.getElementById('recHistoryContent');
const recPanelTitle = document.getElementById('recPanelTitle');

function updateSettingsUI() {
    const toggleVideoFormatBtn = document.getElementById('toggleVideoFormatBtn');
    const resolutionSelect = document.getElementById('resolutionSelect');
    const toggleCountdownBtn = document.getElementById('toggleCountdownBtn');

    if (toggleVideoFormatBtn) {
        toggleVideoFormatBtn.textContent = appSettings.videoFormat.toUpperCase();
    }
    if (resolutionSelect) {
        resolutionSelect.value = appSettings.resolution;
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

function toggleRecView() {
    isHistoryView = !isHistoryView;

    if (isHistoryView) {
        recSettingsContent.classList.add('hidden');
        recHistoryContent.classList.remove('hidden');
        recPanelTitle.textContent = '🕒 История записей';
        populateHistoryList(); // Populate history when shown
    } else {
        recSettingsContent.classList.remove('hidden');
        recHistoryContent.classList.add('hidden');
        recPanelTitle.textContent = '🔴 Rec';
        // Clean up object URLs when leaving history view
        createdUrls.forEach(url => URL.revokeObjectURL(url));
        createdUrls.length = 0;
    }
}

export function initRec() {
    const toggleVideoFormatBtn = document.getElementById('toggleVideoFormatBtn');
    const resolutionSelect = document.getElementById('resolutionSelect');
    const toggleCountdownBtn = document.getElementById('toggleCountdownBtn');
    const toggleHistoryViewBtn = document.getElementById('toggleHistoryViewBtn'); // New button

    if (toggleVideoFormatBtn) {
        toggleVideoFormatBtn.addEventListener('click', toggleVideoFormat);
    }
    if (resolutionSelect) {
        resolutionSelect.addEventListener('change', (event) => {
            appSettings.resolution = event.target.value;
        });
    }
    if (toggleCountdownBtn) {
        toggleCountdownBtn.addEventListener('click', toggleCountdown);
    }
    if (toggleHistoryViewBtn) { // Add event listener for the new button
        toggleHistoryViewBtn.addEventListener('click', toggleRecView);
    }

    updateSettingsUI();
}
