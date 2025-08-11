function displayPreview(previewSrc, type, mediaElement) {
    const oldPreview = document.getElementById(`preview-${type}`);
    if (oldPreview) {
        const oldMediaElement = oldPreview.parentElement.dataset.mediaElement;
        if (oldMediaElement && oldMediaElement.tagName === 'VIDEO') {
            oldMediaElement.pause();
            URL.revokeObjectURL(oldMediaElement.src);
        }
        oldPreview.parentElement.remove();
    }
    const previewWrapper = document.createElement('div');
    previewWrapper.className = 'relative';
    previewWrapper.dataset.mediaElement = mediaElement;
    const previewImg = document.createElement('img');
    previewImg.src = previewSrc;
    previewImg.id = `preview-${type}`;
    previewImg.className = 'preview-img';
    if (mediaElement.tagName === 'VIDEO') {
        const videoIcon = document.createElement('i');
        videoIcon.className = 'fas fa-video absolute bottom-1 right-1 text-white text-xs bg-black bg-opacity-50 rounded-sm p-0.5';
        previewWrapper.appendChild(videoIcon);
    }
    previewWrapper.appendChild(previewImg);
    const placeholder = document.querySelector(`label[title*="${typeToTitle(type)}"]`);
    if (placeholder) {
        previewsContainer.insertBefore(previewWrapper, placeholder);
        placeholder.style.display = 'none';
    } else {
        previewsContainer.appendChild(previewWrapper);
    }
    let clickCount = 0;
    let clickTimeout = null;
    previewImg.addEventListener('click', () => {
        clickCount++;
        if (clickTimeout) clearTimeout(clickTimeout);
        if (clickCount === 1) {
            previewImg.classList.add('highlighted');
            clickTimeout = setTimeout(() => {
                previewImg.classList.remove('highlighted');
                clickCount = 0;
            }, 2000);
        } else if (clickCount === 2) {
            if (mediaElement.tagName === 'VIDEO') {
                mediaElement.pause();
                URL.revokeObjectURL(mediaElement.src);
            }
            previewWrapper.remove();
            if (placeholder) placeholder.style.display = 'flex';
            switch(type) {
                case 'image': backgroundImage = null; break;
                case 'cover': coverImage = null; break;
                case 'snake-head': snakeHeadImage = null; break;
                case 'berry': berryImage = null; berryPositions = []; resetGame(); break;
            }
            clickCount = 0;
        }
    });
}

function handleImageURL(url, type) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
        displayPreview(url, type, img);
        switch(type) {
            case 'image': backgroundImage = img; break;
            case 'cover': coverImage = img; break;
            case 'snake-head': snakeHeadImage = img; break;
            case 'berry': berryImage = img; resetGame(); break;
        }
        saveSettings();
    };
    img.onerror = () => {
        showModal('Не удалось загрузить изображение по URL.');
    };
}

function handleFileUpload(file, type) {
    if (!file) return;
    if (file.type.startsWith('video/')) {
        if (type !== 'image' && type !== 'cover') {
            showModal('Видео можно загружать только для фона и рубашки.');
            return;
        }
        const video = document.createElement('video');
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        const videoUrl = URL.createObjectURL(file);
        video.src = videoUrl;
        video.addEventListener('loadeddata', () => {
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 100;
            previewCanvas.height = 100;
            const previewCtx = previewCanvas.getContext('2d');
            previewCtx.drawImage(video, 0, 0, 100, 100);
            displayPreview(previewCanvas.toDataURL(), type, video);
            video.play().catch(e => console.error("Video play failed:", e));
            saveSettings();
        });
        video.addEventListener('error', () => showModal('Не удалось загрузить видео.'));
        switch(type) {
            case 'image': backgroundImage = video; break;
            case 'cover': coverImage = video; break;
        }
    } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            handleImageURL(e.target.result, type);
        };
        reader.readAsDataURL(file);
    } else {
        showModal('Неподдерживаемый тип файла.');
    }
}

function typeToTitle(type) {
    switch(type) {
        case 'image': return 'Добавить картинку';
        case 'cover': return 'Добавить рубашку';
        case 'snake-head': return 'Добавить голову змейки';
        case 'berry': return 'Добавить ягоду';
        default: return '';
    }
}
