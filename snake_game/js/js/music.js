// --- Music Player Logic ---
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

audioUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (currentAudioFile) {
            URL.revokeObjectURL(currentAudioFile);
        }
        currentAudioFile = URL.createObjectURL(file);
        audioPlayer.src = currentAudioFile;
        trackNameDisplay.textContent = file.name;
        audioPlayer.play();
    }
});

playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.src) {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    }
});

volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
});

audioPlayer.addEventListener('play', () => {
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
});

audioPlayer.addEventListener('pause', () => {
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
});

audioPlayer.addEventListener('ended', () => {
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
});

audioPlayer.addEventListener('loadedmetadata', () => {
    seekSlider.max = audioPlayer.duration;
    durationDisplay.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', () => {
    seekSlider.value = audioPlayer.currentTime;
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
});

seekSlider.addEventListener('input', (e) => {
    if(audioPlayer.src) {
        audioPlayer.currentTime = e.target.value;
    }
});
