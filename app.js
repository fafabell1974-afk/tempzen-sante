/* ── TempZen — App Logic ── */

window.onload = async () => {
  await initDB();
  startClock();
  showPage('home');
};

/* ── Horloge ── */
function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const el = document.getElementById('liveClock');
    if (el) el.textContent = h + ':' + m;

    const JOURS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const MOIS  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    const elDate = document.getElementById('liveDate');
    if (elDate) elDate.textContent = JOURS[now.getDay()] + ' ' + now.getDate() + ' ' + MOIS[now.getMonth()] + ' ' + now.getFullYear();

    const elDay = document.getElementById('liveDay');
    if (elDay) elDay.textContent = JOURS[now.getDay()];

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const elWeek = document.getElementById('liveWeek');
    if (elWeek) elWeek.textContent = 'Semaine ' + week;
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Navigation Dropdown ── */
function toggleMenu() {
  const menu = document.getElementById('navDropdown');
  const trigger = document.getElementById('navTrigger');
  const isOpen = menu.classList.toggle('open');
  trigger.classList.toggle('open', isOpen);
}

document.addEventListener('click', (e) => {
  const trigger = document.getElementById('navTrigger');
  const menu    = document.getElementById('navDropdown');
  if (trigger && !trigger.contains(e.target) && menu && !menu.contains(e.target)) {
    menu.classList.remove('open');
    trigger.classList.remove('open');
  }
});

function showPage(page) {
  const menu = document.getElementById('navDropdown');
  const trigger = document.getElementById('navTrigger');
  if (menu)    menu.classList.remove('open');
  if (trigger) trigger.classList.remove('open');

  const div = document.getElementById('content');
  div.innerHTML = '';
  div.classList.remove('animate-in');
  void div.offsetWidth;
  div.classList.add('animate-in');

  const pages = { home: renderHome, urgence: renderUrgence, medoc: renderMedoc, suivi: renderSuivi, rdv: renderRdv };
  if (pages[page]) pages[page](div);
}

/* ══════════════════════════════
   HOME — Tableau de bord
══════════════════════════════ */
async function renderHome(div) {
  const rdvList = await getAll('rdv');
  const prochain = getProchainRdv(rdvList);

  div.innerHTML = `
    <div class="dashboard-clock">
      <div>
        <div class="clock-time" id="liveClock">--:--</div>
        <div class="clock-date" id="liveDate">--</div>
      </div>
      <div class="clock-right">
        <div class="clock-day" id="liveDay">--</div>
        <div class="clock-week" id="liveWeek">Semaine --</div>
      </div>
    </div>

    <div class="section-label">Prochain rendez-vous</div>
    ${prochain ? renderRdvNextCard(prochain) : `
      <div class="rdv-empty-state">
        📅 Aucun rendez-vous à venir<br>
        <small style="margin-top:4px;display:block;">
          <a href="#" onclick="showPage('rdv');return false;" style="color:var(--blue-500);">Ajouter un RDV</a>
        </small>
      </div>`}

    <div class="section-label">Accès rapide</div>
    <div class="home-grid">
      <div class="widget" onclick="showPage('medoc')">
        <div class="widget-icon">💊</div>
        <div class="widget-label">Médicaments</div>
      </div>
      <div class="widget" onclick="showPage('suivi')">
        <div class="widget-icon">📊</div>
        <div class="widget-label">Suivi santé</div>
      </div>
      <div class="widget" onclick="showPage('rdv')">
        <div class="widget-icon">📅</div>
        <div class="widget-label">Rendez-vous</div>
      </div>
      <div class="widget" onclick="showPage('urgence')">
        <div class="widget-icon">🚨</div>
        <div class="widget-label">Urgences</div>
      </div>
    </div>
  `;
  startClock();
}

function getProchainRdv(list) {
  const now = new Date();
  now.setHours(0,0,0,0);
  return list
    .filter(r => new Date(r.dateISO) >= now)
    .sort((a,b) => new Date(a.dateISO) - new Date(b.dateISO))[0] || null;
}

function renderRdvNextCard(r) {
  const d = new Date(r.dateISO);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  const quand = diff === 0 ? "Aujourd'hui" : diff === 1 ? 'Demain' : `Dans ${diff} j.`;
  return `
    <div class="rdv-next-card" onclick="showPage('rdv')">
      <div class="rdv-icon-box">📅</div>
      <div class="rdv-next-info">
        <div class="rdv-next-title">${escHtml(r.titre)}</div>
        <div class="rdv-next-sub">${r.lieu ? escHtml(r.lieu) : 'Aucun lieu précisé'}</div>
      </div>
      <div class="rdv-next-when">${quand}<br>${r.heure || ''}</div>
    </div>`;
}

/* ══════════════════════════════
   URGENCE
══════════════════════════════ */
function renderUrgence(div) {
  div.innerHTML = `
    <p class="page-title">Urgences</p>
    <p class="page-subtitle">Numéros d'appel rapide</p>
    <a href="tel:15" class="btn btn-danger" style="margin-bottom:16px;">📞 &nbsp;SAMU — 15</a>
    <div class="secondary-nums">
      <a href="tel:18"   class="num-card"><div class="num-label">Incendie</div><div class="num-value">18</div><div class="num-desc">Pompiers</div></a>
      <a href="tel:17"   class="num-card"><div class="num-label">Sécurité</div><div class="num-value">17</div><div class="num-desc">Police</div></a>
      <a href="tel:115"  class="num-card"><div class="num-label">Social</div><div class="num-value">115</div><div class="num-desc">Sans-abri</div></a>
      <a href="tel:3114" class="num-card"><div class="num-label">Prévention</div><div class="num-value">3114</div><div class="num-desc">Suicide</div></a>
    </div>`;
}

/* ══════════════════════════════
   MÉDICAMENTS
══════════════════════════════ */
async function renderMedoc(div) {
  div.innerHTML = `
    <p class="page-title">Médicaments</p>
    <p class="page-subtitle">Gérez votre ordonnance</p>
    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Ajouter</p></div>
      <div class="card-body">
        <div class="form-group"><label class="form-label">Nom</label><input id="nomMedoc" placeholder="ex: Doliprane"></div>
        <div class="form-group"><label class="form-label">Dose / Posologie</label><input id="doseMedoc" placeholder="ex: 1000mg — 2×/jour"></div>
        <button class="btn btn-primary" onclick="ajouterMedoc()">+ &nbsp;Ajouter</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Mes médicaments</p></div>
      <div class="card-body" id="listeMedocs"></div>
    </div>`;
  await chargerMedocs();
}

async function ajouterMedoc() {
  const nom  = document.getElementById('nomMedoc').value.trim();
  const dose = document.getElementById('doseMedoc').value.trim();
  if (nom && dose) { await addData('medicaments', { nom, dose }); showPage('medoc'); }
}

async function chargerMedocs() {
  const data = await getAll('medicaments');
  const el   = document.getElementById('listeMedocs');
  if (!el) return;
  el.innerHTML = !data.length
    ? `<p class="list-empty"><span class="empty-icon">💊</span><br>Aucun médicament enregistré</p>`
    : data.map(m => `
        <div class="list-item">
          <div class="list-item-content">
            <div class="list-item-title">${escHtml(m.nom)}</div>
            <div class="list-item-meta">${escHtml(m.dose)}</div>
          </div>
          <button class="btn-icon-sm" onclick="supprimerEtRecharger('medicaments',${m.id})">✕</button>
        </div>`).join('');
}

/* ══════════════════════════════
   SUIVI SANTÉ
══════════════════════════════ */
const MESURE_TYPES = ['Température','Tension','Glycémie','Poids','Saturation O₂','Autre'];

async function renderSuivi(div) {
  div.innerHTML = `
    <p class="page-title">Suivi Santé</p>
    <p class="page-subtitle">Enregistrez vos mesures</p>
    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Nouvelle mesure</p></div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Type</label>
          <div class="tag-row">${MESURE_TYPES.map(t=>`<span class="tag" onclick="selectTag(this,'${t}')">${t}</span>`).join('')}</div>
          <input id="typeMesure" placeholder="Type de mesure" style="margin-top:8px;" readonly>
        </div>
        <div class="form-group"><label class="form-label">Valeur</label><input id="valeurMesure" placeholder="ex: 37.2°C"></div>
        <button class="btn btn-primary" onclick="ajouterSuivi()">+ &nbsp;Enregistrer</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Historique</p></div>
      <div class="card-body" id="listeSuivi"></div>
    </div>`;
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
    const date = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
    const time = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    await addData('suivi', { type, valeur, date, time });
    showPage('suivi');
  }
}

async function chargerSuivi() {
  const data = await getAll('suivi');
  const el   = document.getElementById('listeSuivi');
  if (!el) return;
  el.innerHTML = !data.length
    ? `<p class="list-empty"><span class="empty-icon">📊</span><br>Aucune mesure enregistrée</p>`
    : [...data].reverse().map(s => `
        <div class="list-item">
          <div class="list-item-content">
            <div class="list-item-title">${escHtml(s.type)} — <span class="badge badge-blue">${escHtml(s.valeur)}</span></div>
            <div class="list-item-meta">${escHtml(s.date)}${s.time?' · '+escHtml(s.time):''}</div>
          </div>
          <button class="btn-icon-sm" onclick="supprimerEtRecharger('suivi',${s.id})">✕</button>
        </div>`).join('');
}

/* ══════════════════════════════
   RENDEZ-VOUS
══════════════════════════════ */
async function renderRdv(div) {
  div.innerHTML = `
    <p class="page-title">Rendez-vous</p>
    <p class="page-subtitle">Vos consultations médicales</p>
    <div class="card rdv-form">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Nouveau RDV</p></div>
      <div class="card-body">
        <div class="form-group"><label class="form-label">Motif / Médecin</label><input id="rdvTitre" placeholder="ex: Cardiologue — Dr. Martin"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date</label><input type="date" id="rdvDate"></div>
          <div class="form-group"><label class="form-label">Heure</label><input type="time" id="rdvHeure"></div>
        </div>
        <div class="form-group"><label class="form-label">Lieu (optionnel)</label><input id="rdvLieu" placeholder="ex: Hôpital Sainte-Marie"></div>
        <button class="btn btn-primary" onclick="ajouterRdv()">+ &nbsp;Ajouter</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><p class="card-title" style="font-size:15px;">Mes rendez-vous</p></div>
      <div class="card-body" id="listeRdv"></div>
    </div>`;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('rdvDate').value = today;
  await chargerRdv();
}

async function ajouterRdv() {
  const titre   = document.getElementById('rdvTitre').value.trim();
  const dateVal = document.getElementById('rdvDate').value;
  const heure   = document.getElementById('rdvHeure').value;
  const lieu    = document.getElementById('rdvLieu').value.trim();
  if (titre && dateVal) {
    await addData('rdv', { titre, dateISO: dateVal, heure, lieu });
    showPage('rdv');
  }
}

async function chargerRdv() {
  const data = await getAll('rdv');
  const el   = document.getElementById('listeRdv');
  if (!el) return;

  if (!data.length) {
    el.innerHTML = `<p class="list-empty"><span class="empty-icon">📅</span><br>Aucun rendez-vous enregistré</p>`;
    return;
  }

  const now = new Date(); now.setHours(0,0,0,0);
  const sorted = [...data].sort((a,b) => new Date(a.dateISO) - new Date(b.dateISO));
  const aVenir  = sorted.filter(r => new Date(r.dateISO) >= now);
  const passes  = sorted.filter(r => new Date(r.dateISO) < now).reverse();

  const renderItem = (r, past=false) => {
    const d = new Date(r.dateISO);
    const dateStr = d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long'});
    return `
      <div class="list-item" style="${past?'opacity:0.5':''}">
        <div class="list-item-content">
          <div class="list-item-title">${escHtml(r.titre)}</div>
          <div class="list-item-meta">${dateStr}${r.heure?' · '+escHtml(r.heure):''}${r.lieu?' — '+escHtml(r.lieu):''}</div>
        </div>
        <button class="btn-icon-sm" onclick="supprimerEtRecharger('rdv',${r.id})">✕</button>
      </div>`;
  };

  let html = '';
  if (aVenir.length)  html += `<p style="font-size:11px;font-weight:600;color:var(--blue-500);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">À venir</p>` + aVenir.map(r=>renderItem(r)).join('');
  if (passes.length) {
    if (aVenir.length) html += `<div class="card-divider"></div>`;
    html += `<p style="font-size:11px;font-weight:600;color:var(--gray-400);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">Passés</p>` + passes.map(r=>renderItem(r,true)).join('');
  }
  el.innerHTML = html;
}

/* ── Helpers ── */
async function supprimerEtRecharger(store, id) {
  await deleteData(store, id);
  if (store === 'medicaments') showPage('medoc');
  else if (store === 'suivi')  showPage('suivi');
  else                          showPage('rdv');
}

function escHtml(str) {
  return String(str||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
