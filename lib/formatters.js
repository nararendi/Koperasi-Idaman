/**
 * Helper Format Angka & Mata Uang Rupiah Indonesia (Kaidah EYD & Akuntansi)
 * Contoh: 20000 -> "20.000" / "Rp 20.000"
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
