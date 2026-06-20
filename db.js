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
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR');
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function renderEmpty(msg) {
  return `<p style="color:#5c6b7a">${msg}</p>`;
}

async function refreshAll() {
  const rdvList = document.getElementById('rdvList');
  const medList = document.getElementById('medList');
  const suiviList = document.getElementById('suiviList');

  const rdv = await getAll('rdv');
  const meds = await getAll('medicaments');
  const suivi = await getAll('suivi');

  rdv.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  rdvList.innerHTML = rdv.length ? rdv.map(i => `
    <div class="item">
      <div class="item-top">
        <div>
          <h4>${escapeHtml(i.title || 'Rendez-vous')}</h4>
          <p>${i.date ? fmtDate(i.date) : 'Date non définie'}</p>
          ${i.note ? `<span class="pill">${escapeHtml(i.note)}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="removeItem('rdv', ${i.id})">Supprimer</button>
      </div>
    </div>
  `).join('') : renderEmpty('Aucun rendez-vous ajouté.');

  medList.innerHTML = meds.length ? meds.map(i => `
    <div class="item">
      <div class="item-top">
        <div>
          <h4>${escapeHtml(i.name || 'Médicament')}</h4>
          <p>${escapeHtml(i.dose || '')}</p>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="removeItem('medicaments', ${i.id})">Supprimer</button>
      </div>
    </div>
  `).join('') : renderEmpty('Aucun médicament ajouté.');

  suiviList.innerHTML = suivi.length ? suivi.map(i => `
    <div class="item">
      <div class="item-top">
        <div>
          <h4>${escapeHtml(i.type || 'Suivi')}</h4>
          <p>${escapeHtml(i.value || '')}</p>
          <span class="pill">${i.date ? fmtDate(i.date) : ''}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger" onclick="removeItem('suivi', ${i.id})">Supprimer</button>
      </div>
    </div>
  `).join('') : renderEmpty('Aucune mesure ajoutée.');
}

async function saveRdv() {
  try {
    const title = document.getElementById('rdvTitle').value.trim();
    const date = document.getElementById('rdvDate').value;
    const note = document.getElementById('rdvNote').value.trim();
    if (!title && !date && !note) return;
    await addData('rdv', { title, date, note, createdAt: new Date().toISOString() });
    document.getElementById('rdvTitle').value = '';
    document.getElementById('rdvDate').value = '';
    document.getElementById('rdvNote').value = '';
    await refreshAll();
  } catch (e) {
    console.error('saveRdv failed', e);
    alert('Impossible d’ajouter le rendez-vous. Regarde la console.');
  }
}

async function saveMed() {
  try {
    const name = document.getElementById('medName').value.trim();
    const dose = document.getElementById('medDose').value.trim();
    if (!name && !dose) return;
    await addData('medicaments', { name, dose, createdAt: new Date().toISOString() });
    document.getElementById('medName').value = '';
    document.getElementById('medDose').value = '';
    await refreshAll();
  } catch (e) {
    console.error('saveMed failed', e);
    alert('Impossible d’ajouter le médicament. Regarde la console.');
  }
}

async function saveSuivi() {
  try {
    const type = document.getElementById('suiviType').value;
    const value = document.getElementById('suiviValue').value.trim();
    if (!value) return;
    await addData('suivi', { type, value, date: new Date().toISOString(), createdAt: new Date().toISOString() });
    document.getElementById('suiviValue').value = '';
    await refreshAll();
  } catch (e) {
    console.error('saveSuivi failed', e);
    alert('Impossible d’ajouter la mesure. Regarde la console.');
  }
}

async function removeItem(store, id) {
  try {
    await deleteData(store, id);
    await refreshAll();
  } catch (e) {
    console.error('removeItem failed', e);
    alert('Impossible de supprimer. Regarde la console.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await refreshAll();
    setView('accueil');
  } catch (e) {
    console.error('Init failed', e);
    alert('La base locale ne démarre pas. Ouvre la console du navigateur.');
  }
});
