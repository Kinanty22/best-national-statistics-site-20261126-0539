/* views.js — perender tiap halaman (rute hash). Setiap halaman dibangun dari
   data NUSA; semua kontrol (urutkan, cari, saring, pilih tahun) berfungsi. */
'use strict';

var Views = (function () {
  var YEARS = NUSA.YEARS;
  var LAST = YEARS[YEARS.length - 1];

  function src(key) { return NUSA.series[key].source; }
  function v(key, year) { return NUSA.valueAt(key, year === undefined ? LAST : year); }
  function fmtID(n, dec) { return Charts.fmt(n, dec === undefined ? 1 : dec); }

  function kpi(label, value, unit, sub) {
    return '<div class="kpi"><div class="k-label">' + label + '</div>' +
      '<div class="k-value">' + value + ' <span class="k-unit">' + unit + '</span></div>' +
      '<div class="k-sub">' + sub + '</div></div>';
  }

  function head(eyebrow, title, intro) {
    return '<div class="pagehead"><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1><p>' + intro + '</p></div>';
  }

  function yearOptions(sel) {
    return YEARS.map(function (y) {
      return '<option value="' + y + '"' + (y === sel ? ' selected' : '') + '>' + y + '</option>';
    }).join('');
  }

  /* ---------- Beranda ---------- */
  function home() {
    var popRows = NUSA.provinces.slice().sort(function (a, b) { return b.pop - a.pop; }).slice(0, 5);
    var topRows = popRows.map(function (p, i) {
      return '<tr><td>' + (i + 1) + '. ' + Charts.esc(p.name) + '</td><td class="num">' + fmtID(p.pop) + '</td>' +
        '<td class="num">' + fmtID(p.hdi, 2) + '</td><td class="num">' + fmtID(p.poverty) + '%</td></tr>';
    }).join('');
    var upd = NUSA.updates.map(function (u) {
      return '<li><b>' + u.date + ':</b> ' + u.text + '</li>';
    }).join('');
    return head('Indonesia · Tahun acuan 2024', 'Statistik Indonesia dalam satu pandangan',
      'Penduduk, ekonomi, dan pembangunan manusia Indonesia — dari data resmi, diperbarui November 2026. Pilih halaman di atas atau gulir untuk sorotan utama.') +
    '<section class="kpis" aria-label="Indikator utama">' +
      kpi('Jumlah penduduk', fmtID(v('population')), 'juta jiwa', 'Sensus 2020: 270,2 juta · +1,1% per tahun') +
      kpi('PDB nominal', 'Rp' + fmtID(v('gdpNominal'), 0), 'triliun', 'Tumbuh <b class="up">+5,03%</b> pada 2024') +
      kpi('PDB per kapita', '$' + fmtID(v('gdpPerCap'), 0), 'USD', 'Bank Dunia, 2024') +
      kpi('Pengangguran', fmtID(v('unemployment')) + '%', '', '<b class="up">Turun</b> dari 5,45% (2023)') +
      kpi('Inflasi', fmtID(v('inflation')) + '%', '', 'Terendah dalam satu dekade') +
      kpi('Penduduk miskin', fmtID(v('poverty')) + '%', '', '<b class="up">Turun</b> dari 9,36% (2023)') +
      kpi('Harapan hidup', fmtID(v('lifeExp')) + ' thn', '', 'Naik dari 71,1 thn (2015)') +
      kpi('IPM', fmtID(v('hdi'), 2), 'indeks', 'Kategori tinggi (BPS)') +
    '</section>' +
    '<div class="grid2">' +
      '<section class="panel"><h2>Pertumbuhan penduduk 2015–2024</h2><p>Jumlah penduduk (juta jiwa). ' + src('population') + '.</p><div class="chartbox">' +
        Charts.lineChart(YEARS.map(String), NUSA.series.population.values, { dec: 1, highlight: 9 }) + '</div></section>' +
      '<section class="panel"><h2>Pertumbuhan ekonomi 2015–2024</h2><p>PDB harga konstan, % per tahun. ' + src('gdpGrowth') + '. Tahun 2020: kontraksi pandemi −2,07%.</p><div class="chartbox">' +
        Charts.barChart(YEARS.map(String), NUSA.series.gdpGrowth.values, { dec: 2, min: -3, highlight: 9 }) + '</div></section>' +
    '</div>' +
    '<div class="grid2">' +
      '<section class="panel"><h2>Pangsa sektor terhadap PDB 2024</h2><p>Industri pengolahan tetap penyumbang terbesar. ' + src('gdpNominal') + '.</p>' +
        Charts.donutChart(NUSA.sectors) + '</section>' +
      '<section class="panel"><h2>Provinsi terpadat 2024</h2><p>Lima provinsi dengan penduduk terbanyak (juta jiwa), beserta IPM dan kemiskinan.</p>' +
        '<table class="data"><thead><tr><th>Provinsi</th><th>Penduduk</th><th>IPM</th><th>Miskin</th></tr></thead><tbody>' + topRows + '</tbody></table>' +
        '<p class="srcnote"><a href="#/provinsi">Lihat semua 38 provinsi →</a></p></section>' +
    '</div>' +
    '<section class="panel"><h2>Negara sekilas</h2><div class="factgrid">' +
      '<div class="fact"><b>' + NUSA.facts.area + '</b><span>Luas daratan</span></div>' +
      '<div class="fact"><b>' + NUSA.facts.islandsCount + '</b><span>Jumlah pulau</span></div>' +
      '<div class="fact"><b>' + NUSA.facts.density + '</b><span>Kepadatan penduduk</span></div>' +
      '<div class="fact"><b>' + NUSA.facts.medianAge + '</b><span>Usia median</span></div>' +
      '<div class="fact"><b>' + NUSA.facts.language + '</b><span>Bahasa resmi</span></div>' +
      '<div class="fact"><b>' + NUSA.facts.timezone + '</b><span>Zona waktu</span></div>' +
    '</div><p class="srcnote">Ibu kota: ' + NUSA.facts.capital + ' · Mata uang: ' + NUSA.facts.currency + '.</p></section>' +
    '<section class="panel"><h2>Pembaruan terakhir</h2><ul class="tight">' + upd + '</ul>' +
    '<p class="srcnote">Sumber: BPS, Bank Indonesia, Bank Dunia. Angka dibulatkan; rincian sumber di <a href="#/metodologi">Metodologi</a>.</p></section>';
  }

  /* ---------- Ekonomi ---------- */
  function ekonomi() {
    var expRows = NUSA.exports.map(function (e) { return { label: e.name, value: e.value }; });
    return head('Ekonomi', 'Ekonomi Indonesia',
      'PDB, inflasi, pengangguran, dan struktur ekonomi — deret 2015–2024 dengan sumber resmi di tiap grafik.') +
    '<section class="kpis">' +
      kpi('PDB nominal 2024', 'Rp' + fmtID(v('gdpNominal'), 0), 'triliun', 'Harga berlaku (BPS)') +
      kpi('Pertumbuhan 2024', fmtID(v('gdpGrowth'), 2) + '%', '', 'Kuartal demi kuartal stabil di ~5%') +
      kpi('Inflasi 2024', fmtID(v('inflation'), 2) + '%', '', 'Dalam sasaran Bank Indonesia 1,5–3,5%') +
      kpi('Pengangguran 2024', fmtID(v('unemployment'), 2) + '%', '', 'Terendah sejak 2015') +
    '</section>' +
    '<div class="grid2">' +
      '<section class="panel"><h2>PDB per kapita 2015–2024</h2><p>USD berlaku. ' + src('gdpPerCap') + '.</p><div class="chartbox">' +
        Charts.lineChart(YEARS.map(String), NUSA.series.gdpPerCap.values, { dec: 0, highlight: 9 }) + '</div></section>' +
      '<section class="panel"><h2>Inflasi 2015–2024</h2><p>IHK, % per tahun. ' + src('inflation') + '. Lonjakan 2022 mengikuti penyesuaian harga BBM.</p><div class="chartbox">' +
        Charts.lineChart(YEARS.map(String), NUSA.series.inflation.values, { dec: 2, highlight: 9 }) + '</div></section>' +
    '</div>' +
    '<section class="panel"><h2>Struktur ekonomi 2024</h2><p>Pangsa tiap sektor terhadap PDB (%). ' + src('gdpNominal') + '.</p><div class="chartbox">' +
      Charts.hbarChart(NUSA.sectors.map(function (s) { return { label: s.name, value: s.share }; }), { dec: 1, suffix: '%' }) + '</div></section>' +
    '<div class="grid2">' +
      '<section class="panel"><h2>Pengangguran terbuka 2015–2024</h2><p>% angkatan kerja. ' + src('unemployment') + '.</p><div class="chartbox">' +
        Charts.barChart(YEARS.map(String), NUSA.series.unemployment.values, { dec: 2, highlight: 9 }) + '</div></section>' +
      '<section class="panel"><h2>Ekspor utama 2024</h2><p>Nilai ekspor komoditas terbesar (miliar USD). BPS &amp; Bank Indonesia (estimasi).</p><div class="chartbox">' +
        Charts.hbarChart(expRows, { dec: 1, labelW: 190 }) + '</div></section>' +
    '</div>' +
    '<section class="panel"><h2>Apa artinya?</h2><ul class="tight">' +
      '<li><b>Pertumbuhan ~5%</b> selama satu dekade — kecuali kontraksi 2020 — ditopang konsumsi rumah tangga dan investasi.</li>' +
      '<li><b>Inflasi 1,57%</b> pada 2024 berada di bawah tengah sasaran Bank Indonesia, memberi ruang bagi suku bunga.</li>' +
      '<li><b>Hilirisasi</b> terlihat pada ekspor: besi-baja dan nikel kini masuk tiga besar, melampaui komoditas mentah tradisional.</li>' +
      '<li><b>Pengangguran 4,91%</b> adalah yang terendah sejak 2015, meski pekerjaan informal masih besar.</li></ul>' +
    '<p class="srcnote">Angka dibulatkan. Lihat <a href="#/penjelajah">Penjelajah</a> untuk memeriksa tiap tahun.</p></section>';
  }

  /* ---------- Penduduk ---------- */
  function penduduk() {
    var rows = NUSA.provinces.slice().sort(function (a, b) { return b.pop - a.pop; }).map(function (p, i) {
      return '<tr><td>' + (i + 1) + '. ' + Charts.esc(p.name) + '</td><td class="num">' + fmtID(p.pop) + '</td>' +
        '<td class="num">' + fmtID(p.hdi, 2) + '</td><td class="num">' + fmtID(p.poverty) + '%</td></tr>';
    }).join('');
    return head('Penduduk', 'Penduduk Indonesia',
      'Jumlah, struktur umur, dan sebaran penduduk — 281,6 juta jiwa pada 2024, lebih dari separuhnya di Jawa.') +
    '<section class="kpis">' +
      kpi('Penduduk 2024', fmtID(v('population')), 'juta jiwa', 'Naik 2,9 juta dari 2023') +
      kpi('Harapan hidup', fmtID(v('lifeExp')) + ' thn', '', 'Perempuan ~76 thn, laki-laki ~72 thn') +
      kpi('Melek huruf 15+', fmtID(v('literacy')) + '%', '', 'Naik dari 94,0% (2015)') +
      kpi('IPM 2024', fmtID(v('hdi'), 2), '', 'Kategori tinggi (BPS)') +
    '</section>' +
    '<div class="grid2">' +
      '<section class="panel"><h2>Jumlah penduduk 2015–2024</h2><p>Juta jiwa. ' + src('population') + '.</p><div class="chartbox">' +
        Charts.lineChart(YEARS.map(String), NUSA.series.population.values, { dec: 1, highlight: 9 }) + '</div></section>' +
      '<section class="panel"><h2>Struktur umur 2024</h2><p>Pangsa penduduk menurut kelompok umur (%). Bonus demografi: 68% penduduk berusia produktif (15–64).</p><div class="chartbox">' +
        Charts.hbarChart(NUSA.ageGroups.map(function (a) { return { label: a.name, value: a.share }; }), { dec: 1, suffix: '%' }) + '</div></section>' +
    '</div>' +
    '<div class="grid2">' +
      '<section class="panel"><h2>Harapan hidup 2015–2024</h2><p>Tahun. ' + src('lifeExp') + '.</p><div class="chartbox">' +
        Charts.lineChart(YEARS.map(String), NUSA.series.lifeExp.values, { dec: 1, highlight: 9 }) + '</div></section>' +
      '<section class="panel"><h2>Kemiskinan 2015–2024</h2><p>% penduduk. ' + src('poverty') + '. Sempat naik saat pandemi 2020, lalu turun ke titik terendah.</p><div class="chartbox">' +
        Charts.barChart(YEARS.map(String), NUSA.series.poverty.values, { dec: 2, highlight: 9 }) + '</div></section>' +
    '</div>' +
    '<section class="panel"><h2>Penduduk per provinsi 2024</h2><p>Diurutkan dari yang terpadat. ' + src('population') + '.</p>' +
      '<table class="data"><thead><tr><th># · Provinsi</th><th>Penduduk (juta)</th><th>IPM</th><th>Miskin (%)</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="srcnote"><a href="#/provinsi">Buka tabel provinsi yang bisa diurutkan dan disaring →</a></p></section>';
  }

  /* ---------- Provinsi ---------- */
  function provinsi(state) {
    state = state || {};
    var q = (state.q || '').toLowerCase();
    var island = state.island || 'Semua pulau';
    var sortKey = state.sort || 'pop';
    var sortDir = state.dir || 'desc';
    var list = NUSA.provinces.filter(function (p) {
      var okQ = !q || p.name.toLowerCase().indexOf(q) !== -1;
      var okI = island === 'Semua pulau' || p.island === island;
      return okQ && okI;
    });
    list.sort(function (a, b) {
      var d = (a[sortKey] > b[sortKey] ? 1 : a[sortKey] < b[sortKey] ? -1 : 0);
      return sortDir === 'desc' ? -d : d;
    });
    var maxPop = Math.max.apply(null, NUSA.provinces.map(function (p) { return p.pop; }));
    var rows = list.map(function (p) {
      return '<tr><td>' + Charts.esc(p.name) + '<br><span class="srcnote">' + Charts.esc(p.island) + '</span></td>' +
        '<td class="num">' + fmtID(p.pop) + '</td>' +
        '<td class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:' + Math.round(p.pop / maxPop * 100) + '%"></div></div></td>' +
        '<td class="num">Rp' + fmtID(p.grdpPc, 1) + ' jt</td>' +
        '<td class="num">' + fmtID(p.hdi, 2) + '</td>' +
        '<td class="num">' + fmtID(p.poverty) + '%</td></tr>';
    }).join('');
    var top10 = NUSA.provinces.slice().sort(function (a, b) { return b.pop - a.pop; }).slice(0, 10)
      .map(function (p) { return { label: p.name, value: p.pop }; });
    var pills = NUSA.islands.map(function (isl) {
      return '<button class="pill" data-island="' + Charts.esc(isl) + '" aria-pressed="' + (isl === island ? 'true' : 'false') + '">' + Charts.esc(isl) + '</button>';
    }).join('');
    function th(key, label) {
      var arrow = sortKey === key ? (sortDir === 'desc' ? ' ▼' : ' ▲') : '';
      return '<th class="sortable" data-sort="' + key + '">' + label + arrow + '</th>';
    }
    return head('Provinsi · 38 provinsi', 'Perbandingan 38 provinsi',
      'Penduduk, PDRB per kapita, IPM, dan kemiskinan tiap provinsi. Klik judul kolom untuk mengurutkan; ketik untuk mencari; saring menurut pulau.') +
    '<div class="controls"><div class="field"><label for="q">Cari provinsi</label>' +
      '<input type="search" id="q" placeholder="cth: Jawa Barat" value="' + Charts.esc(state.q || '') + '"></div>' +
      '<div class="field"><label for="islandSel">Pulau</label><select id="islandSel">' +
      NUSA.islands.map(function (isl) { return '<option' + (isl === island ? ' selected' : '') + '>' + isl + '</option>'; }).join('') +
      '</select></div><button id="resetProv" class="ghost" type="button">Atur ulang</button></div>' +
    '<div class="pillrow" role="group" aria-label="Saring pulau">' + pills + '</div>' +
    '<section class="panel"><h2>10 provinsi terpadat 2024</h2><p>Penduduk (juta jiwa). ' + src('population') + '.</p><div class="chartbox">' +
      Charts.hbarChart(top10, { dec: 1, labelW: 150 }) + '</div></section>' +
    '<section class="panel"><h2>Tabel provinsi — ' + list.length + ' dari 38 provinsi</h2>' +
      '<p>Klik judul kolom untuk mengurutkan. PDRB per kapita dalam juta rupiah per tahun (2024).</p>' +
      '<div style="overflow-x:auto"><table class="data"><thead><tr>' +
      th('name', 'Provinsi') + th('pop', 'Penduduk (juta)') + '<th>Skala</th>' + th('grdpPc', 'PDRB/kapita') + th('hdi', 'IPM') + th('poverty', 'Miskin (%)') +
      '</tr></thead><tbody>' + (rows || '<tr><td colspan="6">Tidak ada provinsi yang cocok. Coba kata kunci lain.</td></tr>') + '</tbody></table></div>' +
      '<p class="srcnote">Sumber: BPS — proyeksi penduduk, PDRB, IPM, dan Susenas 2024 (angka estimasi, dibulatkan). PDRB per kapita tertinggi: DKI Jakarta (Rp322,5 jt) dan Kalimantan Timur (Rp268,5 jt); terendah: Papua Pegunungan (Rp24,6 jt).</p></section>';
  }

  /* ---------- Penjelajah ---------- */
  function penjelajah(state) {
    state = state || {};
    var indKey = state.ind || 'gdpGrowth';
    var year = state.year || LAST;
    var ind = NUSA.series[indKey];
    var val = NUSA.valueAt(indKey, year);
    var prev = NUSA.valueAt(indKey, year - 1);
    var delta = (val !== null && prev !== null) ? (val - prev) : null;
    var deltaTxt = delta === null ? '—' : (delta >= 0 ? '+' : '') + fmtID(delta, 2) + ' poin dari ' + (year - 1);
    var hi = YEARS.indexOf(year);
    var opts = Object.keys(NUSA.series).map(function (k) {
      return '<option value="' + k + '"' + (k === indKey ? ' selected' : '') + '>' + NUSA.series[k].label + ' (' + NUSA.series[k].unit + ')</option>';
    }).join('');
    var rows = YEARS.map(function (y) {
      var vv = NUSA.valueAt(indKey, y);
      return '<tr' + (y === year ? ' style="background:#fdf0d5"' : '') + '><td>' + y + '</td><td class="num"><b>' + fmtID(vv, 2) + '</b> ' + ind.unit + '</td></tr>';
    }).join('');
    return head('Penjelajah deret waktu', 'Penjelajah indikator 2015–2024',
      'Pilih indikator dan tahun, lalu lihat nilainya, perubahannya, dan seluruh deretnya. Semua indikator berasal dari deret resmi yang dirinci di Metodologi.') +
    '<div class="controls"><div class="field"><label for="indSel">Indikator</label><select id="indSel">' + opts + '</select></div>' +
      '<div class="field"><label for="yearSel">Tahun</label><select id="yearSel">' + yearOptions(year) + '</select></div></div>' +
    '<section class="panel"><div class="explorer-hero"><div><div class="bigyear">' + year + '</div>' +
      '<div class="bigval">' + ind.label + ': ' + fmtID(val, 2) + ' ' + ind.unit + '</div>' +
      '<p class="srcnote">Perubahan: ' + deltaTxt + ' · Sumber: ' + ind.source + '.</p></div>' +
      '<div><h2 style="margin:0 0 4px">Sepuluh tahun terakhir</h2><p style="margin:0">Tahun yang dipilih ditandai jingga.</p></div></div>' +
      '<div class="chartbox">' + Charts.lineChart(YEARS.map(String), ind.values, { dec: 2, highlight: hi }) + '</div></section>' +
    '<div class="grid2"><section class="panel"><h2>Nilai per tahun</h2><table class="data"><thead><tr><th>Tahun</th><th>Nilai</th></tr></thead><tbody>' + rows + '</tbody></table></section>' +
    '<section class="panel"><h2>Cara membaca</h2><ul class="tight">' +
      '<li>Setiap indikator memakai definisi resminya (lihat <a href="#/metodologi">Metodologi</a>).</li>' +
      '<li>Perubahan tahunan = selisih nilai tahun ini dengan tahun sebelumnya.</li>' +
      '<li>Tahun 2020 menandai guncangan pandemi pada hampir semua indikator ekonomi.</li>' +
      '<li>Angka 2024 adalah estimasi terakhir dari publikasi resmi; angka dapat direvisi BPS.</li></ul>' +
      '<div class="callout"><b>Contoh cepat:</b> pilih “Penduduk miskin”, lalu tahun 2024 — kemiskinan 8,57%, turun 0,79 poin dari 2023 dan titik terendah dalam deret ini.</div></section></div>';
  }

  /* ---------- Metodologi ---------- */
  function metodologi() {
    var defs = [
      ['Jumlah penduduk', 'Penduduk yang berdomisili di wilayah Indonesia, hasil Sensus Penduduk 2020 dan proyeksi penduduk BPS.'],
      ['PDB nominal', 'Nilai seluruh barang dan jasa akhir yang dihasilkan dalam setahun, harga berlaku (BPS).'],
      ['Pertumbuhan PDB', 'Perubahan PDB harga konstan 2010 terhadap tahun sebelumnya, % (BPS).'],
      ['PDB per kapita', 'PDB dibagi jumlah penduduk, dalam USD berlaku (Bank Dunia).'],
      ['Inflasi', 'Perubahan Indeks Harga Konsumen tahunan, % (BPS). Sasaran Bank Indonesia 2024: 1,5–3,5%.'],
      ['Pengangguran terbuka', 'Pencari kerja dibagi angkatan kerja, % (BPS, Survei Angkatan Kerja Nasional, Agustus).'],
      ['Penduduk miskin', 'Penduduk dengan pengeluaran di bawah garis kemiskinan, % (BPS, Susenas, September).'],
      ['Angka harapan hidup', 'Rata-rata tahun hidup yang diharapkan bagi bayi baru lahir (BPS).'],
      ['IPM', 'Indeks Pembangunan Manusia 0–100 dari kesehatan, pendidikan, dan standar hidup (BPS). ≥70 = tinggi.'],
      ['Melek huruf (15+)', 'Penduduk usia 15 tahun ke atas yang dapat membaca dan menulis (BPS, Susenas).'],
      ['PDRB per kapita', 'PDRB provinsi dibagi penduduknya, juta rupiah per tahun (BPS).']
    ].map(function (d) { return '<dt>' + d[0] + '</dt><dd>' + d[1] + '</dd>'; }).join('');
    return head('Metodologi & sumber', 'Metodologi, sumber & definisi',
      'Bagaimana angka-angka di situs ini dibuat, dari mana asalnya, dan apa batasnya.') +
    '<section class="panel"><h2>Sumber data</h2><ul class="tight">' +
      '<li><b>Badan Pusat Statistik (BPS)</b> — Sensus Penduduk 2020, proyeksi penduduk, PDB &amp; PDRB, IHK, Sakernas, Susenas, IPM. Publikasi: <i>Statistik Indonesia</i>, <i>Berita Resmi Statistik</i>.</li>' +
      '<li><b>Bank Indonesia</b> — sasaran inflasi, statistik moneter, dan neraca pembayaran.</li>' +
      '<li><b>Bank Dunia</b> — PDB per kapita dan indikator pembangunan (World Development Indicators).</li>' +
      '<li><b>Kementerian Keuangan</b> — konteks APBN dan asumsi makro (rujukan silang).</li></ul>' +
      '<p class="srcnote">Tahun acuan utama: 2024. Deret waktu: 2015–2024. Diakses dan dikompilasi November 2026.</p></section>' +
    '<section class="panel"><h2>Definisi indikator</h2><dl class="deflist">' + defs + '</dl></section>' +
    '<section class="panel"><h2>Catatan penting</h2><ul class="tight">' +
      '<li>Angka di situs ini <b>dibulatkan</b> dan merupakan <b>kompilasi estimasi</b> dari publikasi resmi; angka dapat berbeda sedikit dari rilis terbaru karena revisi BPS.</li>' +
      '<li>Angka provinsi adalah estimasi 2024 dari proyeksi dan publikasi daerah; Papua Pegunungan, Papua Selatan, Papua Tengah, dan Papua Barat Daya adalah provinsi baru (pemekaran 2022).</li>' +
      '<li>Situs ini <b>bukan situs resmi BPS</b> dan tidak berafiliasi dengan BPS, Bank Indonesia, atau Bank Dunia. Untuk angka resmi terkini, kunjungi bps.go.id.</li>' +
      '<li>Situs ini berjalan sepenuhnya dari berkas statis tanpa permintaan jaringan: tidak ada pelacak, tidak ada iklan, tidak ada kuki.</li></ul></section>' +
    '<section class="panel"><h2>Cara mengutip</h2><p>“NusaStat — Portal Statistik Indonesia. Kompilasi dari BPS, Bank Indonesia, dan Bank Dunia, tahun acuan 2024, diakses November 2026.”</p>' +
    '<p class="srcnote">Lisensi konten: MIT. Kode situs: MIT (lihat LICENSE di repositori).</p></section>';
  }

  return { home: home, ekonomi: ekonomi, penduduk: penduduk, provinsi: provinsi, penjelajah: penjelajah, metodologi: metodologi };
})();
