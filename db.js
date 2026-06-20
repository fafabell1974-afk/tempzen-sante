const DB_NAME = 'TempZenDB';
const DB_VERSION = 1;
let db;

const initDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (e) => {
    const database = e.target.result;
    if (!database.objectStoreNames.contains('medicaments')) {
      database.createObjectStore('medicaments', { keyPath: 'id', autoIncrement: true });
    }
    if (!database.objectStoreNames.contains('suivi')) {
      database.createObjectStore('suivi', { keyPath: 'id', autoIncrement: true });
    }
    if (!database.objectStoreNames.contains('rdv')) {
      database.createObjectStore('rdv', { keyPath: 'id', autoIncrement: true });
    }
  };

  request.onsuccess = (e) => {
    db = e.target.result;
    resolve();
  };

  request.onerror = (e) => reject(e.target.error);
});

function addData(store, data) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(data);
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = (e) => reject(e.target.error);
  });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function deleteData(store, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}
