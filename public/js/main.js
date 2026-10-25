/* Penzion U Tří lip – interakce */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hlavička po scrollu ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilní menu ---------- */
  var nav = document.getElementById('main-nav');
  var toggle = document.querySelector('.nav-toggle');
  var toggleLabel = toggle.querySelector('.visually-hidden');

  function setMenu(open, returnFocus) {
    toggle.setAttribute('aria-expanded', String(open));
    toggleLabel.textContent = open ? 'Zavřít menu' : 'Otevřít menu';
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    if (!open && returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true);
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Fade-in při scrollu ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
  // Prvek získá fokus klávesnicí ještě před animací – hned ho ukážeme
  document.addEventListener('focusin', function (e) {
    var r = e.target.closest && e.target.closest('.reveal');
    if (r) r.classList.add('is-visible');
  });

  /* ---------- Akordeon ---------- */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (reduceMotion) { panel.hidden = open; return; }

      clearTimeout(panel._accTimer);
      panel.hidden = false;
      var from = open ? panel.scrollHeight : 0;
      var to = open ? 0 : panel.scrollHeight;
      panel.classList.add('is-animating');
      panel.style.height = from + 'px';
      panel.offsetHeight; // vynutí přepočet, aby animace začala z výchozí výšky
      panel.style.height = to + 'px';
      panel._accTimer = setTimeout(function () {
        panel.classList.remove('is-animating');
        panel.style.height = '';
        panel.hidden = open;
      }, 320);
    });
  });

  /* ---------- Galerie a lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCaption = document.getElementById('lb-caption');
  var lbCount = document.getElementById('lb-count');
  var current = 0;
  var lastTrigger = null;

  function showImage(i) {
    current = (i + items.length) % items.length;
    var a = items[current];
    lbImg.src = a.getAttribute('href');
    lbImg.alt = a.querySelector('img').alt;
    lbCaption.textContent = a.dataset.caption || '';
    lbCount.textContent = (current + 1) + ' / ' + items.length;
    // přednačtení sousední fotky
    new Image().src = items[(current + 1) % items.length].getAttribute('href');
  }
  function openLightbox(i, trigger) {
    lastTrigger = trigger;
    showImage(i);
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }
  function closeLightbox() {
    if (lb.open) lb.close();
  }
  lb.addEventListener('close', function () {
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  });

  items.forEach(function (a, i) {
    a.setAttribute('aria-label', 'Zvětšit fotku: ' + (a.dataset.caption || ''));
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(i, a);
    });
  });
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', function () { showImage(current - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { showImage(current + 1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showImage(current - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); showImage(current + 1); }
    else if (e.key === 'Escape' && !lb.open) closeLightbox();
  });
  // klik mimo fotku zavře
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb-figure')) closeLightbox();
  });
  // swipe na mobilu
  var touchX = null;
  lb.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showImage(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Poptávkový formulář ---------- */
  var ROOMS = {
    'lipa':         { name: 'Lípa',         high: 1450, low: 1250, capacity: 2 },
    'medunka':      { name: 'Medunka',      high: 1650, low: 1400, capacity: 2 },
    'zahrada':      { name: 'Zahrada',      high: 1550, low: 1350, capacity: 3 },
    'stodola':      { name: 'Stodola',      high: 2400, low: 2050, capacity: 4 },
    'pod-strechou': { name: 'Pod střechou', high: 2900, low: 2500, capacity: 5 }
  };
  var BREAKFAST = 180;

  var form = document.getElementById('inquiry-form');
  var f = {
    name: document.getElementById('f-name'),
    email: document.getElementById('f-email'),
    phone: document.getElementById('f-phone'),
    arrival: document.getElementById('f-arrival'),
    departure: document.getElementById('f-departure'),
    adults: document.getElementById('f-adults'),
    children: document.getElementById('f-children'),
    room: document.getElementById('f-room'),
    message: document.getElementById('f-message'),
    consent: document.getElementById('f-consent')
  };
  var summaryBox = document.getElementById('error-summary');
  var confirmation = document.getElementById('confirmation');
  var submitted = false;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDate(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getMonth() === +m[2] - 1 ? d : null;
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function fmtDate(d) { return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear(); }
  function fmtCZK(n) { return n.toLocaleString('cs-CZ') + ' Kč'; }
  function plural(n, one, few, many) { return n === 1 ? one : (n >= 2 && n <= 4 ? few : many); }
  function isHighSeason(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return (m >= 6 && m <= 9) || (m === 12 && day >= 20) || (m === 1 && day <= 2);
  }
  function nightsBreakdown(a, b) {
    var high = 0, low = 0;
    for (var d = new Date(a); d < b; d = addDays(d, 1)) {
      if (isHighSeason(d)) high++; else low++;
    }
    return { high: high, low: low, total: high + low };
  }

  // minimální data v kalendáři
  f.arrival.min = toISO(today());
  f.departure.min = toISO(addDays(today(), 1));
  f.arrival.addEventListener('change', function () {
    var a = parseDate(f.arrival.value);
    if (a) {
      f.departure.min = toISO(addDays(a, 1));
      var dep = parseDate(f.departure.value);
      if (!dep || dep <= a) f.departure.value = toISO(addDays(a, 2));
    }
  });

  function setError(input, msg) {
    var err = document.getElementById(input.id + '-err');
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      err.textContent = msg;
    } else {
      input.removeAttribute('aria-invalid');
      err.textContent = '';
    }
    return msg ? { input: input, msg: msg } : null;
  }

  function validate() {
    var errors = [];
    function check(input, msg) { var r = setError(input, msg); if (r) errors.push(r); }

    var name = f.name.value.trim();
    check(f.name, !name ? 'Vyplňte prosím jméno a příjmení.' : (name.length < 3 ? 'Jméno je nějak krátké – zkontrolujte ho prosím.' : ''));

    var email = f.email.value.trim();
    check(f.email, !email ? 'Vyplňte prosím e-mail, ať vám můžeme odpovědět.' :
      (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'E-mail nevypadá správně (např. jana@email.cz).' : ''));

    var phone = f.phone.value.trim();
    check(f.phone, phone && !/^\+?[\d\s]{9,17}$/.test(phone) ? 'Telefon zadejte jen číslicemi, např. +420 123 456 789.' : '');

    var a = parseDate(f.arrival.value);
    var d = parseDate(f.departure.value);
    var aMsg = '', dMsg = '';
    if (!f.arrival.value) aMsg = 'Vyberte datum příjezdu.';
    else if (!a) aMsg = 'Datum příjezdu není platné.';
    else if (a < today()) aMsg = 'Datum příjezdu nemůže být v minulosti.';
    if (!f.departure.value) dMsg = 'Vyberte datum odjezdu.';
    else if (!d) dMsg = 'Datum odjezdu není platné.';
    else if (a && d <= a) dMsg = 'Odjezd musí být alespoň o den později než příjezd.';
    else if (a && !aMsg) {
      var nb = nightsBreakdown(a, d);
      if (nb.high > 0 && nb.total < 2) dMsg = 'V hlavní sezóně je minimální pobyt 2 noci.';
      else if (nb.total > 30) dMsg = 'Pro pobyty delší než 30 nocí nám prosím zavolejte.';
    }
    check(f.arrival, aMsg);
    check(f.departure, dMsg);

    var adults = parseInt(f.adults.value, 10);
    check(f.adults, !(adults >= 1 && adults <= 15) ? 'Zadejte počet dospělých (1–15).' : '');
    var kidsVal = f.children.value.trim();
    var kids = kidsVal === '' ? 0 : parseInt(kidsVal, 10);
    check(f.children, !(kids >= 0 && kids <= 10) || !/^\d*$/.test(kidsVal) ? 'Zadejte počet dětí (0–10).' : '');

    check(f.consent, !f.consent.checked ? 'Bez souhlasu vám bohužel nemůžeme odpovědět.' : '');
    return errors;
  }

  function showSummary(errors) {
    var ul = summaryBox.querySelector('ul');
    ul.innerHTML = '';
    errors.forEach(function (e) {
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + e.input.id;
      link.textContent = e.msg;
      link.addEventListener('click', function (ev) {
        ev.preventDefault();
        e.input.focus();
      });
      li.appendChild(link);
      ul.appendChild(li);
    });
    summaryBox.hidden = false;
    summaryBox.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitted = true;
    var errors = validate();
    if (errors.length) { showSummary(errors); return; }
    summaryBox.hidden = true;
    showConfirmation();
  });

  // po prvním odeslání průběžně kontrolujeme
  form.addEventListener('input', function () {
    if (!submitted) return;
    var errors = validate();
    if (!errors.length) summaryBox.hidden = true;
  });
  form.addEventListener('change', function () {
    if (submitted) validate();
  });

  function addRow(dl, label, value) {
    var dt = document.createElement('dt'); dt.textContent = label;
    var dd = document.createElement('dd'); dd.textContent = value;
    dl.appendChild(dt); dl.appendChild(dd);
  }

  function showConfirmation() {
    var a = parseDate(f.arrival.value);
    var d = parseDate(f.departure.value);
    var nb = nightsBreakdown(a, d);
    var adults = parseInt(f.adults.value, 10);
    var kids = parseInt(f.children.value || '0', 10);
    var guests = adults + kids;
    var roomKey = f.room.value;
    var breakfast = form.querySelector('input[name="breakfast"]:checked').value === 'ano';

    var dl = document.getElementById('confirm-summary');
    dl.innerHTML = '';
    addRow(dl, 'Jméno', f.name.value.trim());
    addRow(dl, 'E-mail', f.email.value.trim());
    if (f.phone.value.trim()) addRow(dl, 'Telefon', f.phone.value.trim());
    addRow(dl, 'Termín', fmtDate(a) + ' – ' + fmtDate(d) + ' (' + nb.total + ' ' + plural(nb.total, 'noc', 'noci', 'nocí') + ')');
    addRow(dl, 'Hosté', adults + ' ' + plural(adults, 'dospělý', 'dospělí', 'dospělých') +
      (kids ? ', ' + kids + ' ' + plural(kids, 'dítě', 'děti', 'dětí') : ''));
    addRow(dl, 'Pokoj', roomKey ? ROOMS[roomKey].name : 'Nevím, poraďte');
    addRow(dl, 'Snídaně', breakfast ? 'Ano' : 'Ne');
    if (f.message.value.trim()) addRow(dl, 'Zpráva', f.message.value.trim());

    // orientační cena
    var box = document.getElementById('confirm-price');
    box.innerHTML = '';
    function row(label, value, cls) {
      var p = document.createElement('div');
      p.className = 'price-row' + (cls ? ' ' + cls : '');
      var l = document.createElement('span'); l.textContent = label;
      var v = document.createElement('span'); v.textContent = value;
      p.appendChild(l); p.appendChild(v); box.appendChild(p);
    }
    function note(text) {
      var p = document.createElement('p'); p.className = 'price-note'; p.textContent = text; box.appendChild(p);
    }

    var room = roomKey ? ROOMS[roomKey] : null;
    var suggested = false;
    if (!room) {
      // doporučíme nejlevnější pokoj, kam se všichni vejdou
      var fit = Object.keys(ROOMS).map(function (k) { return ROOMS[k]; })
        .filter(function (r) { return r.capacity >= guests; })
        .sort(function (x, y) { return x.high - y.high; });
      room = fit[0] || null;
      suggested = true;
    }

    var heading = document.createElement('div');
    heading.className = 'price-row';
    heading.innerHTML = '<strong>Orientační cena</strong>';
    box.appendChild(heading);

    if (!room) {
      note('Pro ' + guests + ' osob připravíme nabídku na více pokojů nebo celý penzion. Cenu vám pošleme v odpovědi.');
      return finish();
    }

    var total = 0;
    var label = suggested ? 'Doporučujeme pokoj ' + room.name + ': ' : 'Pokoj ' + room.name + ': ';
    if (nb.high) {
      row(label + nb.high + ' × ' + fmtCZK(room.high) + (nb.low ? ' (hlavní sezóna)' : ''), fmtCZK(nb.high * room.high));
      total += nb.high * room.high;
      label = '';
    }
    if (nb.low) {
      row((label || 'Pokoj ' + room.name + ': ') + nb.low + ' × ' + fmtCZK(room.low) + (nb.high ? ' (vedlejší sezóna)' : ''), fmtCZK(nb.low * room.low));
      total += nb.low * room.low;
    }
    if (breakfast) {
      var bf = guests * nb.total * BREAKFAST;
      row('Snídaně: ' + guests + ' ' + plural(guests, 'osoba', 'osoby', 'osob') + ' × ' + nb.total + ' × ' + fmtCZK(BREAKFAST), fmtCZK(bf));
      total += bf;
    }
    row('Celkem orientačně', fmtCZK(total), 'price-total');

    var notes = ['Bez místního poplatku (30 Kč za dospělého a noc). Děti do 3 let mají snídani i pobyt zdarma, přesnou cenu potvrdíme v nabídce.'];
    if (!suggested && guests > room.capacity) {
      notes.unshift('Pozor: pokoj ' + room.name + ' je pro ' + room.capacity + ' ' + plural(room.capacity, 'osobu', 'osoby', 'osob') + '. Navrhneme vám vhodnější variantu nebo přistýlku.');
    }
    if (suggested) notes.unshift('Pokoj jste nevybrali, proto počítáme s nejlevnější vhodnou variantou pro ' + guests + ' ' + plural(guests, 'osobu', 'osoby', 'osob') + '.');
    notes.forEach(note);
    finish();

    function finish() {
      form.hidden = true;
      confirmation.hidden = false;
      scrollToThenFocus(document.getElementById('poptavka'), document.getElementById('confirm-title'));
    }
  }

  document.getElementById('confirm-reset').addEventListener('click', function () {
    form.reset();
    submitted = false;
    Object.keys(f).forEach(function (k) {
      if (document.getElementById(f[k].id + '-err')) setError(f[k], '');
    });
    confirmation.hidden = true;
    form.hidden = false;
    f.name.focus();
  });

  /* ---------- „Poptat tento pokoj“ ---------- */
  document.querySelectorAll('[data-room]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!form.hidden) {
        f.room.value = btn.dataset.room;
      } else {
        document.getElementById('confirm-reset').click();
        f.room.value = btn.dataset.room;
      }
      scrollToThenFocus(document.getElementById('poptavka'), f.room);
      f.room.classList.add('is-highlighted');
      setTimeout(function () { f.room.classList.remove('is-highlighted'); }, 2200);
    });
  });

  // Plynulý posun k sekci; fokus až po dojetí, aby posun nepřerušil
  function scrollToThenFocus(section, el) {
    if (reduceMotion) {
      section.scrollIntoView({ block: 'start' });
      el.focus({ preventScroll: true });
      return;
    }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      window.removeEventListener('scrollend', finish);
      el.focus({ preventScroll: true });
    }
    window.addEventListener('scrollend', finish);
    setTimeout(finish, 1600);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
