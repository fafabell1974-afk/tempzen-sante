const DB_NAME = 'TempZenDB';
let db;
const initDB = () => {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 4);
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains('medicaments')) db.createObjectStore('medicaments', { keyPath: 'id', autoIncrement: true });
            if (!db.objectStoreNames.contains('suivi')) db.createObjectStore('suivi', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(); };
    });
};
function addData(store, data) { return new Promise(resolve => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).add(data); tx.oncomplete = () => resolve(); }); }
function getAll(store) { return new Promise(resolve => { const tx = db.transaction(store, 'readonly'); const req = tx.objectStore(store).getAll(); req.onsuccess = () => resolve(req.result); }); }
function deleteData(store, id) { return new Promise(resolve => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).delete(id); tx.oncomplete = () => resolve(); }); }
