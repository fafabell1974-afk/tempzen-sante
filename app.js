document.addEventListener("DOMContentLoaded", function(){

    showPage("accueil");

});


function showPage(page){

    document
    .querySelectorAll(".page")
    .forEach(function(p){

        p.classList.add("hidden");

    });


    let target = document.getElementById(page);

    if(target){

        target.classList.remove("hidden");

    }

}


// TEST MEDICAMENT

function addMed(){

    let nom =
    document.getElementById("medNom").value;


    let dose =
    document.getElementById("medDose").value;


    document.getElementById("medList").innerHTML =
    `
    <div class="item">

    <input class="check" type="checkbox">

    <div>
    <b>${nom}</b>
    <div class="small">${dose}</div>
    </div>

    <button>
    Supprimer
    </button>

    </div>
    `;


}
