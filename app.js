window.onload = async () => { await initDB(); };

async function ajouterMedoc() {
    const nom = document.getElementById('nomMedoc').value;
    const dose = document.getElementById('doseMedoc').value;
    if(nom && dose) { await addData('medicaments', { nom, dose }); showPage('medoc'); }
}

async function chargerMedocs() {
    const data = await getAll('medicaments');
    document.getElementById('listeMedocs').innerHTML = data.map(m => `
        <div style="border-bottom:1px solid #eee; padding:10px 0; display:flex; justify-content:space-between;">
            ${m.nom} (${m.dose}) <button onclick="supprimerEtRecharger('medicaments', ${m.id})" style="width:auto; padding:5px; background:#dc3545;">X</button>
        </div>`).join('');
}

async function ajouterSuivi() {
    const type = document.getElementById('typeMesure').value;
    const valeur = document.getElementById('valeurMesure').value;
    if(type && valeur) { await addData('suivi', { type, valeur, date: new Date().toLocaleDateString() }); showPage('suivi'); }
}

async function chargerSuivi() {
    const data = await getAll('suivi');
    document.getElementById('listeSuivi').innerHTML = data.map(s => `
        <div style="border-bottom:1px solid #eee; padding:10px 0; display:flex; justify-content:space-between;">
            ${s.date}: ${s.type} = ${s.valeur} <button onclick="supprimerEtRecharger('suivi', ${s.id})" style="width:auto; padding:5px; background:#dc3545;">X</button>
        </div>`).join('');
}

async function supprimerEtRecharger(store, id) {
    await deleteData(store, id);
    store === 'medicaments' ? showPage('medoc') : showPage('suivi');
}
