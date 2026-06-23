document.addEventListener("DOMContentLoaded", function(){
  initDB()
    .then(function(){
      showPage("profil");
      loadProfil();
      loadMedical();
      loadMeds();
      loadRdv();
      loadSuivi();
      loadContacts();
      loadOrdonnances();
    })
    .catch(function(err){
      alert("Erreur de démarrage : " + err);
    });
});

function showPage(page){
  document.querySelectorAll(".page").forEach(function(p){
    p.classList.add("hidden");
  });
  let target = document.getElementById(page);
  if(target){ target.classList.remove("hidden"); }
}


// ===== PROFIL =====

function loadProfil(){
  getData("profil").then(function(items){
    let formDiv = document.getElementById("profilForm");
    let ficheDiv = document.getElementById("profilFiche");

    if(items.length === 0){
      formDiv.classList.remove("hidden");
      ficheDiv.classList.add("hidden");
    } else {
      let p = items[0];
      formDiv.classList.add("hidden");
      ficheDiv.classList.remove("hidden");

      let age = "";
      if(p.dateNaissance){
        let diff = Date.now() - new Date(p.dateNaissance).getTime();
        age = Math.floor(diff / (1000*60*60*24*365.25)) + " ans";
      }

      ficheDiv.innerHTML = `
        <div class="profil-card">
          ${p.photo ? `<img src="${p.photo}" class="profil-photo" alt="Photo profil">` : `<div class="profil-photo-placeholder">👤</div>`}
          <h3>${p.prenom} ${p.nom}</h3>
          ${p.dateNaissance ? `<div class="small">🎂 ${p.dateNaissance} (${age})</div>` : ""}
          ${p.adresse ? `<div class="small">🏠 ${p.adresse}</div>` : ""}
          ${p.telephone ? `<div class="small">📞 <a href="tel:${p.telephone}">${p.telephone}</a></div>` : ""}
          ${p.email ? `<div class="small">✉️ ${p.email}</div>` : ""}
          ${p.contactUrgenceNom ? `<div class="small">🆘 ${p.contactUrgenceNom} — <a href="tel:${p.contactUrgenceTel}">${p.contactUrgenceTel}</a></div>` : ""}
        </div>
        <div class="btn-group">
          <button onclick="editProfil()">✏️ Modifier</button>
          <button class="btn-danger" onclick="confirmDeleteProfil()">🗑️ Supprimer</button>
        </div>
      `;
    }
  });
}

function editProfil(){
  getData("profil").then(function(items){
    if(items.length === 0) return;
    let p = items[0];
    document.getElementById("profilNom").value = p.nom || "";
    document.getElementById("profilPrenom").value = p.prenom || "";
    document.getElementById("profilDateNaissance").value = p.dateNaissance || "";
    document.getElementById("profilAdresse").value = p.adresse || "";
    document.getElementById("profilTelephone").value = p.telephone || "";
    document.getElementById("profilEmail").value = p.email || "";
    document.getElementById("profilContactUrgenceNom").value = p.contactUrgenceNom || "";
    document.getElementById("profilContactUrgenceTel").value = p.contactUrgenceTel || "";
    document.getElementById("profilForm").dataset.editId = p.id;
    document.getElementById("profilFiche").classList.add("hidden");
    document.getElementById("profilForm").classList.remove("hidden");
  });
}

function saveProfil(){
  let nom = document.getElementById("profilNom").value.trim();
  let prenom = document.getElementById("profilPrenom").value.trim();
  if(!nom && !prenom){ alert("Nom ou prénom obligatoire"); return; }

  let formDiv = document.getElementById("profilForm");
  let editId = formDiv.dataset.editId ? parseInt(formDiv.dataset.editId) : null;

  let file = document.getElementById("profilPhoto").files[0];

  function doSave(photoData){
    getData("profil").then(function(items){
      let data = {
        nom: nom,
        prenom: prenom,
        dateNaissance: document.getElementById("profilDateNaissance").value,
        adresse: document.getElementById("profilAdresse").value.trim(),
        telephone: document.getElementById("profilTelephone").value.trim(),
        email: document.getElementById("profilEmail").value.trim(),
        contactUrgenceNom: document.getElementById("profilContactUrgenceNom").value.trim(),
        contactUrgenceTel: document.getElementById("profilContactUrgenceTel").value.trim(),
        photo: photoData
      };

      if(editId){
        data.id = editId;
        // Si pas de nouvelle photo, garder l'ancienne
        if(!photoData && items.length > 0){ data.photo = items[0].photo; }
        putData("profil", data).then(function(){
          delete formDiv.dataset.editId;
          loadProfil();
        });
      } else {
        addData("profil", data).then(loadProfil);
      }
    });
  }

  if(file){
    if(!file.type.startsWith("image/")){ alert("JPG PNG WEBP uniquement"); return; }
    let reader = new FileReader();
    reader.onload = function(e){ doSave(e.target.result); };
    reader.readAsDataURL(file);
  } else {
    doSave("");
  }
}

function confirmDeleteProfil(){
  if(confirm("Supprimer le profil ?")){
    getData("profil").then(function(items){
      if(items.length > 0){
        deleteData("profil", items[0].id).then(loadProfil);
      }
    });
  }
}


// ===== INFORMATIONS MÉDICALES =====

function loadMedical(){
  getData("medical").then(function(items){
    let formDiv = document.getElementById("medicalForm");
    let ficheDiv = document.getElementById("medicalFiche");

    if(items.length === 0){
      formDiv.classList.remove("hidden");
      ficheDiv.classList.add("hidden");
    } else {
      let m = items[0];
      formDiv.classList.add("hidden");
      ficheDiv.classList.remove("hidden");

      ficheDiv.innerHTML = `
        <div class="item">
          ${m.groupeSanguin ? `<div><b>🩸 Groupe sanguin :</b> ${m.groupeSanguin}</div>` : ""}
          ${m.allergies ? `<div><b>⚠️ Allergies :</b> ${m.allergies}</div>` : ""}
          ${m.antecedents ? `<div><b>📋 Antécédents :</b> ${m.antecedents}</div>` : ""}
          ${m.maladies ? `<div><b>🏥 Maladies :</b> ${m.maladies}</div>` : ""}
          ${m.operations ? `<div><b>🔪 Opérations :</b> ${m.operations}</div>` : ""}
          ${m.medecinTraitant ? `<div><b>👨‍⚕️ Médecin :</b> ${m.medecinTraitant}</div>` : ""}
          ${m.medecinTel ? `<div><b>📞</b> <a href="tel:${m.medecinTel}">${m.medecinTel}</a></div>` : ""}
          ${m.notes ? `<div><b>📝 Notes :</b> ${m.notes}</div>` : ""}
        </div>
        <div class="btn-group">
          <button onclick="editMedical()">✏️ Modifier</button>
          <button class="btn-danger" onclick="confirmDeleteMedical()">🗑️ Supprimer</button>
        </div>
      `;
    }
  });
}

function editMedical(){
  getData("medical").then(function(items){
    if(items.length === 0) return;
    let m = items[0];
    document.getElementById("medicalGroupeSanguin").value = m.groupeSanguin || "";
    document.getElementById("medicalAllergies").value = m.allergies || "";
    document.getElementById("medicalAntecedents").value = m.antecedents || "";
    document.getElementById("medicalMaladies").value = m.maladies || "";
    document.getElementById("medicalOperations").value = m.operations || "";
    document.getElementById("medicalMedecinTraitant").value = m.medecinTraitant || "";
    document.getElementById("medicalMedecinTel").value = m.medecinTel || "";
    document.getElementById("medicalNotes").value = m.notes || "";
    document.getElementById("medicalForm").dataset.editId = m.id;
    document.getElementById("medicalFiche").classList.add("hidden");
    document.getElementById("medicalForm").classList.remove("hidden");
  });
}

function saveMedical(){
  let formDiv = document.getElementById("medicalForm");
  let editId = formDiv.dataset.editId ? parseInt(formDiv.dataset.editId) : null;

  let data = {
    groupeSanguin: document.getElementById("medicalGroupeSanguin").value.trim(),
    allergies: document.getElementById("medicalAllergies").value.trim(),
    antecedents: document.getElementById("medicalAntecedents").value.trim(),
    maladies: document.getElementById("medicalMaladies").value.trim(),
    operations: document.getElementById("medicalOperations").value.trim(),
    medecinTraitant: document.getElementById("medicalMedecinTraitant").value.trim(),
    medecinTel: document.getElementById("medicalMedecinTel").value.trim(),
    notes: document.getElementById("medicalNotes").value.trim()
  };

  if(editId){
    data.id = editId;
    putData("medical", data).then(function(){
      delete formDiv.dataset.editId;
      loadMedical();
    });
  } else {
    addData("medical", data).then(loadMedical);
  }
}

function confirmDeleteMedical(){
  if(confirm("Supprimer les informations médicales ?")){
    getData("medical").then(function(items){
      if(items.length > 0){
        deleteData("medical", items[0].id).then(loadMedical);
      }
    });
  }
}


// ===== MEDICAMENTS =====

function addMed(){
  let nom = document.getElementById("medNom").value.trim();
  let dose = document.getElementById("medDose").value.trim();
  if(!nom) return;
  addData("medicaments",{nom:nom, dose:dose, fait:false}).then(function(){
    document.getElementById("medNom").value="";
    document.getElementById("medDose").value="";
    loadMeds();
  });
}

function loadMeds(){
  getData("medicaments").then(function(items){
    let list = document.getElementById("medList");
    list.innerHTML="";
    items.forEach(function(i){
      list.innerHTML+=`
        <div class="item">
          <b>${i.nom}</b>
          <div class="small">${i.dose}</div>
          <button onclick="deleteData('medicaments',${i.id}).then(loadMeds)">Supprimer</button>
        </div>
      `;
    });
  });
}


// ===== RDV =====

function addRdv(){
  let nom = document.getElementById("rdvNom").value;
  let date = document.getElementById("rdvDate").value;
  let heure = document.getElementById("rdvHeure").value;
  if(!nom) return;
  addData("rdv",{nom:nom, date:date, heure:heure}).then(loadRdv);
}

function loadRdv(){
  getData("rdv").then(function(items){
    let list = document.getElementById("rdvList");
    list.innerHTML="";
    items.forEach(function(i){
      list.innerHTML+=`
        <div class="item">
          <b>${i.nom}</b>
          <div class="small">${i.date} ${i.heure||""}</div>
          <button onclick="deleteData('rdv',${i.id}).then(loadRdv)">Supprimer</button>
        </div>
      `;
    });
  });
}


// ===== SUIVI =====

function addSuivi(){
  let texte = document.getElementById("suiviTexte").value;
  let valeur = document.getElementById("suiviValeur").value;
  if(!texte) return;
  addData("suivi",{texte:texte, valeur:valeur, date:new Date().toLocaleDateString()}).then(loadSuivi);
}

function loadSuivi(){
  getData("suivi").then(function(items){
    let list = document.getElementById("suiviList");
    list.innerHTML="";
    items.forEach(function(i){
      list.innerHTML+=`
        <div class="item">
          <b>${i.texte} : ${i.valeur}</b>
          <div class="small">${i.date}</div>
        </div>
      `;
    });
  });
}


// ===== URGENCE =====

function addContact(){
  let nom = document.getElementById("contactNom").value;
  let tel = document.getElementById("contactTel").value;
  if(!nom) return;
  addData("contacts",{nom:nom, tel:tel}).then(loadContacts);
}

function loadContacts(){
  getData("contacts").then(function(items){
    let list = document.getElementById("contactList");
    list.innerHTML="";
    items.forEach(function(i){
      list.innerHTML+=`
        <div class="item">
          <b>${i.nom}</b>
          <div>${i.tel}</div>
          <a href="tel:${i.tel}">📞</a>
        </div>
      `;
    });
  });
}


// ===== ORDONNANCES =====

function addOrdonnance(){
  let nom = document.getElementById("ordonnanceNom").value.trim();
  let date = document.getElementById("ordonnanceDate").value;
  let file = document.getElementById("ordonnanceImage").files[0];
  if(!nom){ alert("Nom ordonnance obligatoire"); return; }
  if(file){
    if(!file.type.startsWith("image/")){ alert("JPG PNG WEBP uniquement"); return; }
    let reader = new FileReader();
    reader.onload = function(e){ saveOrdonnance(nom, date, e.target.result); };
    reader.readAsDataURL(file);
  } else {
    saveOrdonnance(nom, date, "");
  }
}

function saveOrdonnance(nom, date, image){
  addData("ordonnances",{nom:nom, date:date, image:image}).then(function(){
    document.getElementById("ordonnanceNom").value="";
    document.getElementById("ordonnanceDate").value="";
    document.getElementById("ordonnanceImage").value="";
    loadOrdonnances();
  });
}

function loadOrdonnances(){
  getData("ordonnances").then(function(items){
    let list = document.getElementById("ordonnanceList");
    list.innerHTML="";
    items.forEach(function(i){
      list.innerHTML+=`
        <div class="item">
          <b>${i.nom}</b>
          <div class="small">${i.date||""}</div>
          ${i.image ? `
            <div class="ordonnance-preview">
              <img src="${i.image}" class="miniatureOrdonnance" loading="lazy">
              <br>
              <a href="${i.image}" target="_blank">📷 Ouvrir</a>
            </div>
          ` : ""}
          <button onclick="deleteData('ordonnances',${i.id}).then(loadOrdonnances)">Supprimer</button>
        </div>
      `;
    });
  });
      }
  
