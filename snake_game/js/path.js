// --- Path Management Logic ---
async function loadPathsFromFile() {
    try {
        const response = await fetch(PATHS_FILE);
        if (response.ok) {
            allPaths = await response.json();
            updatePathSelect();
        } else {
            console.log('paths.json not found, starting with an empty set of paths.');
            allPaths['default'] = {
                gridSize: 10,
                path: JSON.parse(defaultPath)
            };
            updatePathSelect();
        }
    } catch (error) {
        console.error('Error loading paths.json:', error);
    }
}

function updatePathSelect() {
    const selectedPathName = pathSelect.value;
    pathSelect.innerHTML = '';
    const compatiblePaths = Object.keys(allPaths).filter(pathName => allPaths[pathName].gridSize == GRID_SIZE);
    if (compatiblePaths.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Нет путей для этой сетки";
        pathSelect.appendChild(option);
        pathSelect.disabled = true;
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Выберите путь...";
        pathSelect.appendChild(defaultOption);
        compatiblePaths.forEach(pathName => {
            const option = document.createElement('option');
            option.value = pathName;
            option.textContent = pathName;
            pathSelect.appendChild(option);
        });
        pathSelect.disabled = false;
    }
    if (selectedPathName && compatiblePaths.includes(selectedPathName)) {
        pathSelect.value = selectedPathName;
    }
}

function savePathsToFile() {
    const data = JSON.stringify(allPaths, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = PATHS_FILE;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}
