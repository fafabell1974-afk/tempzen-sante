window.onload = async () => { await initDB(); chargerMedocs(); chargerSuivi(); };

async function ajouterMedoc() {
    const nom = document.getElementById('nomMedoc').value;
    const dose = document.getElementById('doseMedoc').value;
    if(nom && dose) { await addData('medicaments', { nom, dose }); chargerMedocs(); }
}
async function chargerMedocs() {
    const data = await getAll('medicaments');
    document.getElementById('listeMedocs').innerHTML = data.map(m => `<p>💊 ${m.nom} (${m.dose})</p>`).join('');
}

async function ajouterSuivi() {
    const type = document.getElementById('typeMesure').value;
    const valeur = document.getElementById('valeurMesure').value;
    if(type && valeur) { await addData('suivi', { type, valeur, date: new Date().toLocaleDateString() }); chargerSuivi(); }
}
async function chargerSuivi() {
    const data = await getAll('suivi');
    document.getElementById('listeSuivi').innerHTML = data.map(s => `<p>📊 ${s.date} : ${s.type} = ${s.valeur}</p>`).join('');
}

async function genererVraiPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Carnet de Santé - TempZen", 20, 20);
    const medocs = await getAll('medicaments');
    let y = 40;
    medocs.forEach(m => { doc.text(`- ${m.nom} (${m.dose})`, 20, y); y += 10; });
    doc.save("Carnet_Sante_TempZen.pdf");
}
