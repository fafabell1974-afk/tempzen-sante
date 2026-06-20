// db.js
let db;
const DB_NAME = 'TempZenDB';

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
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

async function getAll(store) {
  return new Promise(res => {
    const tx = db.transaction(store, 'readonly');
    tx.objectStore(store).getAll().onsuccess = (e) => res(e.target.result);
  });
}

async function addData(store, data) {
  return new Promise(res => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).add(data);
    tx.oncomplete = () => res();
  });
}

async function deleteData(store, id) {
  return new Promise(res => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => res();
  });
}
