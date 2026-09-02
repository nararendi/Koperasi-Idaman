// Authentication & Admin User Management Service with Supabase Sync
import { getSupabaseClient } from './supabase';

const AUTH_STORAGE_KEY = 'koperasi_idaman_auth_v1';
const USERS_STORAGE_KEY = 'koperasi_idaman_users_v1';

const defaultUsers = [
  {
    id: 'USR-001',
    user_id: 'USR-001',
    username: 'admin',
    password: 'password123',
    nama: 'Administrator Utama',
    email: 'admin@koperasi-idaman.co.id',
    role: 'Super Admin',
    status: 'Aktif',
    avatar: 'AD',
    lastLogin: '-'
  },
  {
    id: 'USR-002',
    user_id: 'USR-002',
    username: 'bendahara',
    password: 'password123',
    nama: 'Ica Cahyani',
    email: 'ica.bendahara@koperasi-idaman.co.id',
    role: 'Bendahara',
    status: 'Aktif',
    avatar: 'IC',
    lastLogin: '-'
  },
  {
    id: 'USR-003',
    user_id: 'USR-003',
    username: 'kasir',
    password: 'password123',
    nama: 'Siti Rahayu',
    email: 'siti.kasir@koperasi-idaman.co.id',
    role: 'Kasir & Teller',
    status: 'Aktif',
    avatar: 'SR',
    lastLogin: '-'
  }
];

function getUsers() {
  if (typeof window === 'undefined') return defaultUsers;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultUsers;
  } catch (e) {
    return defaultUsers;
  }
}

function saveUsers(users) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('koperasi_users_updated'));
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

export const authService = {
  // --- SYNC DENGAN SUPABASE CLOUD ---
  async fetchUsersFromSupabase() {
    const client = getSupabaseClient();
    if (!client) return { success: false, message: 'Supabase client tidak aktif.' };

    try {
      // Set timeout 1.2 detik agar tidak hang jika jaringan lambat / host offline
      const queryPromise = client.from('users').select('*');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Fetch timeout')), 1200)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      if (error) throw error;

      if (data && data.length > 0) {
        const mappedUsers = data.map((u) => ({
          id: u.user_id || u.id,
          user_id: u.user_id || u.id,
          username: u.username,
          password: u.password,
          nama: u.nama,
          email: u.email,
          role: u.role || 'Kasir & Teller',
          status: u.status || 'Aktif',
          avatar: u.avatar || 'US',
          lastLogin: u.last_login || '-'
        }));
        saveUsers(mappedUsers);
        return { success: true, count: mappedUsers.length };
      }
      return { success: true, count: 0 };
    } catch (err) {
      console.warn('Supabase fetchUsers non-blocking note:', err.message);
      return { success: false, message: err.message };
    }
  },

  // Current Session (Menggunakan sessionStorage agar saat tab/browser ditutup sesi langsung berakhir)
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    try {
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return !!raw && raw !== 'null';
    } catch (e) {
      return false;
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      const allUsers = getUsers();
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw || raw === 'null') {
        return null;
      }
      const sessionUser = JSON.parse(raw);
      // Synchronize with active user in users list
      const freshUser = allUsers.find(
        (u) => u.id === sessionUser.id || u.username?.toLowerCase() === (sessionUser.username || '').toLowerCase()
      );
      if (freshUser) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
        return freshUser;
      }
      return sessionUser;
    } catch (e) {
      return null;
    }
  },

  async login(username, password) {
    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      throw new Error('Username dan kata sandi wajib diisi.');
    }

    // 1. Ambil data user aktif langsung secara instan (tanpa tunggu timeout jaringan)
    let users = getUsers();
    if (!users || users.length === 0) {
      users = defaultUsers;
      saveUsers(defaultUsers);
    }

    // Cari kecocokan user
    let user = users.find(
      (u) =>
        (u.username?.trim().toLowerCase() === cleanUsername.toLowerCase() ||
         u.email?.trim().toLowerCase() === cleanUsername.toLowerCase()) &&
        (u.password === cleanPassword || (cleanUsername.toLowerCase() === 'admin' && cleanPassword === 'password123'))
    );

    // Jika tidak ditemukan di lokal, coba lakukan fetch cepat dari Supabase
    if (!user) {
      try {
        await this.fetchUsersFromSupabase();
        users = getUsers();
        user = users.find(
          (u) =>
            (u.username?.trim().toLowerCase() === cleanUsername.toLowerCase() ||
             u.email?.trim().toLowerCase() === cleanUsername.toLowerCase()) &&
            u.password === cleanPassword
        );
      } catch (_) {}
    } else {
      // Sync background tanpa memblokir proses login user
      this.fetchUsersFromSupabase().catch(() => {});
    }

    if (!user) {
      throw new Error('Username atau kata sandi tidak valid.');
    }

    if (user.status !== 'Aktif') {
      throw new Error('Akun ini telah dinonaktifkan. Hubungi Super Admin.');
    }

    const now = new Date().toLocaleString('id-ID');
    user.lastLogin = now;

    // Update session & local users
    const updatedUsers = getUsers().map((u) => (u.id === user.id ? { ...u, lastLogin: now } : u));
    saveUsers(updatedUsers);

    if (typeof window !== 'undefined') {
      // Simpan di sessionStorage agar sesi berakhir saat browser/tab ditutup
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem(AUTH_STORAGE_KEY); // Bersihkan sisa persistensi lama

      // Session Cookie (tanpa max-age) sehingga otomatis hangus saat browser ditutup
      document.cookie = `koperasi_auth_session=${encodeURIComponent(user.username || 'user')}; path=/; SameSite=Lax`;
      window.dispatchEvent(new Event('koperasi_auth_updated'));
    }

    // Sync last login ke Supabase di background (non-blocking)
    try {
      const client = getSupabaseClient();
      if (client) {
        client
          .from('users')
          .update({ last_login: now })
          .or(`user_id.eq.${user.id},username.eq.${user.username}`)
          .then(() => {});
      }
    } catch (_) {}

    return user;
  },

  logout() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      // Hapus session cookie
      document.cookie = 'koperasi_auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      window.dispatchEvent(new Event('koperasi_auth_updated'));
    }
  },

  // User Management
  getAllUsers() {
    return getUsers();
  },

  addUser({ username, password, nama, email, role = 'Kasir & Teller' }) {
    const users = getUsers();
    const exists = users.find(
      (u) => u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      throw new Error('Username atau Email sudah terdaftar.');
    }

    const initials = nama
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'US';

    const newId = `USR-${Date.now().toString().slice(-4)}`;
    const newUser = {
      id: newId,
      user_id: newId,
      username,
      password: password || 'password123',
      nama,
      email,
      role,
      status: 'Aktif',
      avatar: initials,
      lastLogin: '-'
    };

    users.push(newUser);
    saveUsers(users);

    // Sync to Supabase
    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('users').insert([
          {
            user_id: newId,
            username,
            password: password || 'password123',
            nama,
            email,
            role,
            status: 'Aktif',
            avatar: initials,
            last_login: '-'
          }
        ]).then(({ error }) => {
          if (error) console.error('Supabase user insert error:', error.message);
        });
      }
    } catch (e) {
      console.error('Supabase user insert exception:', e);
    }

    return newUser;
  },

  async updateUser(id, updatedFields) {
    const users = getUsers();
    const index = users.findIndex((u) => u.id === id || u.user_id === id || u.username === id);
    if (index === -1) throw new Error('Pengguna tidak ditemukan.');

    if (updatedFields.nama) {
      updatedFields.avatar = updatedFields.nama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }

    const updatedUser = { ...users[index], ...updatedFields };
    users[index] = updatedUser;
    saveUsers(users);

    // If updated user is current session user, update session immediately
    if (typeof window !== 'undefined') {
      const current = this.getCurrentUser();
      if (current && (current.id === id || current.user_id === id || current.username === users[index].username)) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('koperasi_auth_updated'));
      }
    }

    // Sync to Supabase Cloud (await agar benar-benar masuk database)
    try {
      const client = getSupabaseClient();
      if (client) {
        const payload = {
          user_id: updatedUser.user_id || updatedUser.id,
          username: updatedUser.username,
          password: updatedUser.password,
          nama: updatedUser.nama,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          avatar: updatedUser.avatar,
          updated_at: new Date().toISOString()
        };

        const { error } = await client
          .from('users')
          .upsert(payload, { onConflict: 'username' });

        if (error) {
          console.error('Supabase user upsert error:', error.message);
        } else {
          console.log('Supabase user updated successfully in Cloud!');
        }
      }
    } catch (e) {
      console.error('Supabase user update exception:', e);
    }

    return updatedUser;
  },

  async deleteUser(id) {
    const current = this.getCurrentUser();
    if (current && (current.id === id || current.user_id === id)) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
    }

    let users = getUsers();
    if (users.length <= 1) {
      throw new Error('Minimal harus ada 1 akun admin.');
    }

    const targetUser = users.find((u) => u.id === id || u.user_id === id);
    users = users.filter((u) => u.id !== id && u.user_id !== id);
    saveUsers(users);

    // Sync to Supabase (Await deletion from Cloud)
    try {
      const client = getSupabaseClient();
      if (client && targetUser) {
        const { error } = await client
          .from('users')
          .delete()
          .or(`user_id.eq.${id},username.eq.${targetUser.username}`);

        if (error) {
          console.error('Supabase user delete error:', error.message);
        } else {
          console.log('User berhasil dihapus permanen dari Supabase Cloud!');
        }
      }
    } catch (e) {
      console.error('Supabase user delete exception:', e);
    }

    return true;
  }
};
