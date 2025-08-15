import { setStatusMessage } from './ui.js';
import { stopRecording, isRecording } from './lib/recorder.js';

const iframeContainer = document.getElementById('iframeContainer');

let isSiteLoaded = false;

export function createAndLoadIframe(container, url, isMain) {
    if (!container) return;
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.allow = "camera *; microphone *; autoplay; fullscreen *;";
    iframe.onload = () => {
        if (isMain) {
            const domain = new URL(url).hostname.replace(/^www\./, '');
            setStatusMessage(`Сайт ${domain} успешно загружен.`, 'success');
        }
    };
    iframe.onerror = () => {
        if (isMain) setStatusMessage(`Не удалось загрузить сайт. Пожалуйста, проверьте URL.`, 'error');
    };
    container.appendChild(iframe);
}

export function loadSite(ALLOWED_DOMAINS) {
    const urlInput = document.getElementById('urlInput');
    const loadBtn = document.getElementById('loadBtn');
    const url = urlInput.value.trim();

    if (!url) {
        setStatusMessage('Введите действительный URL-адрес.', 'error');
        return;
    }
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname.replace(/^www\./, '');
        if (ALLOWED_DOMAINS.includes(domain)) {
            resetSite();
            createAndLoadIframe(iframeContainer, url, true);
            isSiteLoaded = true;
            loadBtn.textContent = 'Сброс';
            urlInput.disabled = true;
        } else {
            setStatusMessage('Этот домен не разрешен для записи. Пожалуйста, выберите из списка.', 'error');
        }
    } catch (e) {
        setStatusMessage('Неверный формат URL-адреса. Введите полный URL.', 'error');
    }
}

export function resetSite() {
    const urlInput = document.getElementById('urlInput');
    const loadBtn = document.getElementById('loadBtn');

    iframeContainer.innerHTML = '';
    isSiteLoaded = false;
    loadBtn.textContent = 'Загрузить';
    urlInput.disabled = false;
    urlInput.value = '';
    setStatusMessage('Введите URL-адрес сайта и нажмите "Загрузить".', 'default');
    if (isRecording) stopRecording();
}

export function getIsSiteLoaded() {
    return isSiteLoaded;
}
