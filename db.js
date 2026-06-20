let db;
const DB_NAME = 'TempZenDB';
const DB_VERSION = 5; // Augmenté à 5 pour écraser l'ancienne version

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      db = e.target.result;
      // Recréer les stores si nécessaire
      if (!db.objectStoreNames.contains('rdv')) db.createObjectStore('rdv', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('medicaments')) db.createObjectStore('medicaments', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('suivi')) db.createObjectStore('suivi', { keyPath: 'id', autoIncrement: true });
    };
    
    request.onsuccess = (e) => { 
      db = e.target.result; 
      resolve(); 
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

// Vérification de sécurité avant toute opération
function getDb() {
  if (!db) throw new Error("Base de données non initialisée");
  return db;
}

async function getAll(storeName) {
  return new Promise((resolve) => {
    const transaction = getDb().transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

async function addData(storeName, data) {
  return new Promise((resolve) => {
    const transaction = getDb().transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).add(data);
    transaction.oncomplete = () => resolve();
  });
}

async function deleteData(storeName, id) {
  return new Promise((resolve) => {
    const transaction = getDb().transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(id);
    transaction.oncomplete = () => resolve();
  });
}
