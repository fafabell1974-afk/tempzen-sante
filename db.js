// db.js - Gestion de la base de données
let db;
const DB_NAME = 'TempZenDB';
const DB_VERSION = 1;

// Initialisation de la base
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

// Fonctions utilitaires
function getAll(storeName) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

function addData(storeName, data) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).add(data);
    transaction.oncomplete = () => resolve();
  });
}

function deleteData(storeName, id) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(id);
    transaction.oncomplete = () => resolve();
  });
}
