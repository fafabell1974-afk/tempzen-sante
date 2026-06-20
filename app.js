// app.js
function toggleMenu() { document.getElementById('navDropdown').classList.toggle('open'); }

function setView(view) {
  const sections = {
    accueil: document.getElementById('accueil'), // Note: Assurez-vous que accueil est bien une section
    rdv: document.getElementById('section-rdv'),
    medicaments: document.getElementById('section-medicaments'),
    suivi: document.getElementById('section-suivi'),
    urgence: document.getElementById('section-urgence')
  };

  Object.values(sections).forEach(el => { if (el) el.classList.add('hidden'); });
  if (sections[view]) sections[view].classList.remove('hidden');

  document.getElementById('navDropdown').classList.remove('open');
}

function fmtDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR');
}

async function refreshAll() {
  const rdv = await getAll('rdv');
  const meds = await getAll('medicaments');
  const suivi = await getAll('suivi');

  document.getElementById('rdvList').innerHTML = rdv.map(i => `
    <div class="item">
      <h4>${i.title}</h4><p>${fmtDate(i.date)}</p>
      <button class="btn btn-danger" onclick="removeItem('rdv', ${i.id})">Supprimer</button>
    </div>`).join('') || '<p>Aucun rendez-vous.</p>';
  
  // Répétez le pattern pour medList et suiviList...
}

async function saveRdv() {
  const title = document.getElementById('rdvTitle').value;
  const date = document.getElementById('rdvDate').value;
  const note = document.getElementById('rdvNote').value;
  if (!title) return;
  await addData('rdv', { title, date, note });
  await refreshAll();
}

async function removeItem(store, id) {
  await deleteData(store, id);
  await refreshAll();
}

document.addEventListener('DOMContentLoaded', async () => {
  await initDB();
  await refreshAll();
});
