/**
 * Helper Format Angka & Mata Uang Rupiah Indonesia (Kaidah EYD & Akuntansi)
 * Serta Kalkulator Simulasi Pinjaman Bunga Menurun (Declining Balance) & Pembulatan Pokok
 */

// Format menjadi "Rp 20.000"
export function formatRupiah(num) {
  if (num === null || num === undefined || num === '') return 'Rp 0';
  const val = Number(num) || 0;
  return `Rp ${val.toLocaleString('id-ID')}`;
}

// Format menjadi "20.000" (dengan pemisah titik ribuan)
export function formatNominal(num) {
  if (num === null || num === undefined || num === '') return '0';
  const clean = String(num).replace(/[^0-9]/g, '');
  if (!clean) return '0';
  return Number(clean).toLocaleString('id-ID');
}

// Mengubah format string bertitik ("20.000") kembali menjadi integer murni (20000)
export function parseNominal(str) {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  return Number(String(str).replace(/[^0-9]/g, '')) || 0;
}

// Konversi Angka ke Kata Terbilang Bahasa Indonesia (untuk Kuitansi / Kwitansi Resmi)
export function terbilang(angka) {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  const n = Math.floor(Math.abs(Number(angka) || 0));

  if (n < 12) {
    return bilangan[n];
  } else if (n < 20) {
    return `${terbilang(n - 10)} Belas`;
  } else if (n < 100) {
    return `${terbilang(Math.floor(n / 10))} Puluh ${bilangan[n % 10]}`.trim();
  } else if (n < 200) {
    return `Seratus ${terbilang(n - 100)}`.trim();
  } else if (n < 1000) {
    return `${terbilang(Math.floor(n / 100))} Ratus ${terbilang(n % 100)}`.trim();
  } else if (n < 2000) {
    return `Seribu ${terbilang(n - 1000)}`.trim();
  } else if (n < 1000000) {
    return `${terbilang(Math.floor(n / 1000))} Ribu ${terbilang(n % 1000)}`.trim();
  } else if (n < 1000000000) {
    return `${terbilang(Math.floor(n / 1000000))} Juta ${terbilang(n % 1000000)}`.trim();
  } else if (n < 1000000000000) {
    return `${terbilang(Math.floor(n / 1000000000))} Miliar ${terbilang(n % 1000000000)}`.trim();
  }
  return `${terbilang(Math.floor(n / 1000000000000))} Triliun ${terbilang(n % 1000000000000)}`.trim();
}

/**
 * Kalkulator Simulasi Angsuran Pinjaman:
 * - Pembulatan Pokok / Bulan (misal kelipatan 50.000 sehingga 833.333 jadi 850.000)
 * - Sistem Bunga Menurun (Bulan 1: Plafon x rate, Bulan selanjutnya: Sisa Pokok x rate)
 */
export function hitungSimulasiPinjaman(jumlahPlafon, tenorBulan, bungaPersen, metode = 'menurun', pembulatan = 50000) {
  const plafon = Number(jumlahPlafon) || 0;
  const tenor = Number(tenorBulan) || 1;
  const rate = (Number(bungaPersen) || 0) / 100;

  // Hitung Pokok per Bulan dengan opsi pembulatan ke atas (contoh 833.333 -> 850.000)
  let pokokPerBulan = Math.ceil(plafon / tenor);
  if (pembulatan && pembulatan > 0) {
    pokokPerBulan = Math.ceil((plafon / tenor) / pembulatan) * pembulatan;
  }

  const jadwal = [];
  let sisaPokok = plafon;
  let totalBunga = 0;
  let totalPengembalian = 0;

  for (let i = 1; i <= tenor; i++) {
    if (sisaPokok <= 0) break;

    const sisaAwal = sisaPokok;
    // Bunga menurun: dihitung dari sisa saldo pokok pinjaman
    // Bunga flat: dihitung dari plafon awal
    const bungaBulanIni = metode === 'flat'
      ? Math.round(plafon * rate)
      : Math.round(sisaAwal * rate);

    // Bulan terakhir melunasi sisa pokok yang tersisa
    const pokokBulanIni = (i === tenor || sisaPokok < pokokPerBulan) ? sisaPokok : pokokPerBulan;
    const totalAngsuranBulanIni = pokokBulanIni + bungaBulanIni;
    const sisaAkhir = Math.max(0, sisaAwal - pokokBulanIni);

    jadwal.push({
      bulanKe: i,
      sisaAwal,
      pokok: pokokBulanIni,
      bunga: bungaBulanIni,
      totalAngsuran: totalAngsuranBulanIni,
      sisaAkhir
    });

    sisaPokok = sisaAkhir;
    totalBunga += bungaBulanIni;
    totalPengembalian += totalAngsuranBulanIni;
  }

  const angsuranBulanPertama = jadwal[0] ? jadwal[0].totalAngsuran : 0;
  const bungaBulanPertama = jadwal[0] ? jadwal[0].bunga : 0;
  const pokokBulanPertama = jadwal[0] ? jadwal[0].pokok : 0;

  return {
    plafon,
    tenor,
    bungaPersen,
    metode,
    pembulatan,
    pokokPerBulan: pokokBulanPertama,
    bungaBulanPertama,
    angsuranBulanPertama,
    totalBunga,
    totalPengembalian,
    jadwal
  };
}
