/* main.js — router hash dan wiring kontrol. Tanpa jaringan: tidak ada
   fetch/XHR/WebSocket di mana pun; semua data sudah dimuat dari data.js. */
'use strict';

(function () {
  var app = document.getElementById('app');
  var provState = { q: '', island: 'Semua pulau', sort: 'pop', dir: 'desc' };
  var explState = { ind: 'gdpGrowth', year: 2024 };

  var ROUTES = {
    '': Views.home,
    '/': Views.home,
    '/ekonomi': Views.ekonomi,
    '/penduduk': Views.penduduk,
    '/provinsi': function () { return Views.provinsi(provState); },
    '/penjelajah': function () { return Views.penjelajah(explState); },
    '/metodologi': Views.metodologi
  };
  var NAV = { '': 'home', '/': 'home', '/ekonomi': 'ekonomi', '/penduduk': 'penduduk', '/provinsi': 'provinsi', '/penjelajah': 'penjelajah', '/metodologi': 'metodologi' };

  function render() {
    var hash = (location.hash || '#/').replace(/^#/, '');
    var view = ROUTES[hash] || Views.home;
    app.innerHTML = view();
    var nav = NAV[hash] || 'home';
    var links = document.querySelectorAll('.mainnav a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-nav') === nav) links[i].classList.add('active');
      else links[i].classList.remove('active');
    }
    wireProvinsi();
    wirePenjelajah();
    window.scrollTo(0, 0);
  }

  function wireProvinsi() {
    var q = document.getElementById('q');
    if (!q) return;
    q.addEventListener('input', function () { provState.q = q.value; rerenderKeepFocus('q', q.selectionStart); });
    var sel = document.getElementById('islandSel');
    sel.addEventListener('change', function () { provState.island = sel.value; render(); });
    var pills = document.querySelectorAll('.pill[data-island]');
    for (var i = 0; i < pills.length; i++) {
      pills[i].addEventListener('click', function () {
        provState.island = this.getAttribute('data-island');
        var s = document.getElementById('islandSel');
        if (s) s.value = provState.island;
        render();
      });
    }
    var ths = document.querySelectorAll('th.sortable[data-sort]');
    for (var j = 0; j < ths.length; j++) {
      ths[j].addEventListener('click', function () {
        var key = this.getAttribute('data-sort');
        if (provState.sort === key) provState.dir = provState.dir === 'desc' ? 'asc' : 'desc';
        else { provState.sort = key; provState.dir = key === 'name' ? 'asc' : 'desc'; }
        render();
      });
    }
    var reset = document.getElementById('resetProv');
    if (reset) reset.addEventListener('click', function () {
      provState = { q: '', island: 'Semua pulau', sort: 'pop', dir: 'desc' };
      render();
    });
  }

  function rerenderKeepFocus(id, pos) {
    render();
    var el = document.getElementById(id);
    if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) { /* abaikan */ } }
  }

  function wirePenjelajah() {
    var ind = document.getElementById('indSel');
    if (!ind) return;
    ind.addEventListener('change', function () { explState.ind = ind.value; render(); });
    var yr = document.getElementById('yearSel');
    yr.addEventListener('change', function () { explState.year = parseInt(yr.value, 10); render(); });
  }

  window.addEventListener('hashchange', render);
  render();
})();
