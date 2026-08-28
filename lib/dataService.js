import { supabase } from './supabase';

const STORAGE_KEY = 'koperasi_idaman_db_v1';

// Initial default seed data
const initialData = {
  settings: {
    namaKoperasi: 'Koperasi Simpan Pinjam Idaman',
    badanHukum: 'AHU-0012948.AH.01.26.TAHUN 2020',
    alamat: 'Jl. Jenderal Sudirman No. 45, Jakarta Pusat',
    telepon: '(021) 5798-2345',
    email: 'info@koperasi-idaman.co.id',
    ketua: 'Drs. H. M. Supriyadi, M.M.',
    bendahara: 'Ratna Kusuma, S.E.',
    simpananPokok: 500000,
    simpananWajib: 100000,
    sukuBungaPinjaman: 1.5, // % per bulan
    shuPersenAnggota: 40,
    shuPersenModal: 30,
    shuPersenPengurus: 20,
    shuPersenCadangan: 10
  },
  anggota: [
    {
      id: 'ANG-2023-001',
      nomor_anggota: 'ANG-2023-001',
      nama: 'Budi Santoso',
      nama_lengkap: 'Budi Santoso',
      alamat: 'Jl. Merdeka No. 10, Jakarta Pusat',
      alamat_lengkap: 'Jl. Merdeka No. 10, Jakarta Pusat',
      nomor_hp: '0812-3456-7890',
      pekerjaan: 'Pegawai Swasta',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1985-04-12',
      tanggal_daftar: '2023-01-15',
      status: 'Aktif',
      status_keanggotaan: 'aktif'
    },
    {
      id: 'ANG-2023-002',
      nomor_anggota: 'ANG-2023-002',
      nama: 'Siti Aminah',
      nama_lengkap: 'Siti Aminah',
      alamat: 'Jl. Sudirman Blok B4, Bandung',
      alamat_lengkap: 'Jl. Sudirman Blok B4, Bandung',
      nomor_hp: '0856-7890-1234',
      pekerjaan: 'Wiraswasta',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '1990-08-23',
      tanggal_daftar: '2023-02-02',
      status: 'Aktif',
      status_keanggotaan: 'aktif'
    },
    {
      id: 'ANG-2023-018',
      nomor_anggota: 'ANG-2023-018',
      nama: 'Dewi Lestari',
      nama_lengkap: 'Dewi Lestari',
      alamat: 'Komp. Mawar Hijau No. 12, Semarang',
      alamat_lengkap: 'Komp. Mawar Hijau No. 12, Semarang',
      nomor_hp: '0899-8877-6655',
      pekerjaan: 'Guru',
      tempat_lahir: 'Semarang',
      tanggal_lahir: '1988-11-05',
      tanggal_daftar: '2023-03-05',
      status: 'Aktif',
      status_keanggotaan: 'aktif'
    },
    {
      id: 'ANG-2024-001',
      nomor_anggota: 'ANG-2024-001',
      nama: 'Eko Prasetyo',
      nama_lengkap: 'Eko Prasetyo',
      alamat: 'Jl. Pahlawan Gg. 3, Malang',
      alamat_lengkap: 'Jl. Pahlawan Gg. 3, Malang',
      nomor_hp: '0813-5555-4444',
      pekerjaan: 'Wiraswasta',
      tempat_lahir: 'Malang',
      tanggal_lahir: '1992-06-17',
      tanggal_daftar: '2024-01-01',
      status: 'Aktif',
      status_keanggotaan: 'aktif'
    },
    {
      id: 'ANG-2024-002',
      nomor_anggota: 'ANG-2024-002',
      nama: 'Ahmad Dahlan',
      nama_lengkap: 'Ahmad Dahlan',
      alamat: 'Jl. Diponegoro No. 88, Surabaya',
      alamat_lengkap: 'Jl. Diponegoro No. 88, Surabaya',
      nomor_hp: '0811-2233-4455',
      pekerjaan: 'Dosen',
      tempat_lahir: 'Surabaya',
      tanggal_lahir: '1979-02-14',
      tanggal_daftar: '2024-02-10',
      status: 'Aktif',
      status_keanggotaan: 'aktif'
    }
  ],
  simpanan: [
    {
      id: 'SMP-001',
      nomor_anggota: 'ANG-2023-001',
      nama_anggota: 'Budi Santoso',
      tanggal: '2024-05-01',
      jenis: 'Pokok',
      jumlah: 500000,
      metode: 'Tunai',
      pencatat: 'Admin Kasir',
      keterangan: 'Simpanan Pokok saat registrasi'
    },
    {
      id: 'SMP-002',
      nomor_anggota: 'ANG-2023-001',
      nama_anggota: 'Budi Santoso',
      tanggal: '2024-05-15',
      jenis: 'Wajib',
      jumlah: 100000,
      metode: 'Transfer Bank',
      pencatat: 'Admin Kasir',
      keterangan: 'Simpanan Wajib Mei 2024'
    },
    {
      id: 'SMP-003',
      nomor_anggota: 'ANG-2023-001',
      nama_anggota: 'Budi Santoso',
      tanggal: '2024-05-20',
      jenis: 'Sukarela',
      jumlah: 1500000,
      metode: 'Transfer Bank',
      pencatat: 'Admin Kasir',
      keterangan: 'Tabungan sukarela tambahan'
    },
    {
      id: 'SMP-004',
      nomor_anggota: 'ANG-2023-002',
      nama_anggota: 'Siti Aminah',
      tanggal: '2024-05-02',
      jenis: 'Pokok',
      jumlah: 500000,
      metode: 'Tunai',
      pencatat: 'Admin Kasir',
      keterangan: 'Simpanan Pokok awal'
    },
    {
      id: 'SMP-005',
      nomor_anggota: 'ANG-2023-002',
      nama_anggota: 'Siti Aminah',
      tanggal: '2024-05-18',
      jenis: 'Wajib',
      jumlah: 100000,
      metode: 'Tunai',
      pencatat: 'Admin Kasir',
      keterangan: 'Simpanan Wajib Mei 2024'
    },
    {
      id: 'SMP-006',
      nomor_anggota: 'ANG-2023-018',
      nama_anggota: 'Dewi Lestari',
      tanggal: '2024-05-05',
      jenis: 'Pokok',
      jumlah: 500000,
      metode: 'Tunai',
      pencatat: 'Admin Kasir',
      keterangan: 'Simpanan Pokok awal'
    },
    {
      id: 'SMP-007',
      nomor_anggota: 'ANG-2023-018',
      nama_anggota: 'Dewi Lestari',
      tanggal: '2024-05-19',
      jenis: 'Wajib',
      jumlah: 100000,
      metode: 'Tunai',
      pencatat: 'Admin Kasir',
      keterangan: 'Setoran Wajib bulanan'
    },
    {
      id: 'SMP-008',
      nomor_anggota: 'ANG-2024-001',
      nama_anggota: 'Eko Prasetyo',
      tanggal: '2024-05-10',
      jenis: 'Pokok',
      jumlah: 500000,
      metode: 'Transfer Bank',
      pencatat: 'Admin Kasir',
      keterangan: 'Setoran Pokok anggota baru'
    },
    {
      id: 'SMP-009',
      nomor_anggota: 'ANG-2024-002',
      nama_anggota: 'Ahmad Dahlan',
      tanggal: '2024-05-12',
      jenis: 'Pokok',
      jumlah: 500000,
      metode: 'Tunai',
      pencatat: 'Admin Kasir',
      keterangan: 'Setoran Pokok anggota baru'
    }
  ],
  pinjaman: [
    {
      id: 'PJ-2024-001',
      nomor_pinjaman: 'PJ-2024-001',
      nomor_anggota: 'ANG-2023-001',
      nama: 'Budi Santoso',
      tanggal: '2024-04-10',
      jumlah: 15000000,
      bunga: 1.5,
      tenor: 12,
      angsuran_pokok: 1250000,
      angsuran_bunga: 225000,
      total_angsuran_bulanan: 1475000,
      total_pinjaman: 17700000,
      total_terbayar: 2950000,
      sisa_hutang: 14750000,
      status: 'Berjalan',
      keperluan: 'Modal Usaha Toko Kelontong',
      riwayat_angsuran: [
        {
          id: 'ANGS-001',
          tanggal: '2024-05-10',
          angsuran_ke: 1,
          jumlah: 1475000,
          penerima: 'Admin Kasir',
          metode: 'Transfer Bank'
        },
        {
          id: 'ANGS-002',
          tanggal: '2024-06-10',
          angsuran_ke: 2,
          jumlah: 1475000,
          penerima: 'Admin Kasir',
          metode: 'Transfer Bank'
        }
      ]
    },
    {
      id: 'PJ-2024-002',
      nomor_pinjaman: 'PJ-2024-002',
      nomor_anggota: 'ANG-2023-002',
      nama: 'Siti Aminah',
      tanggal: '2024-05-15',
      jumlah: 5000000,
      bunga: 1.5,
      tenor: 6,
      angsuran_pokok: 833333,
      angsuran_bunga: 75000,
      total_angsuran_bulanan: 908333,
      total_pinjaman: 5450000,
      total_terbayar: 0,
      sisa_hutang: 5450000,
      status: 'Diajukan',
      keperluan: 'Renovasi Rumah Ringan',
      riwayat_angsuran: []
    },
    {
      id: 'PJ-2024-003',
      nomor_pinjaman: 'PJ-2024-003',
      nomor_anggota: 'ANG-2024-001',
      nama: 'Eko Prasetyo',
      tanggal: '2024-05-18',
      jumlah: 10000000,
      bunga: 1.5,
      tenor: 12,
      angsuran_pokok: 833333,
      angsuran_bunga: 150000,
      total_angsuran_bulanan: 983333,
      total_pinjaman: 11800000,
      total_terbayar: 0,
      sisa_hutang: 11800000,
      status: 'Disetujui',
      keperluan: 'Pembelian Inventaris Kerja',
      riwayat_angsuran: []
    }
  ],
  kas: [
    {
      id: 'KAS-001',
      tanggal: '2024-05-01',
      jenis: 'Penerimaan',
      kategori: 'Simpanan Pokok',
      jumlah: 2500000,
      keterangan: 'Penerimaan Simpanan Pokok Anggota Baru',
      ref_id: 'SMP-001'
    },
    {
      id: 'KAS-002',
      tanggal: '2024-05-10',
      jenis: 'Penerimaan',
      kategori: 'Angsuran Pinjaman',
      jumlah: 1475000,
      keterangan: 'Angsuran ke-1 Pinjaman Budi Santoso (PJ-2024-001)',
      ref_id: 'ANGS-001'
    },
    {
      id: 'KAS-003',
      tanggal: '2024-05-12',
      jenis: 'Pengeluaran',
      kategori: 'Operasional',
      jumlah: 350000,
      keterangan: 'Pembelian Alat Tulis Kantor & Kertas',
      ref_id: ''
    },
    {
      id: 'KAS-004',
      tanggal: '2024-05-15',
      jenis: 'Penerimaan',
      kategori: 'Simpanan Wajib',
      jumlah: 300000,
      keterangan: 'Setoran Simpanan Wajib Anggota',
      ref_id: 'SMP-002'
    },
    {
      id: 'KAS-005',
      tanggal: '2024-05-19',
      jenis: 'Penerimaan',
      kategori: 'Simpanan Sukarela',
      jumlah: 1500000,
      keterangan: 'Setoran Simpanan Sukarela Budi Santoso',
      ref_id: 'SMP-003'
    },
    {
      id: 'KAS-006',
      tanggal: '2024-05-20',
      jenis: 'Pengeluaran',
      kategori: 'Operasional',
      jumlah: 200000,
      keterangan: 'Biaya Konsumsi Rapat Pengurus Koperasi',
      ref_id: ''
    }
  ]
};

// Helper: load DB from LocalStorage or initialize with seed
function getDB() {
  if (typeof window === 'undefined') {
    return initialData;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return {
      settings: { ...initialData.settings, ...(parsed.settings || {}) },
      anggota: parsed.anggota || initialData.anggota,
      simpanan: parsed.simpanan || initialData.simpanan,
      pinjaman: parsed.pinjaman || initialData.pinjaman,
      kas: parsed.kas || initialData.kas
    };
  } catch (e) {
    console.error('Error reading localStorage DB:', e);
    return initialData;
  }
}

// Helper: save DB to LocalStorage and trigger window event
function saveDB(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('koperasi_db_updated'));
  } catch (e) {
    console.error('Error writing localStorage DB:', e);
  }
}

export const dataService = {
  // --- ANGGOTA ---
  getAnggotaList() {
    const db = getDB();
    return db.anggota || [];
  },

  getAnggotaById(id) {
    const db = getDB();
    return (db.anggota || []).find((a) => a.id === id || a.nomor_anggota === id);
  },

  addAnggota(anggotaData, autoSimpananPokok = true) {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    const id = anggotaData.nomor_anggota || `ANG-${year}-${String(db.anggota.length + 1).padStart(3, '0')}`;

    const newAnggota = {
      id,
      nomor_anggota: id,
      nama: anggotaData.nama || anggotaData.nama_lengkap || '',
      nama_lengkap: anggotaData.nama_lengkap || anggotaData.nama || '',
      alamat: anggotaData.alamat || anggotaData.alamat_lengkap || '',
      alamat_lengkap: anggotaData.alamat_lengkap || anggotaData.alamat || '',
      nomor_hp: anggotaData.nomor_hp || '',
      pekerjaan: anggotaData.pekerjaan || '-',
      tempat_lahir: anggotaData.tempat_lahir || '-',
      tanggal_lahir: anggotaData.tanggal_lahir || '',
      tanggal_daftar: anggotaData.tanggal_daftar || today,
      status: anggotaData.status || anggotaData.status_keanggotaan || 'Aktif',
      status_keanggotaan: anggotaData.status_keanggotaan || anggotaData.status || 'Aktif'
    };

    db.anggota.unshift(newAnggota);

    if (autoSimpananPokok) {
      const nominalPokok = db.settings.simpananPokok || 500000;
      const simpananId = `SMP-${Date.now().toString().slice(-4)}`;
      const newSimpanan = {
        id: simpananId,
        nomor_anggota: id,
        nama_anggota: newAnggota.nama,
        tanggal: today,
        jenis: 'Pokok',
        jumlah: nominalPokok,
        metode: 'Tunai',
        pencatat: 'Admin Sistem',
        keterangan: 'Simpanan Pokok saat pendaftaran anggota baru'
      };
      db.simpanan.unshift(newSimpanan);

      db.kas.unshift({
        id: `KAS-${Date.now().toString().slice(-4)}`,
        tanggal: today,
        jenis: 'Penerimaan',
        kategori: 'Simpanan Pokok',
        jumlah: nominalPokok,
        keterangan: `Simpanan Pokok pendaftaran ${newAnggota.nama} (${id})`,
        ref_id: simpananId
      });
    }

    saveDB(db);

    try {
      if (supabase && typeof supabase.from === 'function') {
        supabase.from('anggota').insert([newAnggota]).then(({ error }) => {
          if (error) console.info('Supabase async sync note:', error.message);
        });
      }
    } catch (_) {}

    return newAnggota;
  },

  updateAnggota(id, updatedFields) {
    const db = getDB();
    const index = db.anggota.findIndex((a) => a.id === id || a.nomor_anggota === id);
    if (index !== -1) {
      db.anggota[index] = {
        ...db.anggota[index],
        ...updatedFields,
        nama: updatedFields.nama || updatedFields.nama_lengkap || db.anggota[index].nama,
        nama_lengkap: updatedFields.nama_lengkap || updatedFields.nama || db.anggota[index].nama_lengkap,
        alamat: updatedFields.alamat || updatedFields.alamat_lengkap || db.anggota[index].alamat,
        alamat_lengkap: updatedFields.alamat_lengkap || updatedFields.alamat || db.anggota[index].alamat_lengkap,
        status: updatedFields.status || updatedFields.status_keanggotaan || db.anggota[index].status,
        status_keanggotaan: updatedFields.status_keanggotaan || updatedFields.status || db.anggota[index].status_keanggotaan
      };
      saveDB(db);
      return db.anggota[index];
    }
    return null;
  },

  deleteAnggota(id) {
    const db = getDB();
    db.anggota = db.anggota.filter((a) => a.id !== id && a.nomor_anggota !== id);
    saveDB(db);
    return true;
  },

  // --- SIMPANAN ---
  getSimpananList() {
    const db = getDB();
    return db.simpanan || [];
  },

  getSimpananSummary() {
    const db = getDB();
    const list = db.simpanan || [];

    let totalPokok = 0;
    let totalWajib = 0;
    let totalSukarela = 0;

    list.forEach((item) => {
      const amount = Number(item.jumlah || 0);
      const isWithdrawal = item.tipe === 'Penarikan' || (item.keterangan || '').toLowerCase().includes('tarik');
      const val = isWithdrawal ? -amount : amount;

      const j = (item.jenis || '').toLowerCase();
      if (j.includes('pokok')) totalPokok += val;
      else if (j.includes('wajib')) totalWajib += val;
      else if (j.includes('sukarela')) totalSukarela += val;
    });

    return {
      pokok: totalPokok,
      wajib: totalWajib,
      sukarela: totalSukarela,
      total: totalPokok + totalWajib + totalSukarela
    };
  },

  getSimpananByAnggota(nomor_anggota) {
    const db = getDB();
    return (db.simpanan || []).filter((s) => s.nomor_anggota === nomor_anggota);
  },

  addSimpananTransaction({ nomor_anggota, jenis, tipe = 'Setoran', jumlah, metode = 'Tunai', keterangan = '', pencatat = 'Admin' }) {
    const db = getDB();
    const anggota = db.anggota.find((a) => a.nomor_anggota === nomor_anggota || a.id === nomor_anggota);
    const nama_anggota = anggota ? (anggota.nama_lengkap || anggota.nama) : 'Anggota';
    const today = new Date().toISOString().split('T')[0];
    const simpananId = `SMP-${Date.now().toString().slice(-4)}`;

    const newSimpanan = {
      id: simpananId,
      nomor_anggota,
      nama_anggota,
      tanggal: today,
      jenis,
      tipe,
      jumlah: Number(jumlah),
      metode,
      pencatat,
      keterangan: keterangan || `${tipe} Simpanan ${jenis}`
    };

    db.simpanan.unshift(newSimpanan);

    const isPenerimaan = tipe === 'Setoran';
    db.kas.unshift({
      id: `KAS-${Date.now().toString().slice(-4)}`,
      tanggal: today,
      jenis: isPenerimaan ? 'Penerimaan' : 'Pengeluaran',
      kategori: `Simpanan ${jenis}`,
      jumlah: Number(jumlah),
      keterangan: `${tipe} ${jenis} a/n ${nama_anggota} (${nomor_anggota})`,
      ref_id: simpananId
    });

    saveDB(db);
    return newSimpanan;
  },

  // --- PINJAMAN ---
  getPinjamanList() {
    const db = getDB();
    return db.pinjaman || [];
  },

  getPinjamanSummary() {
    const db = getDB();
    const list = db.pinjaman || [];

    let totalBerjalan = 0;
    let totalLunas = 0;
    let totalDiajukan = 0;
    let totalSisaHutang = 0;

    list.forEach((p) => {
      const j = Number(p.jumlah || 0);
      const s = Number(p.sisa_hutang || 0);
      if (p.status === 'Berjalan') {
        totalBerjalan += j;
        totalSisaHutang += s;
      } else if (p.status === 'Lunas') {
        totalLunas += j;
      } else if (p.status === 'Diajukan') {
        totalDiajukan += j;
      }
    });

    return {
      berjalan: totalBerjalan,
      lunas: totalLunas,
      diajukan: totalDiajukan,
      sisaHutang: totalSisaHutang
    };
  },

  getPinjamanByAnggota(nomor_anggota) {
    const db = getDB();
    return (db.pinjaman || []).filter((p) => p.nomor_anggota === nomor_anggota);
  },

  applyPinjaman({ nomor_anggota, jumlah, bunga, tenor, keperluan = '' }) {
    const db = getDB();
    const anggota = db.anggota.find((a) => a.nomor_anggota === nomor_anggota || a.id === nomor_anggota);
    const nama = anggota ? (anggota.nama_lengkap || anggota.nama) : 'Anggota';
    const today = new Date().toISOString().split('T')[0];
    const id = `PJ-${new Date().getFullYear()}-${String(db.pinjaman.length + 1).padStart(3, '0')}`;

    const numJumlah = Number(jumlah);
    const numBungaPercent = Number(bunga || db.settings.sukuBungaPinjaman || 1.5);
    const numTenor = Number(tenor || 12);

    const angsuranPokokPerBulan = Math.round(numJumlah / numTenor);
    const bungaPerBulan = Math.round(numJumlah * (numBungaPercent / 100));
    const angsuranBulanan = angsuranPokokPerBulan + bungaPerBulan;
    const totalPengembalian = angsuranBulanan * numTenor;

    const newPinjaman = {
      id,
      nomor_pinjaman: id,
      nomor_anggota,
      nama,
      tanggal: today,
      jumlah: numJumlah,
      bunga: numBungaPercent,
      tenor: numTenor,
      angsuran_pokok: angsuranPokokPerBulan,
      angsuran_bunga: bungaPerBulan,
      total_angsuran_bulanan: angsuranBulanan,
      total_pinjaman: totalPengembalian,
      total_terbayar: 0,
      sisa_hutang: totalPengembalian,
      status: 'Diajukan',
      keperluan,
      riwayat_angsuran: []
    };

    db.pinjaman.unshift(newPinjaman);
    saveDB(db);
    return newPinjaman;
  },

  updatePinjamanStatus(pinjamanId, newStatus) {
    const db = getDB();
    const item = db.pinjaman.find((p) => p.id === pinjamanId || p.nomor_pinjaman === pinjamanId);
    if (!item) return null;

    const oldStatus = item.status;
    item.status = newStatus;

    if (newStatus === 'Berjalan' && oldStatus !== 'Berjalan') {
      const today = new Date().toISOString().split('T')[0];
      db.kas.unshift({
        id: `KAS-${Date.now().toString().slice(-4)}`,
        tanggal: today,
        jenis: 'Pengeluaran',
        kategori: 'Pencairan Pinjaman',
        jumlah: Number(item.jumlah),
        keterangan: `Pencairan Pinjaman ${item.nama} (${item.nomor_pinjaman})`,
        ref_id: item.id
      });
    }

    saveDB(db);
    return item;
  },

  payPinjamanInstallment({ pinjamanId, jumlahBayar, metode = 'Tunai', penerima = 'Admin Kasir' }) {
    const db = getDB();
    const item = db.pinjaman.find((p) => p.id === pinjamanId || p.nomor_pinjaman === pinjamanId);
    if (!item) return null;

    const payAmount = Number(jumlahBayar);
    const today = new Date().toISOString().split('T')[0];
    const angsId = `ANGS-${Date.now().toString().slice(-4)}`;
    const angsuranKe = (item.riwayat_angsuran ? item.riwayat_angsuran.length : 0) + 1;

    const angsuranRecord = {
      id: angsId,
      tanggal: today,
      angsuran_ke: angsuranKe,
      jumlah: payAmount,
      metode,
      penerima
    };

    if (!item.riwayat_angsuran) item.riwayat_angsuran = [];
    item.riwayat_angsuran.push(angsuranRecord);

    item.total_terbayar = (Number(item.total_terbayar) || 0) + payAmount;
    item.sisa_hutang = Math.max(0, (Number(item.total_pinjaman) || 0) - item.total_terbayar);

    if (item.sisa_hutang <= 0) {
      item.status = 'Lunas';
    }

    db.kas.unshift({
      id: `KAS-${Date.now().toString().slice(-4)}`,
      tanggal: today,
      jenis: 'Penerimaan',
      kategori: 'Angsuran Pinjaman',
      jumlah: payAmount,
      keterangan: `Angsuran ke-${angsuranKe} Pinjaman ${item.nama} (${item.nomor_pinjaman})`,
      ref_id: angsId
    });

    saveDB(db);
    return item;
  },

  // --- KAS HARIAN ---
  getKasList() {
    const db = getDB();
    return db.kas || [];
  },

  getKasSummary() {
    const db = getDB();
    const list = db.kas || [];

    let totalMasuk = 0;
    let totalKeluar = 0;

    list.forEach((k) => {
      const amount = Number(k.jumlah || 0);
      if (k.jenis === 'Penerimaan') {
        totalMasuk += amount;
      } else {
        totalKeluar += amount;
      }
    });

    return {
      masuk: totalMasuk,
      keluar: totalKeluar,
      saldo: totalMasuk - totalKeluar
    };
  },

  addKasTransaction({ jenis, kategori, jumlah, keterangan, tanggal }) {
    const db = getDB();
    const today = tanggal || new Date().toISOString().split('T')[0];
    const newKas = {
      id: `KAS-${Date.now().toString().slice(-4)}`,
      tanggal: today,
      jenis,
      kategori: kategori || 'Operasional',
      jumlah: Number(jumlah),
      keterangan: keterangan || '-',
      ref_id: ''
    };

    db.kas.unshift(newKas);
    saveDB(db);
    return newKas;
  },

  // --- PENGATURAN & BACKUP ---
  getSettings() {
    const db = getDB();
    return db.settings || initialData.settings;
  },

  updateSettings(newSettings) {
    const db = getDB();
    db.settings = { ...db.settings, ...newSettings };
    saveDB(db);
    return db.settings;
  },

  exportDatabaseJSON() {
    const db = getDB();
    return JSON.stringify(db, null, 2);
  },

  importDatabaseJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.anggota || !parsed.simpanan || !parsed.kas) {
        throw new Error('Format file backup tidak valid');
      }
      saveDB(parsed);
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  resetDatabase() {
    saveDB(initialData);
    return initialData;
  },

  // --- LAPORAN PERHITUNGAN REALTIME DENGAN RENTANG TANGGAL KALENDER ---
  getLaporanData(startDateOrFilter = '', endDate = '') {
    let start = '';
    let end = '';

    if (typeof startDateOrFilter === 'object' && startDateOrFilter !== null) {
      start = startDateOrFilter.startDate || startDateOrFilter.tanggalMulai || '';
      end = startDateOrFilter.endDate || startDateOrFilter.tanggalSelesai || '';
    } else {
      start = startDateOrFilter || '';
      end = endDate || '';
    }

    const db = getDB();
    const kasList = db.kas || [];
    const simpananList = db.simpanan || [];
    const pinjamanList = db.pinjaman || [];

    // Filter by custom calendar date range
    const filterFn = (itemDate) => {
      if (!itemDate) return true;
      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    };

    let totalSimpananMasuk = 0;
    let totalAngsuranMasuk = 0;
    let totalPendapatanLain = 0;
    let totalPenyaluranPinjaman = 0;
    let totalBiayaOperasional = 0;
    let totalPenarikanSimpanan = 0;

    kasList.filter((k) => filterFn(k.tanggal)).forEach((k) => {
      const amt = Number(k.jumlah || 0);
      const kat = (k.kategori || '').toLowerCase();
      if (k.jenis === 'Penerimaan') {
        if (kat.includes('simpanan')) totalSimpananMasuk += amt;
        else if (kat.includes('angsuran')) totalAngsuranMasuk += amt;
        else totalPendapatanLain += amt;
      } else {
        if (kat.includes('pencairan') || kat.includes('pinjaman')) totalPenyaluranPinjaman += amt;
        else if (kat.includes('tarik') || kat.includes('penarikan')) totalPenarikanSimpanan += amt;
        else totalBiayaOperasional += amt;
      }
    });

    const kasSummary = this.getKasSummary();
    const simpananSummary = this.getSimpananSummary();
    const pinjamanSummary = this.getPinjamanSummary();

    let totalBungaTerkumpul = 0;
    pinjamanList.forEach((p) => {
      if (p.riwayat_angsuran && p.riwayat_angsuran.length > 0) {
        const matchingAngsuran = p.riwayat_angsuran.filter((a) => filterFn(a.tanggal));
        totalBungaTerkumpul += matchingAngsuran.length * (p.angsuran_bunga || 0);
      }
    });

    const totalPendapatanKoperasi = totalBungaTerkumpul + totalPendapatanLain;
    const estimasiSHUKotor = Math.max(0, totalPendapatanKoperasi - totalBiayaOperasional);

    return {
      arusKas: {
        totalSimpananMasuk,
        totalAngsuranMasuk,
        totalPendapatanLain,
        totalPemasukan: totalSimpananMasuk + totalAngsuranMasuk + totalPendapatanLain,
        totalPenyaluranPinjaman,
        totalBiayaOperasional,
        totalPenarikanSimpanan,
        totalPengeluaran: totalPenyaluranPinjaman + totalBiayaOperasional + totalPenarikanSimpanan,
        saldoKasBersih: (totalSimpananMasuk + totalAngsuranMasuk + totalPendapatanLain) - (totalPenyaluranPinjaman + totalBiayaOperasional + totalPenarikanSimpanan)
      },
      neraca: {
        kas: kasSummary.saldo,
        piutangPinjaman: pinjamanSummary.sisaHutang,
        totalAset: kasSummary.saldo + pinjamanSummary.sisaHutang,
        simpananPokok: simpananSummary.pokok,
        simpananWajib: simpananSummary.wajib,
        simpananSukarela: simpananSummary.sukarela,
        totalKewajibanModal: simpananSummary.total
      },
      shu: {
        pendapatanBunga: totalBungaTerkumpul,
        pendapatanLain: totalPendapatanLain,
        totalPendapatan: totalPendapatanKoperasi,
        biayaOperasional: totalBiayaOperasional,
        shuBersih: estimasiSHUKotor,
        alokasi: {
          anggota: Math.round(estimasiSHUKotor * (db.settings.shuPersenAnggota / 100)),
          modal: Math.round(estimasiSHUKotor * (db.settings.shuPersenModal / 100)),
          pengurus: Math.round(estimasiSHUKotor * (db.settings.shuPersenPengurus / 100)),
          cadangan: Math.round(estimasiSHUKotor * (db.settings.shuPersenCadangan / 100))
        }
      }
    };
  }
};
