/* =============================================
   MATRIX RAIN
   ============================================= */
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

let columns, drops;

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / 13);
    drops   = Array.from({ length: columns }, () => Math.random() * -50);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const CHARS = '01アイウエオカキクケコサシスセソタチツテトABCDEFGHIJKLMNOP';
const FONT_SIZE = 13;

function drawMatrix() {
    ctx.fillStyle = 'rgba(1,4,9,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = `${FONT_SIZE}px 'Fira Code', monospace`;
    for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);
        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
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
        a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
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
            s.style.transform = ''; s.style.opacity = '';
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
   PROJECT BUTTONS — feedback visual
   ============================================= */
document.querySelectorAll('.btn-dl').forEach(btn => {
    btn.addEventListener('click', function () {
        const original = this.innerHTML;
        this.innerHTML = '<i class="fas fa-external-link-alt"></i> Abrindo...';
        setTimeout(() => { this.innerHTML = original; }, 1200);
    });
});
