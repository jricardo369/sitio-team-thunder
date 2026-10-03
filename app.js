/* Thunders — lógica del sitio (extraída de index.html, sin cambios visuales).
 * Seguridad: sin handlers inline; todo se enlaza con addEventListener.
 * El muro escapa con esc() y tolera localStorage envenenado (try/catch).
 */
'use strict';

const players = [
    { name: 'Daria', number: 10, position: 'Base', age: '24 años', height: '1.85 m', weight: '80 kg', points: '18.5', assists: '7.2', rebounds: '3.8', bio: 'Motor del equipo en la pintura y en el perímetro. Líder en asistencias, marca el ritmo y asume los cierres de partido.' },
    { name: 'Emmanuel', number: 7, position: 'Escolta', age: '22 años', height: '1.90 m', weight: '85 kg', points: '15.2', assists: '4.5', rebounds: '4.1', bio: 'Tirador confiable desde media y larga distancia. Aporta energía en defensa y corre bien la cancha en transición.' },
    { name: 'Ivan Diaz', number: 23, position: 'Alero', age: '26 años', height: '1.95 m', weight: '90 kg', points: '20.3', assists: '3.8', rebounds: '6.5', bio: 'Anotador versátil que ataca el aro con potencia. Referente ofensivo y reboteador sólido desde el alero.' },
    { name: 'José Ricardo Vázquez Jiménez', number: 32, position: 'Ala-Pívot', age: '25 años', height: '2.02 m', weight: '100 kg', points: '12.8', assists: '2.5', rebounds: '9.2', bio: 'Muro en la zona con 12 años en el club. Intimida en la pintura, pelea cada rebote y es voz de mando en la defensa.' },
    { name: 'Jorge', number: 55, position: 'Pívot', age: '48 años', height: '1.77 m', weight: '103 kg', points: '1', assists: '3', rebounds: '3', bio: 'Veterano que aporta oficio y presencia física. Pantallas sólidas y lectura de juego que ordena la segunda unidad.' },
    { name: 'Josue', number: 5, position: 'Base', age: '21 años', height: '1.78 m', weight: '75 kg', points: '8.5', assists: '5.8', rebounds: '2.2', bio: 'Base joven de manos rápidas. Distribuye con criterio y presiona toda la cancha en defensa.' },
    { name: 'Mauricio Zavala', number: 15, position: 'Escolta', age: '23 años', height: '1.88 m', weight: '82 kg', points: '14.0', assists: '3.5', rebounds: '3.0', bio: 'Escolta atlético con 8 años en Thunders. Penetra con decisión y crece en los momentos de presión.' },
    { name: 'Nicolas Ruano', number: 42, position: 'Ala-Pívot', age: '27 años', height: '2.00 m', weight: '98 kg', points: '11.2', assists: '2.0', rebounds: '7.8', bio: 'Interior trabajador e incansable en el rebote ofensivo. Finaliza bien cerca del aro y defiende múltiples posiciones.' },
    { name: 'Danniel', number: 9, position: 'Base', age: '22 años', height: '1.82 m', weight: '78 kg', points: '9.8', assists: '6.1', rebounds: '2.9', bio: 'Director de juego cerebral. Excelente visión para el pase extra y ritmo pausado cuando el partido lo exige.' },
    { name: 'Esteban', number: 11, position: 'Alero', age: '24 años', height: '1.93 m', weight: '88 kg', points: '13.4', assists: '3.1', rebounds: '5.4', bio: 'Alero completo que defiende al mejor exterior rival. Corre las bandas y castiga desde la esquina.' },
    { name: 'Rfael Corona', number: 21, position: 'Pívot', age: '26 años', height: '2.05 m', weight: '105 kg', points: '10.9', assists: '1.5', rebounds: '8.7', bio: 'Pívot de gran envergadura. Protege el aro, cierra el rebote defensivo y finaliza por encima del aro.' },
    { name: 'Ethan', number: 3, position: 'Escolta', age: '20 años', height: '1.86 m', weight: '80 kg', points: '12.1', assists: '2.8', rebounds: '3.6', bio: 'Joya joven del club. Descaro ofensivo, tiro en suspensión y gran margen de crecimiento.' },
    { name: 'Pablo', number: 8, position: 'Alero', age: '23 años', height: '1.91 m', weight: '86 kg', points: '11.7', assists: '3.3', rebounds: '4.9', bio: 'Poste central reconvertido a alero alto. Juego físico, buena mano de media distancia y entrega total.' },
    { name: 'Patiño', number: 17, position: 'Ala-Pívot', age: '25 años', height: '1.98 m', weight: '94 kg', points: '10.2', assists: '1.9', rebounds: '7.1', bio: 'Interior sólido que aporta equilibrio. Lee bien los bloqueos y asegura puntos de segunda oportunidad.' },
    { name: 'Omar Elorza', number: 27, position: 'Base · Head Coach', age: '42 años', height: '1.84 m', weight: '88 kg', points: '9.4', assists: '6.8', rebounds: '4.2', bio: 'Jugador-coach y alma de Thunders. Dirige desde la duela con 11 años en el club: disciplina, cantera y ejemplo. Cuando entra con el 27 ordena la ofensiva y cuando dirige, exige intensidad defensiva.' }
];

let lastFocused = null;
const playerModal = document.getElementById('playerModal');

function isModalOpen() { return playerModal && playerModal.classList.contains('active'); }

/* Trampa de foco — el Tab circula solo dentro del diálogo */
function trapModalFocus(e) {
    if (e.key !== 'Tab' || !isModalOpen()) return;
    const focusables = playerModal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) { e.preventDefault(); return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function showPlayerModal(playerIndex) {
    const player = players[Number(playerIndex)];
    if (!player || !playerModal) return;
    document.getElementById('modalNumber').textContent = player.number;
    document.getElementById('modalName').textContent = player.name;
    document.getElementById('modalPosition').textContent = player.position;
    document.getElementById('modalBio').textContent = player.bio || 'Perfil en construcción. Pregunta por él en Arena Central.';
    document.getElementById('modalAge').textContent = player.age;
    document.getElementById('modalHeight').textContent = player.height;
    document.getElementById('modalWeight').textContent = player.weight;
    document.getElementById('modalPoints').textContent = player.points;
    document.getElementById('modalAssists').textContent = player.assists;
    document.getElementById('modalRebounds').textContent = player.rebounds;
    lastFocused = document.activeElement;
    playerModal.classList.add('active');
    playerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
}

function closeModal() {
    if (!isModalOpen()) return;
    playerModal.classList.remove('active');
    playerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    if (lastFocused) lastFocused.focus();
}

// Compatibilidad (por si algún enlace externo la invoca): exponer en window
window.showPlayerModal = showPlayerModal;
window.closeModal = closeModal;

if (playerModal) {
    playerModal.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
    playerModal.addEventListener('keydown', trapModalFocus);
}
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isModalOpen()) closeModal();
});

// Enlace de tarjetas sin onclick inline (CSP-friendly)
document.querySelectorAll('.player-card[data-index]').forEach(function (card) {
    const idx = card.getAttribute('data-index');
    card.addEventListener('click', function () { showPlayerModal(idx); });
    card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPlayerModal(idx); }
    });
});

// Botón cerrar modal sin onclick inline
const modalCloseBtn = document.getElementById('modalClose');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

// Hero: ocultar imagen si falla, sin onerror inline
const heroImg = document.getElementById('heroImg');
if (heroImg) heroImg.addEventListener('error', function () { heroImg.style.display = 'none'; });

/* Muro de la afición — blog local con localStorage */
(function () {
    const KEY = 'thunders_fanwall_v1';
    const wall = document.getElementById('fansWall');
    const form = document.getElementById('fanForm');
    if (!wall || !form) return;
    const nameInput = document.getElementById('fanName');
    const msgInput = document.getElementById('fanMsg');
    const charCount = document.getElementById('fanCharCount');
    const errBox = document.getElementById('fanErrorSummary');
    const errList = document.getElementById('fanErrorList');
    const okBox = document.getElementById('fanOk');
    const countEl = document.getElementById('wallCount');
    const ratingWrap = document.getElementById('fanRating');
    const honeypot = document.getElementById('fanWebsite');
    let rating = 5;
    let sortMode = 'new';
    let lastPostAt = 0;

    const seeds = [
        { name: 'Mariana G.', message: 'El ambiente en Arena Central es único. Mis hijos ya quieren ser como Rivera.', rating: 5, date: '2026-02-10', likes: 12, seed: true },
        { name: 'Carlos R.', message: 'La final 2023 la viví en primera fila. Nunca grité tanto en mi vida.', rating: 5, date: '2026-01-28', likes: 9, seed: true },
        { name: 'Diego P.', message: 'Gran trabajo con la cantera. Se nota la disciplina del coach Elorza.', rating: 5, date: '2026-01-15', likes: 6, seed: true }
    ];

    function load() {
        try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* localStorage envenenado: usar seeds */ }
        return seeds;
    }
    function save(posts) { try { localStorage.setItem(KEY, JSON.stringify(posts)); } catch (e) { /* cuota llena / modo privado */ } }
    let posts = load();

    function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function stars(n) {
        const safe = Math.min(5, Math.max(0, Number(n) || 0));
        let out = '';
        for (let i = 1; i <= 5; i++) out += i <= safe ? '★' : '<span class="off">★</span>';
        return out;
    }
    function fmtDate(iso) {
        try { return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch (e) { return iso; }
    }
    function getLikes() { try { return JSON.parse(localStorage.getItem(KEY + '_likes') || '[]'); } catch (e) { return []; } }
    function safeLikesSet(ids) { try { localStorage.setItem(KEY + '_likes', JSON.stringify(ids)); } catch (e) { /* ignorar */ } }

    function render(freshId) {
        let sorted = [];
        try {
            sorted = [...posts].sort((a, b) => sortMode === 'top' ? ((b.likes || 0) - (a.likes || 0)) : (String(b.date).localeCompare(String(a.date)) || ((b.id || 0) - (a.id || 0))));
        } catch (e) { sorted = [...posts]; }
        countEl.textContent = posts.length + (posts.length === 1 ? ' mensaje' : ' mensajes');
        if (!sorted.length) { wall.innerHTML = '<div class="wall-empty">Sé la primera persona en escribir en el muro.</div>'; return; }
        let likedIds = getLikes();
        wall.innerHTML = sorted.map(p => {
            const liked = likedIds.includes(p.id);
            const safeRating = Math.min(5, Math.max(1, Number(p.rating) || 5));
            return `<article class="fan-card${p.id === freshId ? ' fresh' : ''}" data-id="${Number(p.id) || 0}">
                <div class="stars" aria-label="${safeRating} de 5 estrellas">${stars(safeRating)}</div>
                <p class="msg">${esc(p.message)}</p>
                <div class="fan-meta"><div class="fan-avatar" aria-hidden="true">${esc(String(p.name || 'T').trim().charAt(0).toUpperCase() || 'T')}</div>
                <div><b>${esc(p.name)}</b><span class="fan-date">${fmtDate(p.date)}</span></div></div>
                <div class="fan-actions">
                    <button type="button" data-like="${Number(p.id) || 0}" class="${liked ? 'liked' : ''}" aria-pressed="${liked}">♥ ${Number(p.likes) || 0}</button>
                    ${p.seed ? '' : `<button type="button" data-del="${Number(p.id) || 0}" aria-label="Borrar mi mensaje">Borrar</button>`}
                </div></article>`;
        }).join('');
    }

    wall.addEventListener('click', function (e) {
        const likeBtn = e.target.closest('[data-like]');
        const delBtn = e.target.closest('[data-del]');
        if (likeBtn) {
            const id = Number(likeBtn.getAttribute('data-like'));
            const likes = getLikes();
            const post = posts.find(p => p.id === id);
            if (!post) return;
            if (likes.includes(id)) {
                safeLikesSet(likes.filter(x => x !== id));
                post.likes = Math.max(0, (Number(post.likes) || 0) - 1);
            } else {
                likes.push(id);
                safeLikesSet(likes);
                post.likes = (Number(post.likes) || 0) + 1;
            }
            save(posts); render();
            return;
        }
        if (delBtn) {
            const id = Number(delBtn.getAttribute('data-del'));
            posts = posts.filter(p => p.id !== id);
            save(posts); render();
        }
    });

    const sortNewBtn = document.getElementById('sortNew');
    const sortTopBtn = document.getElementById('sortTop');
    if (sortNewBtn) sortNewBtn.addEventListener('click', function () {
        sortMode = 'new'; sortNewBtn.classList.add('active'); if (sortTopBtn) sortTopBtn.classList.remove('active'); render();
    });
    if (sortTopBtn) sortTopBtn.addEventListener('click', function () {
        sortMode = 'top'; sortTopBtn.classList.add('active'); if (sortNewBtn) sortNewBtn.classList.remove('active'); render();
    });

    if (ratingWrap) ratingWrap.addEventListener('click', function (e) {
        const btn = e.target.closest('button[data-v]');
        if (!btn) return;
        rating = Math.min(5, Math.max(1, Number(btn.getAttribute('data-v')) || 5));
        [...ratingWrap.querySelectorAll('button')].forEach(b => {
            const on = Number(b.getAttribute('data-v')) <= rating;
            b.classList.toggle('on', on); b.setAttribute('aria-checked', on && Number(b.getAttribute('data-v')) === rating ? 'true' : 'false');
        });
    });

    if (msgInput && charCount) msgInput.addEventListener('input', function () { charCount.textContent = msgInput.value.length + ' / 280'; });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Honeypot anti-bot (campo oculto; si viene lleno es un bot)
        if (honeypot && honeypot.value) return;
        // Throttle simple: 1 post cada 30s
        const now = Date.now();
        if (now - lastPostAt < 30000) {
            errList.innerHTML = '<li><a href="#fanMsg">Espera 30 segundos entre mensajes.</a></li>';
            errBox.classList.add('active');
            errBox.focus();
            return;
        }
        const name = nameInput.value.trim();
        const msg = msgInput.value.trim();
        const errors = [];
        document.getElementById('fieldName').classList.toggle('invalid', name.length < 2);
        document.getElementById('fieldMsg').classList.toggle('invalid', msg.length < 4);
        if (name.length < 2) errors.push({ id: 'fanName', text: 'Escribe tu nombre (mínimo 2 letras).' });
        if (msg.length < 4) errors.push({ id: 'fanMsg', text: 'Escribe un mensaje de al menos 4 caracteres.' });
        // Validar rating por si el DOM fue manipulado
        rating = Math.min(5, Math.max(1, Number(rating) || 5));
        if (errors.length) {
            errList.innerHTML = errors.map(er => `<li><a href="#${er.id}">${esc(er.text)}</a></li>`).join('');
            errBox.classList.add('active'); okBox.classList.remove('active');
            errBox.focus();
            return;
        }
        errBox.classList.remove('active');
        const today = new Date().toISOString().slice(0, 10);
        const post = { id: Date.now() * 1000 + Math.floor(Math.random() * 1000), name: name.slice(0, 40), message: msg.slice(0, 280), rating, date: today, likes: 0, seed: false };
        posts.unshift(post); save(posts);
        lastPostAt = now;
        form.reset(); rating = 5;
        [...ratingWrap.querySelectorAll('button')].forEach(b => b.classList.toggle('on', b.getAttribute('data-v') === '5'));
        charCount.textContent = '0 / 280';
        okBox.classList.add('active');
        setTimeout(() => okBox.classList.remove('active'), 4000);
        render(post.id);
    });

    // ids estables para seeds
    posts = posts.map((p, i) => ({ id: p.id || (1000 + i), likes: p.likes || 0, ...p }));
    render();
})();
