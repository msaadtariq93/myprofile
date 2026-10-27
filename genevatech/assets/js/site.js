/* GenevaTech Business School · site behaviour (no dependencies) */
(function () {
  'use strict';
  function drawIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 2 } }); }
  drawIcons();
  /* Films and entrance motion are part of the brand experience (as on gtbs.ch), so they run even when the OS asks for reduced motion; they are muted, slow and decorative. */
  var reduce = false;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Header: solid on scroll */
  var header = $('.header');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-solid', y > 40);
    var tt = $('.to-top'); if (tt) tt.classList.toggle('is-on', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var toTop = $('.to-top');
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* Mobile drawer */
  var drawer = $('#drawer');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    $$('.menu-btn').forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var c = $('.drawer__close', drawer); if (c) c.focus(); }
  }
  $$('.menu-btn').forEach(function (b) { b.addEventListener('click', function () { setDrawer(true); }); });
  if (drawer) {
    $$('.drawer__close, .drawer__scrim', drawer).forEach(function (el) { el.addEventListener('click', function () { setDrawer(false); }); });
    drawer.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
  }

  /* YouTube background films: muted, looping between start and end, poster until playing */
  var films = $$('[data-film]');
  if (films.length && !reduce) {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (prev) prev();
      films.forEach(function (el, i) {
        var start = +el.dataset.start || 0, end = +el.dataset.end || 0;
        var holder = document.createElement('div');
        holder.className = 'film__frame';
        var inner = document.createElement('div');
        inner.id = 'film-' + i;
        holder.appendChild(inner);
        el.insertBefore(holder, el.querySelector('.film__shade'));
        var player = new YT.Player(inner.id, {
          host: 'https://www.youtube-nocookie.com',
          videoId: el.dataset.film,
          playerVars: { autoplay: 1, mute: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1, rel: 0, iv_load_policy: 3, start: start, end: end || undefined, origin: location.origin },
          events: {
            onReady: function (e) { e.target.mute(); e.target.seekTo(start, true); e.target.playVideo(); },
            onStateChange: function (e) {
              if (e.data === YT.PlayerState.PLAYING) { setTimeout(function () { el.classList.add('is-playing'); }, 350); }
              if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(start, true); e.target.playVideo(); }
            }
          }
        });
        if (end) {
          setInterval(function () {
            try { if (player.getCurrentTime && player.getCurrentTime() >= end - 0.3) player.seekTo(start, true); } catch (err) {}
          }, 500);
        }
        /* Pause films that scroll out of view to save bandwidth */
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (en) {
            en.forEach(function (x) {
              try { if (x.isIntersecting) player.playVideo(); else player.pauseVideo(); } catch (err) {}
            });
          }).observe(el);
        }
      });
    };
  }

  /* Modal: video and PDF */
  var lastFocus = null;
  function openModal(html, cls, label) {
    var m = document.createElement('div');
    m.className = 'modal';
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', label || 'Media');
    m.innerHTML = '<div class="modal__box ' + cls + '"><button class="modal__close" type="button" aria-label="Close"><i data-lucide="x" width="20" height="20"></i></button>' + html + '</div>';
    document.body.appendChild(m);
    document.body.style.overflow = 'hidden';
    var close = function () { m.remove(); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    $('.modal__close', m).addEventListener('click', close);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    $('.modal__close', m).focus();
    drawIcons();
  }
  document.addEventListener('click', function (e) {
    var v = e.target.closest('[data-video]');
    if (v) {
      e.preventDefault(); lastFocus = v;
      var id = v.dataset.video, s = v.dataset.start ? '&start=' + v.dataset.start : '';
      openModal('<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + s + '" title="' + (v.dataset.title || 'Video') + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>', 'modal__box--video', v.dataset.title);
      return;
    }
    var p = e.target.closest('[data-pdf]');
    if (p) {
      e.preventDefault(); lastFocus = p;
      var url = p.dataset.pdf, t = p.dataset.title || 'Document';
      openModal('<div class="viewer__bar"><div class="viewer__title">' + t + '</div><div class="viewer__actions"><a href="' + url + '" target="_blank" rel="noopener">Open in new tab</a><a href="' + url + '" download>Download</a></div></div><iframe src="' + url + '#toolbar=1&navpanes=0&view=FitH" title="' + t + '"></iframe>', 'modal__box--pdf', t);
    }
  });

  /* Reveal on scroll + bars */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal, .bar').forEach(function (el) { io.observe(el); });
  } else { $$('.reveal, .bar').forEach(function (el) { el.classList.add('in'); }); }

  /* Carousels */
  $$('[data-carousel]').forEach(function (c) {
    var track = $('.carousel__track', c);
    var items = $$(':scope > *', track);
    var prev = $('[data-prev]', c), next = $('[data-next]', c), dots = $('.carousel__dots', c);
    function step() { return items[0] ? items[0].getBoundingClientRect().width + 24 : 300; }
    function go(dir) {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (dir > 0 && track.scrollLeft >= max) track.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && track.scrollLeft <= 2) track.scrollTo({ left: max, behavior: 'smooth' });
      else track.scrollBy({ left: dir * step(), behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    if (dots) {
      items.forEach(function (_, i) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', function () { track.scrollTo({ left: i * step(), behavior: 'smooth' }); });
        dots.appendChild(b);
      });
      var sync = function () {
        var i = Math.round(track.scrollLeft / step());
        $$('button', dots).forEach(function (b, j) { b.setAttribute('aria-current', String(i === j)); });
      };
      track.addEventListener('scroll', sync, { passive: true }); sync();
    }
    if (c.hasAttribute('data-autoplay') && !reduce) {
      var t = setInterval(function () { go(1); }, 5000);
      c.addEventListener('mouseenter', function () { clearInterval(t); });
      c.addEventListener('focusin', function () { clearInterval(t); });
    }
  });

  /* Programs filter (?program=certificates|diplomas|degrees) */
  var grid = $('#program-grid');
  if (grid) {
    var cards = $$('[data-level]', grid);
    var count = $('#result-count');
    var chips = $$('.chip[data-filter]');
    chips.forEach(function (ch) {
      var v = ch.dataset.filter, n = v === 'all' ? cards.length : cards.filter(function (c) { return c.dataset.level === v; }).length;
      var s = document.createElement('span'); s.className = 'count'; s.textContent = n; ch.appendChild(s);
    });
    function apply(v, push) {
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch.dataset.filter === v)); });
      var shown = 0;
      cards.forEach(function (c) {
        var ok = v === 'all' || c.dataset.level === v;
        if (ok) shown++;
        if (ok) { c.hidden = false; requestAnimationFrame(function () { c.classList.remove('is-hiding'); }); }
        else { c.classList.add('is-hiding'); setTimeout(function () { if (c.classList.contains('is-hiding')) c.hidden = true; }, reduce ? 0 : 300); }
      });
      if (count) count.textContent = shown;
      if (push) { var u = new URL(location.href); if (v === 'all') u.searchParams.delete('program'); else u.searchParams.set('program', v); history.replaceState(null, '', u); }
    }
    chips.forEach(function (ch) { ch.addEventListener('click', function () { apply(ch.dataset.filter, true); }); });
    var start = new URLSearchParams(location.search).get('program');
    apply(chips.some(function (c) { return c.dataset.filter === start; }) ? start : 'all', false);
  }

  /* Tabs */
  $$('[data-tabs]').forEach(function (t) {
    var btns = $$('[role="tab"]', t), panels = $$('[role="tabpanel"]', t);
    function sel(i, focus) {
      btns.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = i !== j; });
      if (focus) btns[i].focus();
      if (btns[i].id) history.replaceState(null, '', '#' + btns[i].id.replace('tab-', ''));
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { sel(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') sel((i + 1) % btns.length, true);
        if (e.key === 'ArrowLeft') sel((i - 1 + btns.length) % btns.length, true);
      });
    });
    var h = location.hash.slice(1), idx = btns.findIndex(function (b) { return b.id === 'tab-' + h; });
    sel(idx >= 0 ? idx : 0);
  });

  /* Subnav scrollspy */
  var sublinks = $$('.subnav a[href^="#"]');
  if (sublinks.length && 'IntersectionObserver' in window) {
    var map = {};
    sublinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) {
          sublinks.forEach(function (a) { a.classList.remove('is-active'); });
          var a = map[x.target.id];
          if (a) { a.classList.add('is-active'); a.scrollIntoView({ block: 'nearest', inline: 'center' }); }
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* FAQ search */
  var fs = $('#faq-search');
  if (fs) {
    var items = $$('.acc details'), none = $('#faq-none');
    fs.addEventListener('input', function () {
      var q = fs.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var ok = !q || d.textContent.toLowerCase().indexOf(q) > -1;
        d.hidden = !ok; if (ok) shown++;
        if (q && ok) d.open = true;
      });
      if (none) none.hidden = shown !== 0;
    });
  }

  /* Document library filter */
  var dl = $('#doc-grid');
  if (dl) {
    var dchips = $$('.chip[data-doc]'), docs = $$('[data-type]', dl);
    dchips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        var v = ch.dataset.doc;
        dchips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === ch)); });
        docs.forEach(function (d) { d.hidden = !(v === 'all' || d.dataset.type === v); });
      });
    });
  }

  /* Forms (front end only until a backend is connected) */
  function validate(scope) {
    var ok = true, first = null;
    $$('[required]', scope).forEach(function (input) {
      if (input.closest('[hidden]')) return;
      var bad;
      if (input.type === 'checkbox') bad = !input.checked;
      else if (input.type === 'radio') bad = !$$('input[name="' + input.name + '"]', scope).some(function (r) { return r.checked; });
      else bad = !input.value.trim() || (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value)) || (input.type === 'url' && input.value && !/^https?:\/\//.test(input.value));
      input.setAttribute('aria-invalid', String(bad));
      var err = scope.querySelector('[data-err-for="' + (input.id || input.name) + '"]');
      if (err) err.hidden = !bad;
      if (bad) { ok = false; if (!first) first = input; }
    });
    if (first) first.focus();
    return ok;
  }
  $$('form[data-form]').forEach(function (f) {
    var panels = $$('.wizard__panel', f), stepsUI = $$('.wizard__steps li', f), cur = 0;
    function show(i, quiet) {
      cur = i;
      panels.forEach(function (p, j) { p.hidden = i !== j; });
      stepsUI.forEach(function (s, j) { s.classList.toggle('is-current', i === j); s.classList.toggle('is-done', j < i); });
      var back = $('[data-back]', f), nxt = $('[data-next-step]', f), sub = $('[type="submit"]', f);
      if (back) back.hidden = i === 0;
      if (nxt) nxt.hidden = i === panels.length - 1;
      if (sub && panels.length) sub.hidden = i !== panels.length - 1;
      if (panels.length && !quiet) f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    if (panels.length) {
      show(0, true);
      $('[data-next-step]', f).addEventListener('click', function () { if (validate(panels[cur])) show(cur + 1); });
      $('[data-back]', f).addEventListener('click', function () { show(cur - 1); });
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(panels.length ? panels[cur] : f)) return;
      f.hidden = true;
      var s = document.getElementById(f.dataset.success); if (s) { s.hidden = false; s.focus(); }
    });
  });
  /* Student rate reveals proof upload */
  $$('input[name="tier"]').forEach(function (r) {
    r.addEventListener('change', function () { var p = $('#proof-field'); if (p) p.hidden = $('input[name="tier"]:checked').value !== 'student'; });
  });
  /* Prefill course from ?course= */
  var cs = $('#f-course');
  if (cs) { var q = new URLSearchParams(location.search).get('course'); if (q) { $$('option', cs).forEach(function (o) { if (o.value === q) cs.value = q; }); } }

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
