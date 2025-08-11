function initializeApp() {
    allPaths['default'] = {
        gridSize: 10,
        path: JSON.parse(defaultPath)
    };
    updatePathSelect();
    pathInput.value = defaultPath;
    applyPathBtn.click();
    init();
    mainAnimationLoop();
    initialLoadComplete = true;
}

initializeApp();
