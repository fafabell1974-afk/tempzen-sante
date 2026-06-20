function toggleMenu() {
  document.getElementById('navDropdown').classList.toggle('open');
}

function setView(view) {
  const sections = {
    accueil: null,
    rdv: document.getElementById('section-rdv'),
    medicaments: document.getElementById('section-medicaments'),
    suivi: document.getElementById('section-suivi'),
    urgence: document.getElementById('section-urgence')
  };

  Object.values(sections).forEach(el => {
    if (el) el.classList.add('hidden');
  });

  if (sections[view]) sections[view].classList.remove('hidden');

  document.querySelectorAll('.footer-nav button').forEach(btn => btn.classList.remove('active'));
  const map = { accueil: 0, rdv: 1, medicaments: 2, suivi: 3, urgence: 4 };
  document.querySelectorAll('.footer-nav button')[map[view]]?.classList.add('active');

  document.getElementById('navDropdown').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fmtDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR');
}

async function refreshAll() {
  const rdv = await getAll('rdv');
  const meds = await getAll('medicaments');
  const suivi = await getAll('suivi');

  document.getElementById('rdvList').innerHTML = rdv.length
    ? rdv.map(i => `
      <div class="item">
        <div class="item-top">
          <div>
            <h4>${i.title || 'Rendez-vous'}</h4>
            <p>${i.date ? fmtDate(i.date) : 'Date non définie'}</p>
            ${i.note ? `<span class="pill">${i.note}</span>` : ''}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-danger" onclick="removeItem('rdv', ${i.id})">Supprimer</button>
        </div>
      </div>
    `).join('')
    : '<p style="color:#5c6b7a">Aucun rendez-vous ajouté.</p>';

  document.getElementById('medList').innerHTML = meds.length
    ? meds.map(i => `
      <div class="item">
        <div class="item-top">
          <div>
            <h4>${i.name || 'Médicament'}</h4>
            <p>${i.dose || ''}</p>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-danger" onclick="removeItem('medicaments', ${i.id})">Supprimer</button>
        </div>
      </div>
    `).join('')
    : '<p style="color:#5c6b7a">Aucun médicament ajouté.</p>';

  document.getElementById('suiviList').innerHTML = suivi.length
    ? suivi.map(i => `
      <div class="item">
        <div class="item-top">
          <div>
            <h4>${i.type || 'Suivi'}</h4>
            <p>${i.value || ''}</p>
            <span class="pill">${i.date ? fmtDate(i.date) : ''}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-danger" onclick="removeItem('suivi', ${i.id})">Supprimer</button>
        </div>
      </div>
    `).join('')
    : '<p style="color:#5c6b7a">Aucune mesure ajoutée.</p>';
}

async function saveRdv() {
  const title = document.getElementById('rdvTitle').value.trim();
  const date = document.getElementById('rdvDate').value;
  const note = document.getElementById('rdvNote').value.trim();

  if (!title && !date && !note) return;

  await addData('rdv', { title, date, note, createdAt: new Date().toISOString() });
  document.getElementById('rdvTitle').value = '';
  document.getElementById('rdvDate').value = '';
  document.getElementById('rdvNote').value = '';
  await refreshAll();
}

async function saveMed() {
  const name = document.getElementById('medName').value.trim();
  const dose = document.getElementById('medDose').value.trim();

  if (!name && !dose) return;

  await addData('medicaments', { name, dose, createdAt: new Date().toISOString() });
  document.getElementById('medName').value = '';
  document.getElementById('medDose').value = '';
  await refreshAll();
}

async function saveSuivi() {
  const type = document.getElementById('suiviType').value;
  const value = document.getElementById('suiviValue').value.trim();

  if (!value) return;

  await addData('suivi', { type, value, date: new Date().toISOString(), createdAt: new Date().toISOString() });
  document.getElementById('suiviValue').value = '';
  await refreshAll();
}

async function removeItem(store, id) {
  await deleteData(store, id);
  await refreshAll();
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await refreshAll();
    setView('accueil');
  } catch (e) {
    console.error(e);
  }
});
