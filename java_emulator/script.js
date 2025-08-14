// Ожидаем полной загрузки DOM перед тем, как начать работать со скриптом
document.addEventListener('DOMContentLoaded', () => {

    // --- Глобальные переменные и состояние ---
    let currentJarFile = null;
    let currentAppletWidth = 240;
    let currentAppletHeight = 320;
    let lastStatusMessage = 'Эмулятор не инициализирован.';

    // --- Получение ссылок на DOM-элементы ---
    const appletContainer = document.getElementById('applet_container');
    const statusOverlay = document.querySelector('.status-overlay');
    const statusMessage = document.getElementById('status-message');
    const loader = document.getElementById('loader');
    
    // Элементы управления
    const jarUploadInput = document.getElementById('jar-upload');
    const jarUploadLabel = document.getElementById('jar-upload-label');
    const resolutionSelect = document.getElementById('resolution-select');
    const customResolutionFields = document.getElementById('custom-resolution-fields');
    const customWidthInput = document.getElementById('custom-width');
    const customHeightInput = document.getElementById('custom-height');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomValueSpan = document.getElementById('zoom-value');
    const restartBtn = document.getElementById('restart-btn');
    const phoneButtons = document.querySelectorAll('.phone-button');
    const emulatorContainer = document.querySelector('.emulator-container');
    
    // Элементы модального окна
    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const infoModalText = document.getElementById('info-modal-text');
    const closeButton = document.querySelector('.close-button');

    // --- Основная логика эмулятора ---

    async function loadEmulator() {
        if (!currentJarFile) {
            updateStatus('Пожалуйста, загрузите JAR-файл', false);
            return;
        }

        const oldCanvas = appletContainer.querySelector('canvas');
        if (oldCanvas) oldCanvas.remove();
        const oldCheerpjContainer = appletContainer.querySelector('.cheerpj-container');
        if(oldCheerpjContainer) oldCheerpjContainer.remove();

        appletContainer.style.width = `${currentAppletWidth}px`;
        appletContainer.style.height = `${currentAppletHeight}px`;

        updateStatus('Загрузка игры...', true);
        restartBtn.classList.add('hidden');

        try {
            await cheerpjRun({
                jar: "https://cjrtnc.leaningtech.com/j2me/cheerpj-j2me-runner.jar",
                mounts: [{ fs: "files", path: "/app/", files: [currentJarFile] }],
                java_args: [`-jar /app/${currentJarFile.name}`],
                target: appletContainer,
                width: currentAppletWidth,
                height: currentAppletHeight,
                disableCheerpjLoader: true, 
            });
            console.log('Эмулятор успешно загружен.');
            updateStatus(`Игра "${currentJarFile.name}" успешно запущена.`, false);
            restartBtn.classList.remove('hidden');
        } catch (error) {
            console.error('Ошибка при загрузке эмулятора:', error);
            updateStatus(`Ошибка загрузки: ${error.message}. Проверьте консоль для деталей.`, false);
            restartBtn.classList.remove('hidden');
        }
    }

    function updateStatus(message, showLoader) {
        if (message) {
            statusMessage.textContent = message;
            lastStatusMessage = message; // Сохраняем последнее сообщение
            statusOverlay.classList.remove('hidden');
        } else {
            statusOverlay.classList.add('hidden');
        }
        loader.classList.toggle('hidden', !showLoader);
    }

    // --- Обработчики событий ---

    jarUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            currentJarFile = file;
            loadEmulator();
        }
    });

    function handleResolutionChange() {
        const value = resolutionSelect.value;
        if (value === 'custom') {
            customResolutionFields.classList.remove('hidden');
            currentAppletWidth = parseInt(customWidthInput.value, 10) || 240;
            currentAppletHeight = parseInt(customHeightInput.value, 10) || 320;
        } else {
            customResolutionFields.classList.add('hidden');
            const [width, height] = value.split('x').map(Number);
            currentAppletWidth = width;
            currentAppletHeight = height;
        }
        
        if (currentJarFile) {
            loadEmulator();
        } else {
            appletContainer.style.width = `${currentAppletWidth}px`;
            appletContainer.style.height = `${currentAppletHeight}px`;
        }
    }

    resolutionSelect.addEventListener('change', handleResolutionChange);
    customWidthInput.addEventListener('change', handleResolutionChange);
    customHeightInput.addEventListener('change', handleResolutionChange);

    zoomSlider.addEventListener('input', (event) => {
        const zoomLevel = event.target.value;
        zoomValueSpan.textContent = `${zoomLevel}%`;
        emulatorContainer.style.transform = `scale(${zoomLevel / 100})`;
    });

    restartBtn.addEventListener('click', loadEmulator);

    // --- Логика ввода ---

    function dispatchKeyEvent(key, keyCode, eventType) {
        const canvas = appletContainer.querySelector('canvas');
        if (canvas) {
            canvas.focus();
            const keyboardEvent = new KeyboardEvent(eventType, {
                key: key, keyCode: keyCode, which: keyCode,
                bubbles: true, cancelable: true,
            });
            canvas.dispatchEvent(keyboardEvent);
        }
    }

    phoneButtons.forEach(button => {
        const key = button.dataset.key;
        const keyCode = parseInt(button.dataset.keycode, 10);
        const startEvent = (e) => { e.preventDefault(); dispatchKeyEvent(key, keyCode, 'keydown'); };
        const endEvent = (e) => { e.preventDefault(); dispatchKeyEvent(key, keyCode, 'keyup'); };
        button.addEventListener('mousedown', startEvent);
        button.addEventListener('mouseup', endEvent);
        button.addEventListener('mouseleave', endEvent);
        button.addEventListener('touchstart', startEvent, { passive: false });
        button.addEventListener('touchend', endEvent, { passive: false });
    });
    
    const keyMap = {
        'ArrowUp': { key: 'ArrowUp', code: 38 }, 'ArrowDown': { key: 'ArrowDown', code: 40 },
        'ArrowLeft': { key: 'ArrowLeft', code: 37 }, 'ArrowRight': { key: 'ArrowRight', code: 39 },
        'Enter': { key: 'Enter', code: 13 }, 'Backspace': { key: 'Clear', code: 8 },
        'q': { key: 'SoftLeft', code: -6 }, 'e': { key: 'SoftRight', code: -7 },
        'c': { key: 'Clear', code: 8 },
    };

    document.addEventListener('keydown', (event) => {
        if(document.activeElement === customWidthInput || document.activeElement === customHeightInput) return;
        if (keyMap[event.key]) {
            event.preventDefault();
            dispatchKeyEvent(keyMap[event.key].key, keyMap[event.key].code, 'keydown');
        }
    });

    document.addEventListener('keyup', (event) => {
        if (keyMap[event.key]) {
            event.preventDefault();
            dispatchKeyEvent(keyMap[event.key].key, keyMap[event.key].code, 'keyup');
        }
    });

    // --- Логика модального окна ---
    infoBtn.addEventListener('click', () => {
        infoModalText.textContent = lastStatusMessage;
        infoModal.classList.remove('hidden');
    });

    closeButton.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target == infoModal) {
            infoModal.classList.add('hidden');
        }
    });

    // --- Инициализация ---
    async function initialize() {
        updateStatus('Инициализация эмулятора...', true);
        try {
            await cheerpjInit();
            console.log('Среда выполнения CheerpJ инициализирована.');
            jarUploadInput.disabled = false;
            jarUploadLabel.classList.remove('disabled');
            updateStatus('Эмулятор готов. Пожалуйста, загрузите JAR-файл.', false);
        } catch (error) {
            console.error('Ошибка при инициализации CheerpJ:', error);
            // ИЗМЕНЕНО: Добавлено более детальное сообщение об ошибке
            const detailedMessage = `Критическая ошибка: не удалось загрузить библиотеку.
            Причина: ${error.message}.
            Возможные решения: Проверьте интернет-соединение или отключите блокировщик рекламы и обновите страницу.`;
            updateStatus(detailedMessage, false);
        }
    }
    
    handleResolutionChange();
    initialize();
});
