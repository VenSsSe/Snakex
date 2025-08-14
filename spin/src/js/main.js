import { initRecorder } from './lib/recorder.js';
import { initSettings } from './settings.js';
import { initUI, populateSiteList } from './ui.js';
import { loadSite, resetSite, getIsSiteLoaded } from './iframe.js';
import { ALLOWED_DOMAINS, DOMAIN_ICONS } from './whitelist.js';
import { initRecorderView, showRecordingView, hideRecordingView, applyDemoResolution } from './components/recorder_view.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initUI(() => {
        if (getIsSiteLoaded()) {
            resetSite();
        } else {
            loadSite(ALLOWED_DOMAINS);
        }
    });
    populateSiteList(ALLOWED_DOMAINS, DOMAIN_ICONS, () => loadSite(ALLOWED_DOMAINS));

    // Initialize settings
    initSettings(showRecordingView, applyDemoResolution);

    // Initialize recorder view
    initRecorderView();

    // Initialize recorder
    initRecorder();
});
