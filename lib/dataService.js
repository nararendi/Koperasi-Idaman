import { getSupabaseClient, getSupabaseConfig, testSupabaseConnection } from './supabase';
import { hitungSimulasiPinjaman } from './formatters';

const STORAGE_KEY = 'koperasi_idaman_db_v1';

// Clean initial data without dummy demo records
const initialData = {
  settings: {
    namaKoperasi: 'Koperasi Idaman',
    alamat: 'Jl. Situtarate - Cibaduyut',
    telepon: '085323066335',
    ketua: 'Asep Solehudin, S.Pd.',
    bendahara: '',
    simpananPokok: 500000,
    simpananWajib: 100000,
    sukuBungaPinjaman: 1.5,
    shuPersenAnggota: 40,
    shuPersenModal: 30,
    shuPersenPengurus: 20,
    shuPersenCadangan: 10
  },
  anggota: [],
  simpanan: [],
  pinjaman: [],
  kas: []
};

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
      anggota: parsed.anggota || [],
      simpanan: parsed.simpanan || [],
      pinjaman: parsed.pinjaman || [],
      kas: parsed.kas || []
    };
  } catch (e) {
    console.error('Error reading localStorage DB:', e);
    return initialData;
  }
}

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
  // --- SUPABASE SYNC & CLOUD CONNECTION ---
  async fetchFromSupabase() {
    const client = getSupabaseClient();
    if (!client) return { success: false, message: 'Supabase client tidak aktif.' };

    try {
      const { data: anggotaData, error: errAnggota } = await client.from('anggota').select('*');
      if (errAnggota) throw errAnggota;

      const { data: simpananData } = await client.from('simpanan').select('*');
      const { data: pinjamanData } = await client.from('pinjaman').select('*');
      const { data: kasData } = await client.from('kas').select('*');
      const { data: settingsData } = await client.from('settings').select('*').limit(1);

      const db = getDB();

      db.anggota = (anggotaData || []).map((a) => ({
        id: a.nomor_anggota || a.id,
        nomor_anggota: a.nomor_anggota || a.id,
        nama: a.nama_lengkap,
        nama_lengkap: a.nama_lengkap,
        alamat: a.alamat_lengkap,
        alamat_lengkap: a.alamat_lengkap,
        nomor_hp: a.nomor_hp,
        pekerjaan: a.pekerjaan || '-',
        tempat_lahir: a.tempat_lahir || '-',
        tanggal_lahir: a.tanggal_lahir || '',
        tanggal_daftar: a.tanggal_daftar || '',
        status: a.status_keanggotaan || 'Aktif',
        status_keanggotaan: a.status_keanggotaan || 'Aktif'
      }));

      db.simpanan = (simpananData || []).map((s) => ({
        id: s.kode_transaksi || s.id,
        nomor_anggota: s.nomor_anggota,
        nama_anggota: s.nama_anggota,
        tanggal: s.tanggal,
        jenis: s.jenis_simpanan,
        tipe: s.tipe || 'Setoran',
        jumlah: Number(s.jumlah),
        metode: s.metode || 'Tunai',
        pencatat: s.pencatat || 'Admin',
        keterangan: s.keterangan || '-'
      }));

      db.pinjaman = (pinjamanData || []).map((p) => ({
        id: p.nomor_pinjaman || p.id,
        nomor_pinjaman: p.nomor_pinjaman || p.id,
        nomor_anggota: p.nomor_anggota,
        nama: p.nama,
        tanggal: p.tanggal_pengajuan,
        jumlah: Number(p.jumlah),
        bunga: Number(p.bunga),
        tenor: Number(p.tenor),
        angsuran_pokok: Number(p.angsuran_pokok),
        angsuran_bunga: Number(p.angsuran_bunga),
        total_angsuran_bulanan: Number(p.total_angsuran_bulanan),
        total_pinjaman: Number(p.total_pinjaman),
        total_terbayar: Number(p.total_terbayar || 0),
        sisa_hutang: Number(p.sisa_hutang),
        status: p.status,
        keperluan: p.keperluan || '-',
        riwayat_angsuran: []
      }));

      db.kas = (kasData || []).map((k) => ({
        id: k.kode_transaksi || k.id,
        tanggal: k.tanggal,
        jenis: k.jenis,
        kategori: k.kategori,
        jumlah: Number(k.jumlah),
        keterangan: k.keterangan || '-',
        ref_id: k.ref_id || ''
      }));

      if (settingsData && settingsData.length > 0) {
        const s = settingsData[0];
        db.settings = {
          namaKoperasi: s.nama_koperasi,
          badanHukum: s.badan_hukum,
          alamat: s.alamat,
          telepon: s.telepon,
          email: s.email,
          ketua: s.ketua,
          bendahara: s.bendahara,
          simpananPokok: Number(s.simpanan_pokok),
          simpananWajib: Number(s.simpanan_wajib),
          sukuBungaPinjaman: Number(s.suku_bunga_pinjaman),
          shuPersenAnggota: Number(s.shu_persen_anggota),
          shuPersenModal: Number(s.shu_persen_modal),
          shuPersenPengurus: Number(s.shu_persen_pengurus),
          shuPersenCadangan: Number(s.shu_persen_cadangan)
        };
      }

      saveDB(db);
      return { success: true, message: 'Data berhasil ditarik dan disinkronkan dari Supabase.' };
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
      return { success: false, message: err.message || 'Gagal memuat data dari Supabase.' };
    }
  },

  async pushAllToSupabase() {
    const client = getSupabaseClient();
    if (!client) return { success: false, message: 'Supabase client tidak aktif.' };

    const db = getDB();

    try {
      for (const a of db.anggota) {
        await client.from('anggota').upsert({
          nomor_anggota: a.nomor_anggota || a.id,
          nama_lengkap: a.nama_lengkap || a.nama,
          alamat_lengkap: a.alamat_lengkap || a.alamat,
          nomor_hp: a.nomor_hp,
          pekerjaan: a.pekerjaan || '-',
          tempat_lahir: a.tempat_lahir || '-',
          tanggal_lahir: a.tanggal_lahir || null,
          tanggal_daftar: a.tanggal_daftar || null,
          status_keanggotaan: a.status_keanggotaan || a.status || 'Aktif'
        }, { onConflict: 'nomor_anggota' });
      }

      for (const s of db.simpanan) {
        await client.from('simpanan').upsert({
          kode_transaksi: s.id,
          nomor_anggota: s.nomor_anggota,
          nama_anggota: s.nama_anggota,
          tanggal: s.tanggal,
          jenis_simpanan: s.jenis,
          tipe: s.tipe || 'Setoran',
          jumlah: Number(s.jumlah),
          metode: s.metode || 'Tunai',
          pencatat: s.pencatat || 'Admin',
          keterangan: s.keterangan || '-'
        }, { onConflict: 'kode_transaksi' });
      }

      for (const p of db.pinjaman) {
        await client.from('pinjaman').upsert({
          nomor_pinjaman: p.nomor_pinjaman || p.id,
          nomor_anggota: p.nomor_anggota,
          nama: p.nama,
          tanggal_pengajuan: p.tanggal,
          jumlah: Number(p.jumlah),
          bunga: Number(p.bunga),
          tenor: Number(p.tenor),
          angsuran_pokok: Number(p.angsuran_pokok),
          angsuran_bunga: Number(p.angsuran_bunga),
          total_angsuran_bulanan: Number(p.total_angsuran_bulanan),
          total_pinjaman: Number(p.total_pinjaman),
          total_terbayar: Number(p.total_terbayar || 0),
          sisa_hutang: Number(p.sisa_hutang),
          status: p.status,
          keperluan: p.keperluan || '-'
        }, { onConflict: 'nomor_pinjaman' });
      }

      for (const k of db.kas) {
        await client.from('kas').upsert({
          kode_transaksi: k.id,
          tanggal: k.tanggal,
          jenis: k.jenis,
          kategori: k.kategori,
          jumlah: Number(k.jumlah),
          keterangan: k.keterangan || '-',
          ref_id: k.ref_id || null
        }, { onConflict: 'kode_transaksi' });
      }

      return { success: true, message: 'Seluruh data berhasil disinkronkan ke Supabase!' };
    } catch (err) {
      console.error('Error pushing data to Supabase:', err);
      return { success: false, message: err.message || 'Gagal mengunggah data ke Supabase.' };
    }
  },

  async clearSupabaseData() {
    const client = getSupabaseClient();
    if (!client) return { success: false, message: 'Supabase client tidak aktif.' };

    try {
      await client.from('riwayat_angsuran').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await client.from('pinjaman').delete().neq('nomor_pinjaman', 'DUMMY');
      await client.from('simpanan').delete().neq('kode_transaksi', 'DUMMY');
      await client.from('kas').delete().neq('kode_transaksi', 'DUMMY');
      await client.from('anggota').delete().neq('nomor_anggota', 'DUMMY');
      return { success: true, message: 'Data di Supabase Cloud berhasil dikosongkan.' };
    } catch (err) {
      console.error('Error clearing Supabase tables:', err);
      return { success: false, message: err.message || 'Gagal mengosongkan tabel Supabase.' };
    }
  },

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
      const client = getSupabaseClient();
      if (client) {
        client.from('anggota').insert([{
          nomor_anggota: newAnggota.nomor_anggota,
          nama_lengkap: newAnggota.nama_lengkap,
          alamat_lengkap: newAnggota.alamat_lengkap,
          nomor_hp: newAnggota.nomor_hp,
          pekerjaan: newAnggota.pekerjaan,
          tempat_lahir: newAnggota.tempat_lahir,
          tanggal_lahir: newAnggota.tanggal_lahir || null,
          tanggal_daftar: newAnggota.tanggal_daftar || today,
          status_keanggotaan: newAnggota.status_keanggotaan
        }]).then(({ error }) => {
          if (error) console.warn('Supabase anggota insert note:', error.message);
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

      try {
        const client = getSupabaseClient();
        if (client) {
          client.from('anggota').update({
            nama_lengkap: db.anggota[index].nama_lengkap,
            alamat_lengkap: db.anggota[index].alamat_lengkap,
            nomor_hp: db.anggota[index].nomor_hp,
            pekerjaan: db.anggota[index].pekerjaan,
            tempat_lahir: db.anggota[index].tempat_lahir,
            status_keanggotaan: db.anggota[index].status_keanggotaan
          }).eq('nomor_anggota', id).then(() => {});
        }
      } catch (_) {}

      return db.anggota[index];
    }
    return null;
  },

  deleteAnggota(id) {
    const db = getDB();
    db.anggota = db.anggota.filter((a) => a.id !== id && a.nomor_anggota !== id);
    saveDB(db);

    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('anggota').delete().eq('nomor_anggota', id).then(() => {});
      }
    } catch (_) {}

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
    const newKas = {
      id: `KAS-${Date.now().toString().slice(-4)}`,
      tanggal: today,
      jenis: isPenerimaan ? 'Penerimaan' : 'Pengeluaran',
      kategori: `Simpanan ${jenis}`,
      jumlah: Number(jumlah),
      keterangan: `${tipe} ${jenis} a/n ${nama_anggota} (${nomor_anggota})`,
      ref_id: simpananId
    };
    db.kas.unshift(newKas);

    saveDB(db);

    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('simpanan').insert([{
          kode_transaksi: newSimpanan.id,
          nomor_anggota: newSimpanan.nomor_anggota,
          nama_anggota: newSimpanan.nama_anggota,
          tanggal: newSimpanan.tanggal,
          jenis_simpanan: newSimpanan.jenis,
          tipe: newSimpanan.tipe,
          jumlah: newSimpanan.jumlah,
          metode: newSimpanan.metode,
          pencatat: newSimpanan.pencatat,
          keterangan: newSimpanan.keterangan
        }]).then(() => {});

        client.from('kas').insert([{
          kode_transaksi: newKas.id,
          tanggal: newKas.tanggal,
          jenis: newKas.jenis,
          kategori: newKas.kategori,
          jumlah: newKas.jumlah,
          keterangan: newKas.keterangan,
          ref_id: newKas.ref_id
        }]).then(() => {});
      }
    } catch (_) {}

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

  applyPinjaman(params) {
    return this.addPinjaman(params);
  },

  addPinjaman({ nomor_anggota, jumlah, bunga, tenor, keperluan = '', metodeBunga = 'menurun', pembulatan = 50000 }) {
    const db = getDB();
    const anggota = db.anggota.find((a) => (a.nomor_anggota || a.id) === nomor_anggota);
    const nama = anggota ? (anggota.nama_lengkap || anggota.nama) : 'Anggota';
    const today = new Date().toISOString().split('T')[0];
    const id = `PJ-${new Date().getFullYear()}-${String(db.pinjaman.length + 1).padStart(3, '0')}`;

    const numJumlah = Number(jumlah);
    const numBungaPercent = Number(bunga !== undefined && bunga !== '' ? bunga : (db.settings.sukuBungaPinjaman || 2.5));
    const numTenor = Number(tenor || 12);

    const sim = hitungSimulasiPinjaman(numJumlah, numTenor, numBungaPercent, metodeBunga, Number(pembulatan));

    const newPinjaman = {
      id,
      nomor_pinjaman: id,
      nomor_anggota,
      nama,
      tanggal: today,
      jumlah: numJumlah,
      bunga: numBungaPercent,
      tenor: numTenor,
      metode_bunga: metodeBunga,
      pembulatan: Number(pembulatan),
      angsuran_pokok: sim.pokokPerBulan,
      angsuran_bunga: sim.bungaBulanPertama,
      total_angsuran_bulanan: sim.angsuranBulanPertama,
      total_pinjaman: sim.totalPengembalian,
      total_bunga: sim.totalBunga,
      total_terbayar: 0,
      sisa_hutang: sim.totalPengembalian,
      jadwal_angsuran: sim.jadwal,
      status: 'Diajukan',
      keperluan,
      riwayat_angsuran: []
    };

    db.pinjaman.unshift(newPinjaman);
    saveDB(db);

    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('pinjaman').insert([{
          nomor_pinjaman: newPinjaman.nomor_pinjaman,
          nomor_anggota: newPinjaman.nomor_anggota,
          nama: newPinjaman.nama,
          tanggal_pengajuan: newPinjaman.tanggal,
          jumlah: newPinjaman.jumlah,
          bunga: newPinjaman.bunga,
          tenor: newPinjaman.tenor,
          angsuran_pokok: newPinjaman.angsuran_pokok,
          angsuran_bunga: newPinjaman.angsuran_bunga,
          total_angsuran_bulanan: newPinjaman.total_angsuran_bulanan,
          total_pinjaman: newPinjaman.total_pinjaman,
          total_terbayar: 0,
          sisa_hutang: newPinjaman.sisa_hutang,
          status: newPinjaman.status,
          keperluan: newPinjaman.keperluan
        }]).then(() => {});
      }
    } catch (_) {}

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
      const newKas = {
        id: `KAS-${Date.now().toString().slice(-4)}`,
        tanggal: today,
        jenis: 'Pengeluaran',
        kategori: 'Pencairan Pinjaman',
        jumlah: Number(item.jumlah),
        keterangan: `Pencairan Pinjaman ${item.nama} (${item.nomor_pinjaman})`,
        ref_id: item.id
      };
      db.kas.unshift(newKas);

      try {
        const client = getSupabaseClient();
        if (client) {
          client.from('kas').insert([{
            kode_transaksi: newKas.id,
            tanggal: newKas.tanggal,
            jenis: newKas.jenis,
            kategori: newKas.kategori,
            jumlah: newKas.jumlah,
            keterangan: newKas.keterangan,
            ref_id: newKas.ref_id
          }]).then(() => {});
        }
      } catch (_) {}
    }

    saveDB(db);

    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('pinjaman').update({ status: newStatus }).eq('nomor_pinjaman', item.nomor_pinjaman).then(() => {});
      }
    } catch (_) {}

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

    const newKas = {
      id: `KAS-${Date.now().toString().slice(-4)}`,
      tanggal: today,
      jenis: 'Penerimaan',
      kategori: 'Angsuran Pinjaman',
      jumlah: payAmount,
      keterangan: `Angsuran ke-${angsuranKe} Pinjaman ${item.nama} (${item.nomor_pinjaman})`,
      ref_id: angsId
    };
    db.kas.unshift(newKas);

    saveDB(db);

    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('riwayat_angsuran').insert([{
          nomor_pinjaman: item.nomor_pinjaman,
          angsuran_ke: angsuranRecord.angsuran_ke,
          tanggal: angsuranRecord.tanggal,
          jumlah: angsuranRecord.jumlah,
          metode: angsuranRecord.metode,
          penerima: angsuranRecord.penerima
        }]).then(() => {});

        client.from('pinjaman').update({
          total_terbayar: item.total_terbayar,
          sisa_hutang: item.sisa_hutang,
          status: item.status
        }).eq('nomor_pinjaman', item.nomor_pinjaman).then(() => {});

        client.from('kas').insert([{
          kode_transaksi: newKas.id,
          tanggal: newKas.tanggal,
          jenis: newKas.jenis,
          kategori: newKas.kategori,
          jumlah: newKas.jumlah,
          keterangan: newKas.keterangan,
          ref_id: newKas.ref_id
        }]).then(() => {});
      }
    } catch (_) {}

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

    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('kas').insert([{
          kode_transaksi: newKas.id,
          tanggal: newKas.tanggal,
          jenis: newKas.jenis,
          kategori: newKas.kategori,
          jumlah: newKas.jumlah,
          keterangan: newKas.keterangan,
          ref_id: newKas.ref_id
        }]).then(() => {});
      }
    } catch (_) {}

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

    try {
      const client = getSupabaseClient();
      if (client) {
        const payload = {
          nama_koperasi: db.settings.namaKoperasi,
          badan_hukum: db.settings.badanHukum,
          alamat: db.settings.alamat,
          telepon: db.settings.telepon,
          email: db.settings.email,
          ketua: db.settings.ketua,
          bendahara: db.settings.bendahara,
          simpanan_pokok: db.settings.simpananPokok,
          simpanan_wajib: db.settings.simpananWajib,
          suku_bunga_pinjaman: db.settings.sukuBungaPinjaman,
          shu_persen_anggota: db.settings.shuPersenAnggota,
          shu_persen_modal: db.settings.shuPersenModal,
          shu_persen_pengurus: db.settings.shuPersenPengurus,
          shu_persen_cadangan: db.settings.shuPersenCadangan
        };

        client.from('settings').select('id').limit(1).then(({ data: existingRows }) => {
          if (existingRows && existingRows.length > 0) {
            client.from('settings').update(payload).eq('id', existingRows[0].id).then(() => {});
          } else {
            client.from('settings').insert([payload]).then(() => {});
          }
        });
      }
    } catch (_) {}

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

  // Clear all data (Anggota, Simpanan, Pinjaman, Kas)
  clearAllData() {
    const db = getDB();
    const emptyState = {
      settings: db.settings || initialData.settings,
      anggota: [],
      simpanan: [],
      pinjaman: [],
      kas: []
    };
    saveDB(emptyState);
    return emptyState;
  },

  resetDatabase() {
    saveDB(initialData);
    return initialData;
  },

  // --- LAPORAN PERHITUNGAN REALTIME ---
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
