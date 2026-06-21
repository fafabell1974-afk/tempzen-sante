let currentPage = "accueil";


document.addEventListener("DOMContentLoaded", async()=>{


await initDB();


showPage("accueil");


refreshLists();


});




// Navigation

function showPage(page){


document
.querySelectorAll(".page")
.forEach(p=>p.classList.add("hidden"));



document
.getElementById(page)
.classList.remove("hidden");


currentPage=page;


}





// Médicaments


async function addMed(){


let nom =
document.getElementById("medNom").value;


let dose =
document.getElementById("medDose").value;



if(!nom) return;



await addData("medicaments",{

name:nom,

dose:dose,

done:false,

date:new Date().toLocaleDateString()

});



document.getElementById("medNom").value="";

document.getElementById("medDose").value="";


refreshLists();

}





// Rendez-vous


async function addRdv(){


let nom =
document.getElementById("rdvNom").value;


let date =
document.getElementById("rdvDate").value;


let heure =
document.getElementById("rdvHeure").value;



if(!nom)return;



await addData("rdv",{

name:nom,

date:date,

heure:heure,

done:false

});



refreshLists();


}





// Suivi santé


async function addSuivi(){


let texte =
document.getElementById("suiviTexte").value;



if(!texte)return;



await addData("suivi",{

text:texte,

date:new Date().toLocaleDateString(),

done:false

});



document.getElementById("suiviTexte").value="";


refreshLists();


}






async function refreshLists(){



let meds =
await getData("medicaments");



let rdvs =
await getData("rdv");



let suivis =
await getData("suivi");





document.getElementById("medList").innerHTML =

meds.map(m=>`

<div class="item">

<input class="check"
type="checkbox"
${m.done?"checked":""}
onclick="toggleItem('medicaments',${m.id})">


<div>

<b>${m.name}</b>

<div class="small">
${m.dose}
</div>

</div>


<button onclick="removeItem('medicaments',${m.id})">
Supprimer
</button>


</div>

`).join("");







document.getElementById("rdvList").innerHTML =

rdvs.map(r=>`

<div class="item">

<input class="check"
type="checkbox"
${r.done?"checked":""}
onclick="toggleItem('rdv',${r.id})">


<div>

<b>${r.name}</b>

<div class="small">
${r.date} ${r.heure}
</div>

</div>


<button onclick="removeItem('rdv',${r.id})">
Supprimer
</button>


</div>

`).join("");







document.getElementById("suiviList").innerHTML =

suivis.map(s=>`

<div class="item">


<input class="check"
type="checkbox"
${s.done?"checked":""}
onclick="toggleItem('suivi',${s.id})">



<div>

<b>${s.text}</b>

<div class="small">
${s.date}
</div>


</div>


<button onclick="removeItem('suivi',${s.id})">
Supprimer
</button>


</div>


`).join("");



}





async function removeItem(store,id){


await deleteData(store,id);


refreshLists();


}






async function toggleItem(store,id){


let items =
await getData(store);



let item =
items.find(x=>x.id===id);



if(item){


item.done=!item.done;


let tx =
db.transaction(store,"readwrite");


tx.objectStore(store)
.put(item);



}


}
