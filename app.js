document.addEventListener("DOMContentLoaded", function(){
  initDB()
    .then(function(){
      showPage("accueil");
      loadMeds();
      loadRdv();
      loadSuivi();
    })
    .catch(function(err){
      console.log("Erreur init DB", err);
      alert("Erreur de démarrage : " + (err && err.message ? err.message : err));
    });
});

function showPage(page){
  document.querySelectorAll(".page").forEach(function(p){
    p.classList.add("hidden");
  });
  let target = document.getElementById(page);
  if(target){
    target.classList.remove("hidden");
  }
}

// ===== MEDICAMENTS =====

function addMed(){
  let nom = document.getElementById("medNom").value.trim();
  let dose = document.getElementById("medDose").value.trim();

  if(!nom){
    alert("Entrez un nom de médicament.");
    return;
  }

  addData("medicaments", { nom: nom, dose: dose, fait: false })
    .then(function(){
      document.getElementById("medNom").value = "";
      document.getElementById("medDose").value = "";
      loadMeds();
    })
    .catch(function(err){
      alert("Erreur ajout médicament : " + err.message);
    });
}

function loadMeds(){
  getData("medicaments").then(function(items){
    let list = document.getElementById("medList");
    list.innerHTML = "";

    items.forEach(function(item){
      let div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <input type="checkbox" class="check" ${item.fait ? "checked" : ""}>
        <div>
          <b>${item.nom}</b>
          <div class="small">${item.dose}</div>
        </div>
        <button>Supprimer</button>
      `;

      div.querySelector("button").addEventListener("click", function(){
        deleteData("medicaments", item.id).then(loadMeds);
      });

      div.querySelector(".check").addEventListener("change", function(e){
        item.fait = e.target.checked;
        addData("medicaments", item);
      });

      list.appendChild(div);
    });
  });
}

// ===== RENDEZ-VOUS =====

function addRdv(){
  let nom = document.getElementById("rdvNom").value.trim();
  let date = document.getElementById("rdvDate").value;
  let heure = document.getElementById("rdvHeure").value;

  if(!nom || !date){
    alert("Entrez un nom et une date.");
    return;
  }

  addData("rdv", { nom: nom, date: date, heure: heure })
    .then(function(){
      document.getElementById("rdvNom").value = "";
      document.getElementById("rdvDate").value = "";
      document.getElementById("rdvHeure").value = "";
      loadRdv();
    })
    .catch(function(err){
      alert("Erreur ajout rendez-vous : " + err.message);
    });
}

function loadRdv(){
  getData("rdv").then(function(items){
    let list = document.getElementById("rdvList");
    list.innerHTML = "";

    items.forEach(function(item){
      let div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <b>${item.nom}</b>
          <div class="small">${item.date} ${item.heure || ""}</div>
        </div>
        <button>Supprimer</button>
      `;

      div.querySelector("button").addEventListener("click", function(){
        deleteData("rdv", item.id).then(loadRdv);
      });

      list.appendChild(div);
    });
  });
}

// ===== SUIVI SANTE =====

function addSuivi(){
  let texte = document.getElementById("suiviTexte").value.trim();

  if(!texte){
    alert("Entrez une mesure.");
    return;
  }

  let date = new Date().toLocaleDateString("fr-FR");

  addData("suivi", { texte: texte, date: date })
    .then(function(){
      document.getElementById("suiviTexte").value = "";
      loadSuivi();
    })
    .catch(function(err){
      alert("Erreur ajout suivi : " + err.message);
    });
}

function loadSuivi(){
  getData("suivi").then(function(items){
    let list = document.getElementById("suiviList");
    list.innerHTML = "";

    items.forEach(function(item){
      let div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <b>${item.texte}</b>
          <div class="small">${item.date}</div>
        </div>
        <button>Supprimer</button>
      `;

      div.querySelector("button").addEventListener("click", function(){
        deleteData("suivi", item.id).then(loadSuivi);
      });

      list.appendChild(div);
    });
  });
}
