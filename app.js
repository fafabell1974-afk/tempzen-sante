document.addEventListener("DOMContentLoaded", function(){

  initDB()
    .then(function(){
      showPage("accueil");
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

  document.querySelectorAll(".page")
  .forEach(p=>p.classList.add("hidden"));

  let target=document.getElementById(page);

  if(target){
    target.classList.remove("hidden");
  }

}




// ===== MEDICAMENTS =====

function addMed(){

let nom=document.getElementById("medNom").value.trim();
let dose=document.getElementById("medDose").value.trim();

if(!nom)return;


addData("medicaments",{
nom,
dose,
fait:false
})
.then(()=>{
document.getElementById("medNom").value="";
document.getElementById("medDose").value="";
loadMeds();
});

}



function loadMeds(){

getData("medicaments").then(items=>{

let list=document.getElementById("medList");
list.innerHTML="";


items.forEach(i=>{

list.innerHTML+=`

<div class="item">

<b>${i.nom}</b>

<div class="small">${i.dose}</div>

<button onclick="deleteData('medicaments',${i.id}).then(loadMeds)">
Supprimer
</button>

</div>

`;

});

});

}




// ===== RDV =====


function addRdv(){

let nom=document.getElementById("rdvNom").value;
let date=document.getElementById("rdvDate").value;
let heure=document.getElementById("rdvHeure").value;


if(!nom)return;


addData("rdv",{
nom,
date,
heure
})
.then(loadRdv);

}



function loadRdv(){

getData("rdv").then(items=>{

let list=document.getElementById("rdvList");

list.innerHTML="";


items.forEach(i=>{

list.innerHTML+=`

<div class="item">

<b>${i.nom}</b>

<div class="small">
${i.date} ${i.heure||""}
</div>

<button onclick="deleteData('rdv',${i.id}).then(loadRdv)">
Supprimer
</button>

</div>

`;

});

});

}





// ===== SUIVI =====


function addSuivi(){

let texte=document.getElementById("suiviTexte").value;
let valeur=document.getElementById("suiviValeur").value;


if(!texte)return;


addData("suivi",{
texte,
valeur,
date:new Date().toLocaleDateString()
})
.then(loadSuivi);

}



function loadSuivi(){

getData("suivi").then(items=>{

let list=document.getElementById("suiviList");

list.innerHTML="";


items.forEach(i=>{

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

let nom=document.getElementById("contactNom").value;
let tel=document.getElementById("contactTel").value;


if(!nom)return;


addData("contacts",{
nom,
tel
})
.then(loadContacts);

}



function loadContacts(){

getData("contacts").then(items=>{

let list=document.getElementById("contactList");

list.innerHTML="";


items.forEach(i=>{

list.innerHTML+=`

<div class="item">

<b>${i.nom}</b>

<div>${i.tel}</div>

<a href="tel:${i.tel}">
📞
</a>

</div>

`;

});

});

}





// ===== ORDONNANCES AVEC PHOTO =====


function addOrdonnance(){

let nom=document.getElementById("ordonnanceNom").value.trim();
let date=document.getElementById("ordonnanceDate").value;

let file=document.getElementById("ordonnanceImage").files[0];


if(!nom){
alert("Nom obligatoire");
return;
}



function save(image){

addData("ordonnances",{

nom,
date,
image:image || ""

})
.then(()=>{

document.getElementById("ordonnanceNom").value="";
document.getElementById("ordonnanceDate").value="";
document.getElementById("ordonnanceImage").value="";

loadOrdonnances();

});

}



if(file){

let reader=new FileReader();

reader.onload=function(e){

save(e.target.result);

};

reader.readAsDataURL(file);


}else{

save("");

}


}




function loadOrdonnances(){

getData("ordonnances").then(items=>{


let list=document.getElementById("ordonnanceList");

list.innerHTML="";


items.forEach(i=>{


list.innerHTML+=`

<div class="item">

<b>${i.nom}</b>

<div class="small">
${i.date || ""}
</div>


${i.image ? 
`<a href="${i.image}" target="_blank">
📷 Voir ordonnance
</a>` 
: ""}


<button onclick="deleteData('ordonnances',${i.id}).then(loadOrdonnances)">
Supprimer
</button>


</div>

`;

});


});


              }
