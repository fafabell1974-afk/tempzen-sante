const DB_NAME = 'TempZenDB';
let db;

const initDB = () => {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 3);
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains('medicaments')) db.createObjectStore('medicaments', { keyPath: 'id', autoIncrement: true });
            if (!db.objectStoreNames.contains('suivi')) db.createObjectStore('suivi', { keyPath: 'id', autoIncrement: true });
            if (!db.objectStoreNames.contains('rdv')) db.createObjectStore('rdv', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = (e) => { 
            db = e.target.result; 
            resolve();
        };
    });
};

function addData(store, data) {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).add(data);
}

function getAll(store) {
    return new Promise(resolve => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result);
    });
}
