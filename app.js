/* ── TempZen — App Logic ── */

window.onload = async () => {
  await initDB();
  showPage('home');
};

/* ── Navigation ── */
function openMenu() {
  document.getElementById('sideMenu').style.width = '260px';
  document.getElementById('sideMenuOverlay').classList.add('active');
}

function closeMenu() {
  document.getElementById('sideMenu').style.width = '0';
  document.getElementById('sideMenuOverlay').classList.remove('active');
}

function showPage(page) {
  closeMenu();
  const div = document.getElementById('content');

  // Active nav link
  document.querySelectorAll('#sideMenu a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  div.innerHTML = '';
  div.classList.remove('animate-in');
  void div.offsetWidth; // reflow
  div.classList.add('animate-in');

  const pages = {
    home:    renderHome,
    urgence: renderUrgence,
    medoc:   renderMedoc,
    suivi:   renderSuivi,
  };

  if (pages[page]) pages[page](div);
}

/* ── Home ── */
function renderHome(div) {
  div.innerHTML = `
    <p class="page-title">Bonjour 👋</p>
    <p class="page-subtitle">Votre tableau de bord santé</p>

    <div class="urgence-banner" onclick="showPage('urgence')" style="cursor:pointer;">
      <h3>Urgence médicale</h3>
      <div class="urgence-num">15</div>
      <p style="font-size:13px; opacity:.75; margin-top:6px;">Appuyer pour appeler</p>
    </div>

    <div class="home-grid">
      <div class="widget" onclick="showPage('medoc')">
        <div class="widget-icon">💊</div>
        <div class="widget-label">Médicaments</div>
      </div>
      <div class="widget" onclick="showPage('suivi')">
        <div class="widget-icon">📊</div>
        <div class="widget-label">Suivi Santé</div>
      </div>
    </div>
  `;
}

/* ── Urgence ── */
function renderUrgence(div) {
  div.innerHTML = `
    <p class="page-title">Urgences</p>
    <p class="page-subtitle">Numéros d'appel rapide</p>

    <a href="tel:15" class="btn btn-danger" style="margin-bottom:16px;">
      📞 &nbsp;SAMU — 15
    </a>

    <div class="secondary-nums">
      <a href="tel:18" class="num-card">
        <div class="num-label">Incendie</div>
        <div class="num-value">18</div>
        <div class="num-desc">Pompiers</div>
      </a>
      <a href="tel:17" class="num-card">
        <div class="num-label">Sécurité</div>
        <div class="num-value">17</div>
        <div class="num-desc">Police</div>
      </a>
      <a href="tel:115" class="num-card">
        <div class="num-label">Social</div>
        <div class="num-value">115</div>
        <div class="num-desc">Sans-abri</div>
      </a>
      <a href="tel:3114" class="num-card">
        <div class="num-label">Prévention</div>
        <div class="num-value">3114</div>
        <div class="num-desc">Suicide</div>
      </a>
    </div>
  `;
}

/* ── Médicaments ── */
async function renderMedoc(div) {
  div.innerHTML = `
    <p class="page-title">Médicaments</p>
    <p class="page-subtitle">Gérez votre ordonnance</p>

    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Ajouter un médicament</p></div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Nom du médicament</label>
          <input id="nomMedoc" placeholder="ex: Doliprane">
        </div>
        <div class="form-group">
          <label class="form-label">Dose / Posologie</label>
          <input id="doseMedoc" placeholder="ex: 1000mg — 2×/jour">
        </div>
        <button class="btn btn-primary" onclick="ajouterMedoc()">
          + &nbsp;Ajouter
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Mes médicaments</p></div>
      <div class="card-body" id="listeMedocs">
        <p class="list-empty"><span class="empty-icon">💊</span><br>Aucun médicament enregistré</p>
      </div>
    </div>
  `;
  await chargerMedocs();
}

async function ajouterMedoc() {
  const nom  = document.getElementById('nomMedoc').value.trim();
  const dose = document.getElementById('doseMedoc').value.trim();
  if (nom && dose) {
    await addData('medicaments', { nom, dose });
    showPage('medoc');
  }
}

async function chargerMedocs() {
  const data = await getAll('medicaments');
  const container = document.getElementById('listeMedocs');
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `<p class="list-empty"><span class="empty-icon">💊</span><br>Aucun médicament enregistré</p>`;
    return;
  }

  container.innerHTML = data.map(m => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${escHtml(m.nom)}</div>
        <div class="list-item-meta">${escHtml(m.dose)}</div>
      </div>
      <button class="btn-icon-sm" onclick="supprimerEtRecharger('medicaments', ${m.id})" title="Supprimer">✕</button>
    </div>
  `).join('');
}

/* ── Suivi Santé ── */
const MESURE_TYPES = ['Température', 'Tension', 'Glycémie', 'Poids', 'Saturation O₂', 'Autre'];

async function renderSuivi(div) {
  div.innerHTML = `
    <p class="page-title">Suivi Santé</p>
    <p class="page-subtitle">Enregistrez vos mesures</p>

    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Nouvelle mesure</p></div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Type de mesure</label>
          <div class="tag-row" id="tagRow">
            ${MESURE_TYPES.map(t => `<span class="tag" onclick="selectTag(this, '${t}')">${t}</span>`).join('')}
          </div>
          <input id="typeMesure" placeholder="Type de mesure" style="margin-top:8px;" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Valeur</label>
          <input id="valeurMesure" placeholder="ex: 37.2°C">
        </div>
        <button class="btn btn-primary" onclick="ajouterSuivi()">
          + &nbsp;Enregistrer
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Historique</p></div>
      <div class="card-body" id="listeSuivi">
        <p class="list-empty"><span class="empty-icon">📊</span><br>Aucune mesure enregistrée</p>
      </div>
    </div>
  `;
  await chargerSuivi();
}

function selectTag(el, value) {
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('typeMesure').value = value;
}

async function ajouterSuivi() {
  const type   = document.getElementById('typeMesure').value.trim();
  const valeur = document.getElementById('valeurMesure').value.trim();
  if (type && valeur) {
    const date = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
    const time = new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    await addData('suivi', { type, valeur, date, time });
    showPage('suivi');
  }
}

async function chargerSuivi() {
  const data = await getAll('suivi');
  const container = document.getElementById('listeSuivi');
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `<p class="list-empty"><span class="empty-icon">📊</span><br>Aucune mesure enregistrée</p>`;
    return;
  }

  // Newest first
  const sorted = [...data].reverse();
  container.innerHTML = sorted.map(s => `
    <div class="list-item">
      <div class="list-item-content">
        <div class="list-item-title">${escHtml(s.type)} — <span class="badge badge-blue">${escHtml(s.valeur)}</span></div>
        <div class="list-item-meta">${escHtml(s.date)}${s.time ? ' · ' + escHtml(s.time) : ''}</div>
      </div>
      <button class="btn-icon-sm" onclick="supprimerEtRecharger('suivi', ${s.id})" title="Supprimer">✕</button>
    </div>
  `).join('');
}

/* ── Helpers ── */
async function supprimerEtRecharger(store, id) {
  await deleteData(store, id);
  store === 'medicaments' ? showPage('medoc') : showPage('suivi');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
