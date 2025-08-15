
const siteList = document.getElementById('siteList');
const sidebar = document.getElementById('sidebar');
export function setStatusMessage(message, type = 'default') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    if (type === 'error') statusMessage.classList.add('status-error');
    else if (type === 'success') statusMessage.classList.add('status-success');
    else if (type === 'info') statusMessage.classList.add('status-info');
}

export function populateSiteList(ALLOWED_DOMAINS, DOMAIN_ICONS, loadSite) {
    siteList.innerHTML = '';
    ALLOWED_DOMAINS.forEach(domain => {
        const li = document.createElement('li');
        li.dataset.url = `https://${domain}`;
        const iconUrl = DOMAIN_ICONS[domain] || `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
        li.innerHTML = `
            <img src="${iconUrl}" alt="Иконка ${domain}" width="32" height="32" onerror="this.onerror=null;this.src='https.placehold.co/32x32/FF8C00/FFFFFF?text=${domain.charAt(0).toUpperCase()}'">
            <span>${domain}</span>
        `;
        li.addEventListener('click', () => {
            document.getElementById('urlInput').value = li.dataset.url;
            loadSite();
        });
        siteList.appendChild(li);
    });
}



export function initUI(loadSite) {
    const settingsBtn = document.getElementById('settingsBtn');
    const toListBtn = document.getElementById('toListBtn');
    const loadBtn = document.getElementById('loadBtn');

    settingsBtn.addEventListener('click', () => sidebar.classList.add('show-settings'));
    toListBtn.addEventListener('click', () => sidebar.classList.remove('show-settings'));
    loadBtn.addEventListener('click', loadSite);

    
}
