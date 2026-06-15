let deferredPrompt;

window.onload = async () => {
    await initDB();
    console.log("Base de données prête.");
};

// --- GESTION MÉDICAMENTS ---
async function ajouterMedoc() {
    const nom = document.getElementById('nomMedoc').value;
    const dose = document.getElementById('doseMedoc').value;
    if(nom && dose) {
        addData('medicaments', { nom, dose });
        document.getElementById('nomMedoc').value = '';
        document.getElementById('doseMedoc').value = '';
        chargerMedocs();
    }
}
async function chargerMedocs() {
    const data = await getAll('medicaments');
    const container = document.getElementById('listeMedocs');
    container.innerHTML = data.map(m => `<p>💊 ${m.nom} (${m.dose})</p>`).join('');
}

// --- GESTION SUIVI SANTÉ ---
async function ajouterSuivi() {
    const type = document.getElementById('typeMesure').value;
    const valeur = document.getElementById('valeurMesure').value;
    if(type && valeur) {
        addData('suivi', { type, valeur, date: new Date().toLocaleDateString() });
        document.getElementById('typeMesure').value = '';
        document.getElementById('valeurMesure').value = '';
        chargerSuivi();
    }
}
async function chargerSuivi() {
    const data = await getAll('suivi');
    const container = document.getElementById('listeSuivi');
    container.innerHTML = data.map(s => `<p>📊 ${s.date} : ${s.type} = ${s.valeur}</p>`).join('');
}

// --- GESTION RENDEZ-VOUS ---
async function ajouterRdv() {
    const motif = document.getElementById('motifRdv').value;
    const date = document.getElementById('dateRdv').value;
    if(motif && date) {
        addData('rdv', { motif, date });
        document.getElementById('motifRdv').value = '';
        document.getElementById('dateRdv').value = '';
        chargerRdv();
    }
}
async function chargerRdv() {
    const data = await getAll('rdv');
    const container = document.getElementById('listeRdv');
    container.innerHTML = data.map(r => {
        const dateObj = new Date(r.date);
        const dateLocale = dateObj.toLocaleDateString() + ' à ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return `<p>📅 ${dateLocale} : ${r.motif}</p>`;
    }).join('');
}
