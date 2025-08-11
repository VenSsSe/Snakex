// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBniVsX7k1dgELNUIFuPsN0fDXe2OY79Co",
  authDomain: "snakematrixai.firebaseapp.com",
  projectId: "snakematrixai",
  storageBucket: "snakematrixai.firebasestorage.app",
  messagingSenderId: "981820034809",
  appId: "1:981820034809:web:f9dd41e1d036b3ec119c28",
  measurementId: "G-LX7K63LJ2N"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let userDocRef = null;

// --- User and Settings Logic ---
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        userDocRef = db.collection('users').doc(currentUser.uid);
        loadSettings();
    } else {
        loadDefaultSettings();
    }
});

function saveSettings() {
    if (!userDocRef) return;
    const settings = {
        gridSize: gridSizeSlider.value,
        zoom: zoomSlider.value,
        fade: fadeSlider.value,
        finishPosition: finishPositionSlider.value,
        berryCount: berryCountSlider.value,
        minBerryDistance: minDistanceSlider.value,
        maxBerryDistance: maxDistanceSlider.value,
        recordFormat: formatWebmRadio.checked ? 'webm' : 'mp4',
        showPath: showPathCheckbox.checked,
        toggleHead: toggleHead.checked,
        toggleBerries: toggleBerries.checked,
        toggleTail: toggleTail.checked,
        toggleRainbow: toggleRainbowBorder.checked,
        rainbowThickness: rainbowBorderSlider.value,
        path: pathInput.value,
        backgroundImage: backgroundImage ? backgroundImage.src : null,
        coverImage: coverImage ? coverImage.src : null,
        snakeHeadImage: snakeHeadImage ? snakeHeadImage.src : null,
        berryImage: berryImage ? berryImage.src : null,
        // BG Volume
        toggleVolumeBg: toggleVolumeEffectBg.checked,
        volumeIntensityBg: volumeIntensitySliderBg.value,
        volumeStyleBg: volumeStyleSelectBg.value,
        // Cover Volume
        toggleVolumeCover: toggleVolumeEffectCover.checked,
        volumeIntensityCover: volumeIntensitySliderCover.value,
        volumeStyleCover: volumeStyleSelectCover.value,
    };
    userDocRef.set({ settings: settings }, { merge: true })
        .catch(error => console.error("Error saving settings: ", error));
}

function loadDefaultSettings() {
    pathInput.value = defaultPath;
    applyPathBtn.click();
    init();
    mainAnimationLoop();
    initialLoadComplete = true;
}

function loadSettings() {
    if (!userDocRef) return;
    userDocRef.get().then(doc => {
        if (doc.exists && doc.data().settings) {
            const s = doc.data().settings;
            gridSizeSlider.value = s.gridSize || 10;
            zoomSlider.value = s.zoom || 1;
            fadeSlider.value = s.fade || 1;
            finishPositionSlider.value = s.finishPosition || 2;
            berryCountSlider.value = s.berryCount || 1;
            minDistanceSlider.value = s.minBerryDistance || 3;
            maxDistanceSlider.value = s.maxBerryDistance || 13;
            formatWebmRadio.checked = s.recordFormat === 'webm';
            formatMp4Radio.checked = s.recordFormat !== 'webm';
            showPathCheckbox.checked = s.showPath || false;
            toggleHead.checked = s.toggleHead !== false;
            toggleBerries.checked = s.toggleBerries !== false;
            toggleTail.checked = s.toggleTail !== false;
            toggleRainbowBorder.checked = s.toggleRainbow || false;
            rainbowBorderSlider.value = s.rainbowThickness || 1;
            pathInput.value = s.path || defaultPath;

            // BG Volume
            toggleVolumeEffectBg.checked = s.toggleVolumeBg || false;
            volumeIntensitySliderBg.value = s.volumeIntensityBg || 20;
            volumeStyleSelectBg.value = s.volumeStyleBg || 'default';

            // Cover Volume
            toggleVolumeEffectCover.checked = s.toggleVolumeCover || false;
            volumeIntensitySliderCover.value = s.volumeIntensityCover || 20;
            volumeStyleSelectCover.value = s.volumeStyleCover || 'default';

            if (s.backgroundImage) handleImageURL(s.backgroundImage, 'image');
            if (s.coverImage) handleImageURL(s.coverImage, 'cover');
            if (s.snakeHeadImage) handleImageURL(s.snakeHeadImage, 'snake-head');
            if (s.berryImage) handleImageURL(s.berryImage, 'berry');
        } else {
            pathInput.value = defaultPath;
        }
    }).catch(error => {
        console.log("Error getting document:", error);
        pathInput.value = defaultPath;
    }).finally(() => {
        const allSliders = [gridSizeSlider, zoomSlider, fadeSlider, finishPositionSlider, berryCountSlider, minDistanceSlider, maxDistanceSlider, rainbowBorderSlider, volumeIntensitySliderBg, volumeIntensitySliderCover];
        const allCheckboxesAndRadios = [showPathCheckbox, toggleHead, toggleBerries, toggleTail, toggleRainbowBorder, formatWebmRadio, formatMp4Radio, toggleVolumeEffectBg, toggleVolumeEffectCover];
        const allSelects = [volumeStyleSelectBg, volumeStyleSelectCover];
        
        const inputEvent = new Event('input');
        const changeEvent = new Event('change');
        
        allSliders.forEach(el => el.dispatchEvent(inputEvent));
        allCheckboxesAndRadios.forEach(el => el.dispatchEvent(changeEvent));
        allSelects.forEach(el => el.dispatchEvent(changeEvent));
        
        if(pathInput.value) applyPathBtn.click();

        init();
        mainAnimationLoop();
        initialLoadComplete = true;
    });
}
