import { initRecorder } from './lib/recorder.js';
import { initRec } from './rec.js';
import { initUI, populateSiteList } from './ui.js';
import { loadSite, resetSite, getIsSiteLoaded } from './iframe.js';
import { initDB } from './history.js';
import { ALLOWED_DOMAINS, DOMAIN_ICONS } from './whitelist.js'; // Added this line

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
    initRec();

    // Initialize recorder
    initRecorder();

    // Initialize DB
    initDB();
});
