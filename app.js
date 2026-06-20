// app.js

// --- Navigation ---
function toggleMenu() {
  document.getElementById('navDropdown').classList.toggle('open');
}

function setView(view) {
  const sections = {
    accueil: document.getElementById('accueil'),
    rdv: document.getElementById('section-rdv'),
    medicaments: document.getElementById('section-medicaments'),
    suivi: document.getElementById('section-suivi'),
    urgence: document.getElementById('section-urgence')
  };

  Object.values(sections).forEach(el => {
    if (el) el.classList.add('hidden');
  });

  if (sections[view]) sections[view].classList.remove('hidden');

  document.getElementById('navDropdown').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Formatage ---
function fmtDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR');
}

// --- Rafraîchissement des listes ---
async function refreshAll() {
  const rdv = await getAll('rdv');
  const meds = await getAll('medicaments');
  const suivi = await getAll('suivi');

  // Mise à jour RDV
  document.getElementById('rdvList').innerHTML = rdv.length 
    ? rdv.map(i => `
      <div class="item">
        <h4>${i.title || 'Rendez-vous'}</h4>
        <p>${i.date ? fmtDate(i.date) : ''}</p>
        <button class="btn btn-danger" onclick="removeItem('rdv', ${i.id})">Supprimer</button>
      </div>`).join('') 
    : '<p>Aucun rendez-vous.</p>';

  // Mise à jour Médicaments
  document.getElementById('medList').innerHTML = meds.length 
    ? meds.map(i => `
      <div class="item">
        <h4>${i.name || 'Médicament'}</h4>
        <p>${i.dose || ''}</p>
        <button class="btn btn-danger" onclick="removeItem('medicaments', ${i.id})">Supprimer</button>
      </div>`).join('') 
    : '<p>Aucun médicament.</p>';

  // Mise à jour Suivi
  document.getElementById('suiviList').innerHTML = suivi.length 
    ? suivi.map(i => `
      <div class="item">
        <h4>${i.type || 'Suivi'} : ${i.value || ''}</h4>
        <p>${i.date ? fmtDate(i.date) : ''}</p>
        <button class="btn btn-danger" onclick="removeItem('suivi', ${i.id})">Supprimer</button>
      </div>`).join('') 
    : '<p>Aucune mesure.</p>';
}

// --- Sauvegarde ---
async function saveRdv() {
  const title = document.getElementById('rdvTitle').value.trim();
  const date = document.getElementById('rdvDate').value;
  const note = document.getElementById('rdvNote').value.trim();
  if (!title) return;
  await addData('rdv', { title, date, note });
  document.getElementById('rdvTitle').value = '';
  document.getElementById('rdvDate').value = '';
  document.getElementById('rdvNote').value = '';
  await refreshAll();
}

async function saveMed() {
  const name = document.getElementById('medName').value.trim();
  const dose = document.getElementById('medDose').value.trim();
  if (!name) return;
  await addData('medicaments', { name, dose });
  document.getElementById('medName').value = '';
  document.getElementById('medDose').value = '';
  await refreshAll();
}

async function saveSuivi() {
  const type = document.getElementById('suiviType').value;
  const value = document.getElementById('suiviValue').value.trim();
  if (!value) return;
  await addData('suivi', { type, value, date: new Date().toISOString() });
  document.getElementById('suiviValue').value = '';
  await refreshAll();
}

// --- Suppression ---
async function removeItem(store, id) {
  await deleteData(store, id);
  await refreshAll();
}

// --- Initialisation ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await refreshAll();
    setView('accueil');
  } catch (e) {
    console.error("Erreur d'initialisation :", e);
  }
});
