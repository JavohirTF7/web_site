'use strict';

document.documentElement.classList.remove('no-js');

// ---------- nav ----------
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

const closeMenu = () => {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
};
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

// active link on scroll
const sections = document.querySelectorAll('main section[id]');
const linkFor = id => navLinks.querySelector(`a[href="#${id}"]`);
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const link = linkFor(entry.target.id);
    if (link && entry.isIntersecting) {
      navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => sectionObserver.observe(s));

// ---------- reveal on scroll ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
  revealObserver.observe(el);
});

// ---------- card spotlight ----------
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ---------- terminal typing ----------
const terminal = document.querySelector('[data-terminal]');
const script = [
  ['m', '> task: "Answer new leads in Telegram"'],
  ['', '◆ planning steps…'],
  ['', '◆ tool: crm.lookup(lead)'],
  ['', '◆ tool: knowledge.search("pricing")'],
  ['', '◆ drafting reply in Uzbek…'],
  ['k', '✓ done in 4.2s — lead qualified'],
];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const render = (lines, partial = '', cls = '') => {
  terminal.innerHTML = lines.map(([c, t]) => `<span class="${c}">${escapeHtml(t)}</span>`).join('\n')
    + (lines.length ? '\n' : '') + `<span class="${cls}">${escapeHtml(partial)}</span><span class="cursor"></span>`;
};

async function runTerminal() {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  if (reduceMotion) { render(script); return; }
  while (true) {
    const done = [];
    for (const [cls, text] of script) {
      for (let i = 1; i <= text.length; i++) {
        render(done, text.slice(0, i), cls);
        await wait(22);
      }
      done.push([cls, text]);
      await wait(380);
    }
    render(done);
    await wait(3200);
  }
}
if (terminal) runTerminal();

// ---------- project filter ----------
const filterBtns = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('.project');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.toggle('active', b === btn));
  const f = btn.dataset.filter;
  projects.forEach(p => p.classList.toggle('hide', f !== 'all' && p.dataset.cat !== f));
}));

// ---------- contact form (Netlify Forms) ----------
const form = document.querySelector('[data-form]');
const formBtn = document.querySelector('[data-form-btn]');
const formStatus = document.querySelector('[data-form-status]');

form.addEventListener('submit', async e => {
  e.preventDefault();
  let valid = true;
  form.querySelectorAll('[required]').forEach(input => {
    const ok = input.checkValidity() && input.value.trim() !== '';
    input.closest('.field').classList.toggle('invalid', !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    formStatus.className = 'form-status err';
    formStatus.textContent = 'Please fill in your name, a valid email and a message.';
    return;
  }

  formBtn.disabled = true;
  formBtn.querySelector('span').textContent = 'Sending…';
  formStatus.className = 'form-status';
  formStatus.textContent = '';

  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    formStatus.className = 'form-status ok';
    formStatus.textContent = 'Thank you! Your message has been sent — I\'ll get back to you soon.';
  } catch {
    formStatus.className = 'form-status err';
    formStatus.textContent = 'Something went wrong. Please try again or message me on Telegram.';
  } finally {
    formBtn.disabled = false;
    formBtn.querySelector('span').textContent = 'Send message';
  }
});
form.querySelectorAll('input, textarea').forEach(i => i.addEventListener('input', () => i.closest('.field')?.classList.remove('invalid')));

// ---------- year ----------
document.querySelector('[data-year]').textContent = new Date().getFullYear();
