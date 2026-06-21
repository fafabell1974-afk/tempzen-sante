alert("TempZen JS chargé");
let dbReady = false;


// Démarrage

document.addEventListener("DOMContentLoaded", async () => {

    try {

        await initDB();

        dbReady = true;

        showPage("accueil");

        await refreshLists();

        console.log("TempZen OK");


    } catch (e) {

        console.error(e);

        document.querySelector(".app").innerHTML =
        "<h2>Erreur de démarrage</h2><p>"+e+"</p>";

    }

});




// Navigation

function showPage(page){


    document
    .querySelectorAll(".page")
    .forEach(p=>p.classList.add("hidden"));


    let element =
    document.getElementById(page);


    if(element){

        element.classList.remove("hidden");

    }

}






// =================
// MEDICAMENTS
// =================


async function addMed(){


    let nom =
    document.getElementById("medNom").value.trim();


    let dose =
    document.getElementById("medDose").value.trim();



    if(!nom){

        alert("Nom du médicament obligatoire");

        return;

    }



    await addData("medicaments",{

        name:nom,

        dose:dose,

        done:false,

        date:new Date().toLocaleDateString()

    });



    document.getElementById("medNom").value="";

    document.getElementById("medDose").value="";


    await refreshLists();


}






// =================
// RDV
// =================


async function addRdv(){


    let nom =
    document.getElementById("rdvNom").value.trim();


    let date =
    document.getElementById("rdvDate").value;


    let heure =
    document.getElementById("rdvHeure").value;



    if(!nom)return;



    await addData("rdv",{

        name:nom,

        date,

        heure,

        done:false

    });



    document.getElementById("rdvNom").value="";


    await refreshLists();

}






// =================
// SUIVI
// =================


async function addSuivi(){


    let texte =
    document.getElementById("suiviTexte").value.trim();



    if(!texte)return;



    await addData("suivi",{

        text:texte,

        date:new Date().toLocaleDateString(),

        done:false

    });



    document.getElementById("suiviTexte").value="";


    await refreshLists();

}







// =================
// AFFICHAGE
// =================


async function refreshLists(){


    if(!dbReady)return;



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
    ${m.done ? "checked":""}>


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
    type="checkbox">


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
    type="checkbox">


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

    await refreshLists();

        }
