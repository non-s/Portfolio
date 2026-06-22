import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    limit as firestoreLimit,
    orderBy,
    query,
    serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const FIREBASE_CONFIGURED = firebaseConfig?.apiKey && !firebaseConfig.apiKey.includes('REPLACE_');
let firebaseAuth = null;
let firestoreDb = null;

if (FIREBASE_CONFIGURED) {
    const firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
}

async function saveContactMessage(payload) {
    if (!FIREBASE_CONFIGURED) throw new Error('Firebase ainda nao configurado.');
    await addDoc(collection(firestoreDb, 'portfolio_mensagens'), {
        ...payload,
        created_at: serverTimestamp(),
    });
}

async function loadContactMessages() {
    if (!FIREBASE_CONFIGURED) throw new Error('Firebase ainda nao configurado.');
    if (!firebaseAuth.currentUser) {
        await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
    }
    const snapshot = await getDocs(query(
        collection(firestoreDb, 'portfolio_mensagens'),
        orderBy('created_at', 'desc'),
        firestoreLimit(200),
    ));
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

/* =============================================
   MATRIX RAIN
   ============================================= */
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');


/**
 * Handles errors: logs to console and shows user feedback via showToast.
 * @param {Error|Object} err
 * @param {string} [context='']
 */
function handleError(err, context = '') {
  const msg = err?.message || String(err) || 'Erro inesperado';
  console.error('[handleError]', context, err);
  showToast(msg, 'error');
}

/**
 * Returns true only if every provided string is non-empty after trimming.
 * @param {...string} values
 * @returns {boolean}
 */
function validateRequired(...values) {
  return values.every(v => typeof v === 'string' && v.trim().length > 0);
}

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initMatrix(); });

const CHARS    = '01アイウエオカキクケコサシスセソタチツテトABCDEFGHIJKLMNOP';
const FONT_SIZE = 13;
let columns, drops;

/** Initializes the Matrix rain canvas animation. */
function initMatrix() {
    columns = Math.floor(canvas.width / FONT_SIZE);
    drops   = Array.from({ length: columns }, () => Math.random() * -50);
}
initMatrix();

function drawMatrix() {
    ctx.fillStyle = 'rgba(1,4,9,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = `${FONT_SIZE}px 'Fira Code', monospace`;
    for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}
setInterval(drawMatrix, 55);

/* =============================================
   TYPEWRITER
   ============================================= */
const CMDS = ['cat profile.json', 'whoami --verbose', './show --portfolio'];
let cmdIdx = 0, charIdx = 0, deleting = false;
const typingEl = document.getElementById('typingText');
const outputEl = document.getElementById('terminalOutput');

function typeWriter() {
    const cmd = CMDS[cmdIdx];
    if (!deleting) {
        typingEl.textContent = cmd.slice(0, ++charIdx);
        if (charIdx === cmd.length) {
            if (cmdIdx === 0) outputEl.classList.add('visible');
            setTimeout(() => { deleting = true; typeWriter(); }, 2800);
            return;
        }
        setTimeout(typeWriter, 75 + Math.random() * 40);
    } else {
        typingEl.textContent = cmd.slice(0, --charIdx);
        if (charIdx === 0) {
            deleting = false;
            cmdIdx = (cmdIdx + 1) % CMDS.length;
            setTimeout(typeWriter, 550);
            return;
        }
        setTimeout(typeWriter, 38);
    }
}
setTimeout(typeWriter, 1000);

/* =============================================
   NAVBAR SCROLL + ACTIVE LINK
   ============================================= */
const navbar   = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a[href^="#"]');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navAs.forEach(a => {
        const active = a.getAttribute('href') === `#${current}`;
        a.style.color = active ? 'var(--accent)' : '';
    });
}, { passive: true });

/* =============================================
   MOBILE MENU
   ============================================= */
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    const spans = menuToggle.querySelectorAll('span');
    if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
});

navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelectorAll('span').forEach(s => {
            s.style.transform = '';
            s.style.opacity   = '';
        });
    });
});

/* =============================================
   INTERSECTION OBSERVER — fade-in
   ============================================= */
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* =============================================
   SKILL BARS ANIMATION
   ============================================= */
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
                setTimeout(() => bar.classList.add('animate'), i * 80);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.25 });

const skillsGrid = document.querySelector('.skills-grid');
if (skillsGrid) skillObserver.observe(skillsGrid);

/* =============================================
   TOAST NOTIFICATION
   ============================================= */
function showToast(msg, type = 'info') {
    const existing = document.getElementById('dl-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'dl-toast';
    toast.innerHTML = `<i class="fas fa-${type === 'error' ? 'triangle-exclamation' : 'circle-info'}"></i> ${msg}`;

    Object.assign(toast.style, {
        position:     'fixed',
        bottom:       '28px',
        left:         '50%',
        transform:    'translateX(-50%) translateY(20px)',
        background:   type === 'error' ? '#1a0a0a' : '#0a1a0a',
        border:       `1px solid ${type === 'error' ? '#f85149' : 'var(--accent)'}`,
        color:        type === 'error' ? '#f85149' : 'var(--accent)',
        padding:      '12px 22px',
        borderRadius: '9px',
        fontFamily:   'var(--mono)',
        fontSize:     '.85rem',
        zIndex:       '9999',
        opacity:      '0',
        transition:   'all .3s cubic-bezier(.4,0,.2,1)',
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        boxShadow:    '0 8px 32px rgba(0,0,0,.5)',
        maxWidth:     '90vw',
        textAlign:    'center',
        whiteSpace:   'nowrap'
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity   = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/* =============================================
   FIREBASE CONTACT FORM
   ============================================= */

document.getElementById('contactForm')?.addEventListener('submit', async e => {
  try {
    e.preventDefault();
    const nome     = document.getElementById('cfNome').value.trim();
    const email    = document.getElementById('cfEmail').value.trim();
    const mensagem = document.getElementById('cfMsg').value.trim();
    const btn      = document.getElementById('cfBtn');
    const status   = document.getElementById('cfStatus');
    if (!nome || !mensagem) {
        status.textContent = 'Nome e mensagem são obrigatórios.';
        status.className = 'cf-status error';
        return;
    }
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    status.textContent = '';
    status.className = 'cf-status';
    let sent = false;
    try {
        await saveContactMessage({ nome, email, mensagem });
        sent = true;
    } catch (err) {
        handleError(err, 'saveContactMessage');
    }
    if (!sent) {
        status.textContent = 'Erro ao enviar. Tente novamente.';
        status.className = 'cf-status error';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
    } else {
        status.textContent = '✓ Mensagem enviada! Responderei em breve.';
        status.className = 'cf-status';
        e.target.reset();
        btn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
            status.textContent = '';
        }, 3500);
    }
  } catch(err) { handleError(err, 'contactForm'); }
});

/* =============================================
   DOWNLOAD BUTTON HANDLER
   ============================================= */
document.querySelectorAll('.btn-dl').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const href  = this.getAttribute('href');
        const isZip = href.endsWith('.zip');
        const isApk = href.endsWith('.apk');

        if (isZip) {
            const original = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            setTimeout(() => { this.innerHTML = original; }, 2000);
            return;
        }

        if (isApk) {
            const original = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            setTimeout(() => { this.innerHTML = original; }, 2000);
        }
    });
});

/* =============================================
   ADMIN PANEL - mensagens recebidas
   Acesso: adicione ?admin na URL.
   As leituras sao protegidas pelas Firebase Security Rules.
   ============================================= */
(async function initAdminPanel() {
    if (!new URLSearchParams(window.location.search).has('admin')) return;

    const panel = document.createElement('section');
    panel.className = 'section section-dark';
    panel.style.cssText = 'padding-top:3rem;padding-bottom:3rem';
    panel.innerHTML = `
        <div class="container">
            <div class="section-header">
                <span class="section-tag">$ firestore portfolio_mensagens order by created_at desc</span>
                <h2>Mensagens <span style="font-size:1rem;color:var(--text-muted);font-weight:400">(painel admin)</span></h2>
            </div>
            <div id="adminMsgList" style="display:flex;flex-direction:column;gap:1rem;max-width:820px;margin:0 auto">
                <p style="font-family:var(--mono);color:var(--text-muted)">Carregando...</p>
            </div>
        </div>`;
    document.querySelector('footer').before(panel);

    function hesc(s) {
        return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function formatMessageDate(value) {
        const date = value?.toDate ? value.toDate() : new Date(value || Date.now());
        return date.toLocaleString('pt-BR');
    }

    let data = [];
    let error = null;
    try {
        data = await loadContactMessages();
    } catch (err) {
        error = err;
    }

    const list = document.getElementById('adminMsgList');
    if (error) {
        list.innerHTML = `<p style="color:#f85149;font-family:var(--mono)">Erro: ${hesc(error.message)}<br><small>Entre com um Google autorizado e publique as regras do Firestore.</small></p>`;
        return;
    }
    if (!data?.length) {
        list.innerHTML = '<p style="color:var(--text-muted);font-family:var(--mono)">Nenhuma mensagem recebida ainda.</p>';
        return;
    }
    list.innerHTML = data.map(m => `
        <div style="background:var(--bg-card);border:1px solid var(--border-h);border-radius:12px;padding:1.25rem 1.5rem">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:.6rem;flex-wrap:wrap">
                <strong style="color:var(--accent);font-size:1rem">${hesc(m.nome)}</strong>
                <small style="color:var(--text-muted);font-family:var(--mono);white-space:nowrap">${formatMessageDate(m.created_at)}</small>
            </div>
            ${m.email ? `<div style="font-family:var(--mono);font-size:.78rem;color:var(--text-muted);margin-bottom:.5rem"><i class="fas fa-envelope" style="margin-right:.4rem"></i>${hesc(m.email)}</div>` : ''}
            <p style="color:var(--text);margin:0;line-height:1.6;white-space:pre-wrap">${hesc(m.mensagem)}</p>
        </div>`).join('');
})();

