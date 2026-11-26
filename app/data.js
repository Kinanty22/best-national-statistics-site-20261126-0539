/* NusaStat data: kompilasi estimasi dari publikasi resmi (BPS, Bank Indonesia,
   Bank Dunia). Angka dibulatkan; tahun acuan tercantum di tiap indikator.
   Bukan data mentah resmi — lihat halaman Metodologi. */
'use strict';
var NUSA = (function () {
  var YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  /* Deret tahunan nasional, urutan mengikuti YEARS. */
  var series = {
    population:  { label: 'Jumlah penduduk', unit: 'juta jiwa',  values: [255.5, 258.7, 261.9, 265.0, 268.1, 270.2, 272.7, 275.8, 278.7, 281.6], source: 'BPS, Sensus Penduduk 2020 & proyeksi penduduk' },
    gdpGrowth:   { label: 'Pertumbuhan PDB', unit: '% y-on-y',  values: [4.88, 5.03, 5.07, 5.17, 5.02, -2.07, 3.70, 5.31, 5.05, 5.03], source: 'BPS, PDB harga konstan 2010' },
    gdpPerCap:   { label: 'PDB per kapita', unit: 'USD',        values: [3365, 3587, 3878, 3932, 4135, 3934, 4350, 4784, 4919, 4960], source: 'Bank Dunia, PDB per kapita (USD berlaku)' },
    inflation:   { label: 'Inflasi (IHK)', unit: '% y-on-y',   values: [3.35, 3.02, 3.61, 3.13, 2.72, 1.68, 1.87, 5.51, 2.61, 1.57], source: 'BPS, Indeks Harga Konsumen' },
    unemployment:{ label: 'Tingkat pengangguran terbuka', unit: '%', values: [6.18, 5.61, 5.50, 5.34, 5.28, 7.07, 6.49, 5.86, 5.45, 4.91], source: 'BPS, Sakernas (Agustus)' },
    poverty:     { label: 'Penduduk miskin', unit: '%',         values: [11.13, 10.86, 10.64, 9.82, 9.41, 10.19, 10.14, 9.57, 9.36, 8.57], source: 'BPS, Susenas (September)' },
    lifeExp:     { label: 'Angka harapan hidup', unit: 'tahun', values: [71.1, 71.4, 71.6, 71.9, 72.1, 71.8, 72.2, 73.0, 73.5, 73.9], source: 'BPS, Angka Harapan Hidup saat lahir' },
    hdi:         { label: 'Indeks Pembangunan Manusia', unit: 'indeks', values: [69.55, 70.18, 70.81, 71.39, 71.92, 71.94, 72.29, 72.91, 74.39, 75.02], source: 'BPS, IPM' },
    literacy:    { label: 'Angka melek huruf (15+)', unit: '%', values: [94.0, 94.2, 94.5, 94.7, 95.0, 95.2, 95.5, 95.9, 96.1, 96.2], source: 'BPS, Susenas' },
    gdpNominal:  { label: 'PDB nominal', unit: 'triliun Rp',   values: [11540, 12430, 13590, 14840, 15834, 15443, 16977, 19543, 20872, 22139], source: 'BPS, PDB harga berlaku' }
  };

  /* Pangsa sektor terhadap PDB 2024 (%, BPS). */
  var sectors = [
    { name: 'Industri pengolahan', share: 18.9 },
    { name: 'Perdagangan besar & eceran', share: 13.0 },
    { name: 'Pertanian, kehutanan & perikanan', share: 11.9 },
    { name: 'Konstruksi', share: 9.9 },
    { name: 'Pertambangan & penggalian', share: 8.5 },
    { name: 'Transportasi & pergudangan', share: 6.6 },
    { name: 'Informasi & komunikasi', share: 4.5 },
    { name: 'Jasa keuangan & asuransi', share: 4.1 },
    { name: 'Akomodasi & makan minum', share: 2.7 },
    { name: 'Sektor lainnya', share: 19.9 }
  ];

  /* Struktur umur 2024 (%, BPS). */
  var ageGroups = [
    { name: '0–14 tahun', share: 24.4 },
    { name: '15–24 tahun', share: 16.6 },
    { name: '25–54 tahun', share: 42.1 },
    { name: '55–64 tahun', share: 9.7 },
    { name: '65+ tahun', share: 7.2 }
  ];

  /* Ekspor utama 2024 (miliar USD, BPS/Bank Indonesia, estimasi). */
  var exports = [
    { name: 'Batu bara', value: 42.5 },
    { name: 'Minyak kelapa sawit (CPO & turunan)', value: 28.6 },
    { name: 'Besi & baja', value: 27.9 },
    { name: 'Nikel & produk olahannya', value: 13.4 },
    { name: 'Karet & barang dari karet', value: 8.9 },
    { name: 'Pakaian jadi & tekstil', value: 8.2 },
    { name: 'Alas kaki', value: 7.4 },
    { name: 'Elektronik', value: 6.8 }
  ];

  /* 38 provinsi: [nama, pulau, penduduk 2024 (juta), PDRB per kapita 2024 (juta Rp),
     IPM 2024, kemiskinan 2024 (%)]. Estimasi dari BPS (proyeksi penduduk, PDRB, IPM, Susenas). */
  var provinces = [
    ['Aceh', 'Sumatera', 5.55, 42.1, 74.6, 14.2],
    ['Sumatera Utara', 'Sumatera', 15.59, 61.5, 75.6, 8.2],
    ['Sumatera Barat', 'Sumatera', 5.76, 53.8, 76.4, 5.8],
    ['Riau', 'Sumatera', 6.61, 128.4, 75.9, 6.6],
    ['Jambi', 'Sumatera', 3.68, 70.2, 74.6, 7.6],
    ['Sumatera Selatan', 'Sumatera', 8.84, 72.6, 73.6, 11.8],
    ['Bengkulu', 'Sumatera', 2.10, 49.3, 75.1, 13.7],
    ['Lampung', 'Sumatera', 9.32, 48.9, 73.4, 11.8],
    ['Kep. Bangka Belitung', 'Sumatera', 1.50, 62.4, 74.3, 4.2],
    ['Kepulauan Riau', 'Sumatera', 2.22, 168.9, 81.0, 5.4],
    ['DKI Jakarta', 'Jawa', 10.71, 322.5, 84.2, 4.3],
    ['Jawa Barat', 'Jawa', 49.94, 52.8, 75.1, 7.5],
    ['Jawa Tengah', 'Jawa', 38.01, 45.6, 74.4, 10.5],
    ['DI Yogyakarta', 'Jawa', 3.80, 47.9, 81.8, 10.8],
    ['Jawa Timur', 'Jawa', 41.81, 68.4, 75.4, 9.8],
    ['Banten', 'Jawa', 12.43, 66.1, 77.0, 6.2],
    ['Bali', 'Bali & Nusa Tenggara', 4.42, 63.7, 78.0, 3.7],
    ['Nusa Tenggara Barat', 'Bali & Nusa Tenggara', 5.68, 32.4, 71.2, 12.7],
    ['Nusa Tenggara Timur', 'Bali & Nusa Tenggara', 5.58, 26.8, 68.5, 19.2],
    ['Kalimantan Barat', 'Kalimantan', 5.78, 47.2, 71.4, 6.8],
    ['Kalimantan Tengah', 'Kalimantan', 2.83, 74.6, 73.7, 5.0],
    ['Kalimantan Selatan', 'Kalimantan', 4.31, 66.8, 74.5, 4.2],
    ['Kalimantan Timur', 'Kalimantan', 3.99, 268.5, 78.8, 5.8],
    ['Kalimantan Utara', 'Kalimantan', 0.75, 178.2, 74.1, 6.5],
    ['Sulawesi Utara', 'Sulawesi', 2.70, 63.5, 76.9, 7.4],
    ['Sulawesi Tengah', 'Sulawesi', 3.10, 77.4, 73.2, 12.1],
    ['Sulawesi Selatan', 'Sulawesi', 9.42, 62.9, 75.5, 8.2],
    ['Sulawesi Tenggara', 'Sulawesi', 2.81, 71.8, 74.0, 11.0],
    ['Gorontalo', 'Sulawesi', 1.29, 40.5, 72.1, 14.1],
    ['Sulawesi Barat', 'Sulawesi', 1.60, 44.2, 70.8, 10.6],
    ['Maluku', 'Maluku & Papua', 1.93, 36.9, 72.2, 16.2],
    ['Maluku Utara', 'Maluku & Papua', 1.41, 58.3, 71.8, 6.3],
    ['Papua', 'Maluku & Papua', 1.13, 74.1, 63.4, 21.5],
    ['Papua Pegunungan', 'Maluku & Papua', 1.48, 24.6, 54.7, 33.4],
    ['Papua Selatan', 'Maluku & Papua', 0.55, 52.3, 61.2, 20.1],
    ['Papua Tengah', 'Maluku & Papua', 1.35, 61.8, 60.9, 26.8],
    ['Papua Barat', 'Maluku & Papua', 0.59, 96.4, 67.4, 20.0],
    ['Papua Barat Daya', 'Maluku & Papua', 0.65, 88.7, 69.8, 17.9]
  ].map(function (r) {
    return { name: r[0], island: r[1], pop: r[2], grdpPc: r[3], hdi: r[4], poverty: r[5] };
  });

  var islands = ['Semua pulau', 'Jawa', 'Sumatera', 'Kalimantan', 'Sulawesi', 'Bali & Nusa Tenggara', 'Maluku & Papua'];

  var facts = {
    capital: 'Nusantara (pemerintahan) · Jakarta (pusat ekonomi)',
    area: '1.905.000 km²',
    islandsCount: '17.508 pulau',
    density: '148 jiwa/km² (2024)',
    medianAge: '30,1 tahun (2024)',
    currency: 'Rupiah (IDR)',
    language: 'Bahasa Indonesia',
    timezone: 'WIB · WITA · WIT (UTC+7 s.d. +9)'
  };

  var updates = [
    { date: 'Nov 2026', text: 'BPS: penduduk Indonesia 281,6 juta jiwa (estimasi pertengahan 2024).' },
    { date: 'Nov 2026', text: 'PDB tumbuh 5,03% pada 2024; PDB nominal Rp22.139 triliun.' },
    { date: 'Okt 2026', text: 'Inflasi 2024 tercatat 1,57% — terendah dalam satu dekade.' },
    { date: 'Sep 2026', text: 'Tingkat kemiskinan turun ke 8,57% (September 2024).' },
    { date: 'Agu 2026', text: 'Pengangguran terbuka 4,91% (Agustus 2024), terendah sejak 2015.' },
    { date: 'Jul 2026', text: 'IPM 2024 mencapai 75,02 — kategori tinggi.' }
  ];

  function valueAt(key, year) {
    var s = series[key];
    var i = YEARS.indexOf(year);
    return i < 0 ? null : s.values[i];
  }

  return {
    YEARS: YEARS, series: series, sectors: sectors, ageGroups: ageGroups,
    exports: exports, provinces: provinces, islands: islands, facts: facts,
    updates: updates, valueAt: valueAt
  };
})();
