let db;
export let createdUrls = [];

export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('RecordingHistoryDB', 1);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject('Database error');
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('recordings', { keyPath: 'id', autoIncrement: true });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };
    });
}

export function addRecording(blob, name) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['recordings'], 'readwrite');
        const store = transaction.objectStore('recordings');
        const recording = {
            name: name,
            date: new Date(),
            blob: blob
        };
        const request = store.add(recording);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error adding recording:', event.target.error);
            reject('Error adding recording');
        };
    });
}

export function getRecordings() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['recordings'], 'readonly');
        const store = transaction.objectStore('recordings');
        const request = store.openCursor(null, 'prev');
        const recordings = [];

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor && recordings.length < 5) {
                recordings.push(cursor.value);
                cursor.continue();
            } else {
                resolve(recordings);
            }
        };

        request.onerror = (event) => {
            console.error('Error getting recordings:', event.target.error);
            reject('Error getting recordings');
        };
    });
}

export async function populateHistoryList() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    createdUrls.forEach(url => URL.revokeObjectURL(url));
    createdUrls = [];

    const recordings = await getRecordings();

    if (recordings.length === 0) {
        historyList.innerHTML = '<li>No recordings found.</li>';
        return;
    }

    recordings.forEach(recording => {
        const li = document.createElement('li');
        const url = URL.createObjectURL(recording.blob);
        createdUrls.push(url);
        li.innerHTML = `
            <div>${recording.name}</div>
            <div>${recording.date.toLocaleString()}</div>
            <div class="history-item-actions">
                <a href="${url}" target="_blank" class="btn">View</a>
                <a href="${url}" download="${recording.name}" class="btn">Download</a>
            </div>
        `;
        historyList.appendChild(li);
    });
}


