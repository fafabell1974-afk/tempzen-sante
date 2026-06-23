let db;

function initDB(){
  return new Promise((resolve,reject)=>{
    const request = indexedDB.open("TempZenDB",9);

    request.onupgradeneeded=function(event){
      db=event.target.result;

      if(!db.objectStoreNames.contains("medicaments")){
        db.createObjectStore("medicaments",{keyPath:"id",autoIncrement:true});
      }
      if(!db.objectStoreNames.contains("rdv")){
        db.createObjectStore("rdv",{keyPath:"id",autoIncrement:true});
      }
      if(!db.objectStoreNames.contains("suivi")){
        db.createObjectStore("suivi",{keyPath:"id",autoIncrement:true});
      }
      if(!db.objectStoreNames.contains("contacts")){
        db.createObjectStore("contacts",{keyPath:"id",autoIncrement:true});
      }
      if(!db.objectStoreNames.contains("ordonnances")){
        db.createObjectStore("ordonnances",{keyPath:"id",autoIncrement:true});
      }
      if(!db.objectStoreNames.contains("profil")){
        db.createObjectStore("profil",{keyPath:"id",autoIncrement:true});
      }
      if(!db.objectStoreNames.contains("medical")){
        db.createObjectStore("medical",{keyPath:"id",autoIncrement:true});
      }
    };

    request.onsuccess=function(event){
      db=event.target.result;
      resolve();
    };

    request.onerror=function(event){
      reject(event.target.error);
    };
  });
}

function addData(store,data){
  return new Promise((resolve,reject)=>{
    let transaction=db.transaction(store,"readwrite");
    let object=transaction.objectStore(store);
    let req=object.add(data);
    req.onerror=function(e){ reject(e.target.error); };
    transaction.oncomplete=function(){ resolve(); };
  });
}

function getData(store){
  return new Promise((resolve,reject)=>{
    let transaction=db.transaction(store,"readonly");
    let request=transaction.objectStore(store).getAll();
    request.onsuccess=function(){ resolve(request.result); };
    request.onerror=function(e){ reject(e.target.error); };
  });
}

function deleteData(store,id){
  return new Promise((resolve,reject)=>{
    let transaction=db.transaction(store,"readwrite");
    transaction.objectStore(store).delete(id);
    transaction.oncomplete=()=>resolve();
    transaction.onerror=e=>reject(e.target.error);
  });
}

function putData(store,data){
  return new Promise((resolve,reject)=>{
    let transaction=db.transaction(store,"readwrite");
    let object=transaction.objectStore(store);
    let req=object.put(data);
    req.onerror=function(e){ reject(e.target.error); };
    transaction.oncomplete=function(){ resolve(); };
  });
}
