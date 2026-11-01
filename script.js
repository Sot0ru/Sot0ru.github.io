(() => {
  const EMAIL = 'david09072006@gmail.com';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ------------------------------------------------------------------ */
  /* Hero name: split into letters                                       */
  /* ------------------------------------------------------------------ */
  const heroName = $('#hero-name');
  if (heroName && !reduceMotion) {
    const text = heroName.textContent.trim();
    heroName.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.style.setProperty('--i', i);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch;
      heroName.appendChild(span);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Terminal: type commands one after another                           */
  /* ------------------------------------------------------------------ */
  const terminal = $('.terminal');
  if (terminal && !reduceMotion) {
    const rows = $$('#terminal > p');
    const commands = rows.map((row) => $('.t-cmd', row));
    const fullText = commands.map((cmd) => (cmd ? cmd.textContent : ''));
    commands.forEach((cmd) => cmd && (cmd.textContent = ''));
    terminal.classList.add('is-typing');

    (async () => {
      await wait(1500);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        row.classList.add('is-shown');
        const cmd = commands[i];
        if (cmd) {
          for (const ch of fullText[i]) {
            cmd.textContent += ch;
            await wait(45 + Math.random() * 55);
          }
          await wait(260);
        } else {
          await wait(160);
        }
      }
      terminal.classList.remove('is-typing');
    })();
  }

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                    */
  /* ------------------------------------------------------------------ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------ */
  /* Projects: active panel, active project, progress rail               */
  /* ------------------------------------------------------------------ */
  const panels = $$('.panel');
  const projects = $$('.project');
  const railFill = $('#rail-fill');
  const projectList = $('.projects__list');

  const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
      if (entry.isIntersecting && entry.target.contains($('#race'))) runRace();
    });
  }, { rootMargin: '-35% 0px -35% 0px' });
  panels.forEach((p) => panelObserver.observe(p));

  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-active', entry.isIntersecting));
  }, { rootMargin: '-45% 0px -45% 0px' });
  projects.forEach((p) => projectObserver.observe(p));

  let ticking = false;
  const updateRail = () => {
    ticking = false;
    if (!railFill || !projectList) return;
    const rect = projectList.getBoundingClientRect();
    const start = window.innerHeight * 0.5;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / rect.height));
    railFill.style.height = `${progress * 100}%`;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateRail); }
  }, { passive: true });
  updateRail();

  /* ------------------------------------------------------------------ */
  /* Race visual: 8 parallel holds, exactly one wins                     */
  /* ------------------------------------------------------------------ */
  const race = $('#race');
  let raceRunning = false;

  async function runRace() {
    if (!race || raceRunning) return;
    raceRunning = true;
    const rows = $$('.race__requests li', race);

    do {
      race.classList.remove('is-won');
      rows.forEach((row) => {
        row.classList.remove('is-done', 'is-win', 'is-lose');
        $('.race__res', row).textContent = '';
        const bar = $('.race__bar', row);
        bar.style.setProperty('--t', '0s');
        bar.style.setProperty('--p', 0);
      });
      await wait(reduceMotion ? 0 : 400);

      const times = rows.map(() => 500 + Math.random() * 900);
      const winner = times.indexOf(Math.min(...times));
      rows.forEach((row, i) => {
        const bar = $('.race__bar', row);
        bar.style.setProperty('--t', reduceMotion ? '0s' : `${times[i]}ms`);
        bar.style.setProperty('--p', 1);
      });

      await Promise.all(rows.map(async (row, i) => {
        await wait(reduceMotion ? 0 : times[i]);
        row.classList.add('is-done', i === winner ? 'is-win' : 'is-lose');
        $('.race__res', row).textContent = i === winner ? '200 · HELD' : '409 Conflict';
        if (i === winner) race.classList.add('is-won');
      }));

      await wait(3200);
    } while (!reduceMotion && race.closest('.panel').classList.contains('is-active'));

    raceRunning = false;
  }

  /* ------------------------------------------------------------------ */
  /* Pointer effects: aurora parallax, panel spotlight, magnetic orbs    */
  /* ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    const aurora = $('.aurora');
    window.addEventListener('pointermove', (e) => {
      if (!aurora || window.scrollY > window.innerHeight) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 50;
      const y = (e.clientY / window.innerHeight - 0.5) * 50;
      aurora.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });

    panels.forEach((panel) => {
      panel.addEventListener('pointermove', (e) => {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty('--x', `${e.clientX - r.left}px`);
        panel.style.setProperty('--y', `${e.clientY - r.top}px`);
      });
    });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Nav: highlight current section                                      */
  /* ------------------------------------------------------------------ */
  const navLinks = $$('.nav__links a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('#projects, #about, #contact').forEach((s) => sectionObserver.observe(s));

  /* ------------------------------------------------------------------ */
  /* Toast + copy email                                                  */
  /* ------------------------------------------------------------------ */
  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showToast('Email copied to clipboard');
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  }
  $$('[data-copy-email]').forEach((btn) => btn.addEventListener('click', copyEmail));

  /* ------------------------------------------------------------------ */
  /* Command palette (Cmd/Ctrl + K)                                      */
  /* ------------------------------------------------------------------ */
  const ICONS = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    github: '<use href="#i-github"/>',
    linkedin: '<use href="#i-linkedin"/>',
    mail: '<use href="#i-mail"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    external: '<use href="#i-external"/>',
  };
  const go = (hash) => () => document.querySelector(hash)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  const open = (url) => () => window.open(url, '_blank', 'noopener');

  const commands = [
    { group: 'Navigate', label: 'Projects', hint: '01', icon: 'arrow', run: go('#projects') },
    { group: 'Navigate', label: 'Ticket Booking API', hint: 'project', icon: 'arrow', run: go('#project-ticket') },
    { group: 'Navigate', label: 'Wissenshappen', hint: 'project', icon: 'arrow', run: go('#project-wissen') },
    { group: 'Navigate', label: 'About', hint: '02', icon: 'arrow', run: go('#about') },
    { group: 'Navigate', label: 'Contact', hint: '03', icon: 'arrow', run: go('#contact') },
    { group: 'Links', label: 'Open GitHub', hint: 'Sot0ru', icon: 'github', run: open('https://github.com/Sot0ru') },
    { group: 'Links', label: 'Open LinkedIn', hint: 'david-tran', icon: 'linkedin', run: open('https://www.linkedin.com/in/david-tran-020411335/') },
    { group: 'Links', label: 'Open Wissenshappen live', hint: 'github.io', icon: 'external', run: open('https://sot0ru.github.io/Wissenserweiterung_website/') },
    { group: 'Contact', label: 'Copy email address', hint: 'clipboard', icon: 'copy', run: copyEmail },
    { group: 'Contact', label: 'Write an email', hint: 'mailto', icon: 'mail', run: () => { window.location.href = `mailto:${EMAIL}`; } },
  ];

  const palette = $('#palette');
  const input = $('#palette-input');
  const list = $('#palette-list');
  let filtered = commands;
  let selected = 0;
  let lastFocus = null;

  $$('[data-mod-key]').forEach((el) => { el.textContent = isMac ? '⌘' : 'Ctrl'; });

  function render() {
    const q = input.value.trim().toLowerCase();
    filtered = commands.filter((c) => `${c.label} ${c.group} ${c.hint}`.toLowerCase().includes(q));
    selected = Math.min(selected, Math.max(0, filtered.length - 1));
    list.innerHTML = '';

    if (!filtered.length) {
      list.innerHTML = '<li class="palette__empty">No results</li>';
      return;
    }

    let group = '';
    filtered.forEach((cmd, i) => {
      if (cmd.group !== group) {
        group = cmd.group;
        const g = document.createElement('li');
        g.className = 'palette__group';
        g.setAttribute('role', 'presentation');
        g.textContent = group;
        list.appendChild(g);
      }
      const li = document.createElement('li');
      li.className = 'palette__item';
      li.id = `cmd-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === selected));
      li.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[cmd.icon]}</svg><span></span><small></small>`;
      li.querySelector('span').textContent = cmd.label;
      li.querySelector('small').textContent = cmd.hint;
      li.addEventListener('pointermove', () => { if (selected !== i) { selected = i; updateSelection(); } });
      li.addEventListener('click', () => execute(i));
      list.appendChild(li);
    });
    input.setAttribute('aria-activedescendant', `cmd-${selected}`);
  }

  function updateSelection() {
    $$('.palette__item', list).forEach((li, i) => li.setAttribute('aria-selected', String(i === selected)));
    $(`#cmd-${selected}`)?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', `cmd-${selected}`);
  }

  function openPalette() {
    lastFocus = document.activeElement;
    palette.hidden = false;
    input.value = '';
    selected = 0;
    render();
    document.body.style.overflow = 'hidden';
    input.focus();
  }

  function closePalette() {
    palette.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }

  function execute(i) {
    const cmd = filtered[i];
    if (!cmd) return;
    closePalette();
    cmd.run();
  }

  input.addEventListener('input', () => { selected = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); selected = (selected + 1) % filtered.length; updateSelection(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selected = (selected - 1 + filtered.length) % filtered.length; updateSelection(); }
    else if (e.key === 'Enter') { e.preventDefault(); execute(selected); }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.hidden ? openPalette() : closePalette();
    } else if (e.key === 'Escape' && !palette.hidden) {
      closePalette();
    } else if (e.key === 'Tab' && !palette.hidden) {
      e.preventDefault();
      input.focus();
    }
  });
  $$('[data-palette-open]').forEach((btn) => btn.addEventListener('click', openPalette));
  $$('[data-palette-close]').forEach((el) => el.addEventListener('click', closePalette));
})();
