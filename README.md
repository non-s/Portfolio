# Portfolio — Julio Fernandes

Live: https://non-s.github.io/portfolio

## What it is

A personal portfolio built without frameworks. The goal was to show what the browser platform gives you for free — no React, no Tailwind, no build pipeline.

## Technical notes

### Matrix rain (Canvas API)

```js
let columns, drops;

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / 13);
    drops   = Array.from({ length: columns }, () => Math.random() * -50);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
```

`columns` and `drops` are recalculated on resize. If they were `const`, the grid would break after any window resize — a common bug in canvas animations.

### Typewriter

Cycles through three command strings, typing and deleting each. `charIdx` and `deleting` are module-level state; `setTimeout` drives the animation rather than `setInterval` so the delay can vary per character.

### Scroll-aware navbar

The active nav link is updated on every scroll by comparing `window.scrollY` against each section's `offsetTop`. No scroll library, no position:sticky tricks.

### IntersectionObserver — fade-in

```js
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
```

Once an element enters the viewport it gets `visible` and is unobserved — the animation can't fire twice and the observer doesn't accumulate entries.

### Skill bars

A second IntersectionObserver fires when the skills grid enters the viewport and staggers each bar's `animate` class by `i * 80ms` — pure CSS handles the width transition.

## Files

```
portfolio/
├── index.html   — sections: hero, about, skills, projects, contact
├── style.css    — CSS custom properties, dark theme, responsive grid
├── script.js    — matrix rain, typewriter, navbar, observers
└── README.md
```

No build step. No dependencies beyond Font Awesome and Google Fonts.
