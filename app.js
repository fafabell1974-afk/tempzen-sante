let dbReady = false;


// Démarrage

document.addEventListener("DOMContentLoaded", async () => {

    try {

        await initDB();

        dbReady = true;

        showPage("accueil");

        await refreshLists();

        console.log("TempZen démarré");

    } catch (e) {

        console.error("Erreur TempZen :", e);

        document.querySelector(".app").innerHTML = `
        <h2>Erreur de démarrage</h2>
        <p>${e}</p>
        `;

    }

});



// Navigation

function showPage(page) {


    document
    .querySelectorAll(".page")
    .forEach(section => {

        section.classList.add("hidden");

    });


    const target =
    document.getElementById(page);


    if(target){

        target.classList.remove("hidden");

    }

}



// Médicaments

async function addMed(){


    const nom =
    document.getElementById("medNom").value.trim();


    const dose =
    document.getElementById("medDose").value.trim();



    if(!nom) return;



    await addData("medicaments",{

        name: nom,

        dose: dose,

        done:false,

        date:new Date().toLocaleDateString()

    });



    document.getElementById("medNom").value="";
    document.getElementById("medDose").value="";


    await refreshLists();

}




// Rendez-vous


async function addRdv(){


    const nom =
    document.getElementById("rdvNom").value.trim();


    const date =
    document.getElementById("rdvDate").value;


    const heure =
    document.getElementById("rdvHeure").value;



    if(!nom) return;



    await addData("rdv",{

        name:nom,

        date,

        heure,

        done:false

    });



    document.getElementById("rdvNom").value="";


    await refreshLists();


}




// Suivi santé


async function addSuivi(){


    const texte =
    document.getElementById("suiviTexte").value.trim();



    if(!texte) return;



    await addData("suivi",{

        text:texte,

        date:new Date().toLocaleDateString(),

        done:false

    });



    document.getElementById("suiviTexte").value="";


    await refreshLists();

}





// Affichage listes

async function refreshLists(){


    if(!dbReady) return;



    const meds =
    await getData("medicaments");


    const rdvs =
    await getData("rdv");


    const suivis =
    await getData("suivi");




    document.getElementById("medList").innerHTML =

    meds.map(m=>`

    <div class="item">

    <input class="check"
    type="checkbox"
    ${m.done ? "checked":""}
    onclick="toggleItem('medicaments',${m.id})">


    <div>
    <b>${m.name}</b>
    <div class="small">${m.dose}</div>
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
    ${r.done ? "checked":""}
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
    ${s.done ? "checked":""}
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

    await refreshLists();

}





async function toggleItem(store,id){


    const items =
    await getData(store);



    const item =
    items.find(x=>x.id===id);



    if(item){


        item.done =
        !item.done;



        await addData(store,item);

        await refreshLists();


    }


}
