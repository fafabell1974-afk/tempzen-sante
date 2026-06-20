let db;
const DB_NAME = 'TempZenDB';
const DB_VERSION = 1;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      db = e.target.result;
      if (!db.objectStoreNames.contains('rdv')) db.createObjectStore('rdv', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('medicaments')) db.createObjectStore('medicaments', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('suivi')) db.createObjectStore('suivi', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = (e) => { db = e.target.result; resolve(); };
    request.onerror = (e) => reject(e.target.error);
  });
}

function getAll(storeName) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

function addData(storeName, data) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.add(data);
    transaction.oncomplete = () => resolve();
  });
}

function deleteData(storeName, id) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(id);
    transaction.oncomplete = () => resolve();
  });
}
