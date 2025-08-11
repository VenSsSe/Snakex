function showModal(message) {
    modal.textContent = message;
    modal.classList.add('show');
    setTimeout(() => {
        modal.classList.remove('show');
    }, 3000);
}

function updateFinishTargetPosition() {
    const index = parseInt(finishPositionSlider.value, 10);
    finishPositionDisplay.textContent = finishPositionNames[index];
    switch (index) {
        case 0: targetFinishX = 0; targetFinishY = 0; break;
        case 1: targetFinishX = GRID_SIZE - 1; targetFinishY = 0; break;
        case 2: targetFinishX = Math.floor(GRID_SIZE / 2); targetFinishY = Math.floor(GRID_SIZE / 2); break;
        case 3: targetFinishX = 0; targetFinishY = GRID_SIZE - 1; break;
        case 4: targetFinishX = GRID_SIZE - 1; targetFinishY = GRID_SIZE - 1; break;
    }
}

function updateFadeDuration() {
    const value = parseInt(fadeSlider.value, 10);
    FADE_DURATION_FRAMES = value * (30/10);
    fadeDisplay.textContent = `${(value * 0.1).toFixed(1)} с`;
}
