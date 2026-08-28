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
      const { data, error } = await client.from('users').select('*');
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
      console.warn('Supabase fetchUsers error:', err.message);
      return { success: false, message: err.message };
    }
  },

  // Current Session
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return !!raw && raw !== 'null';
    } catch (e) {
      return false;
    }
  },

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      const allUsers = getUsers();
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw || raw === 'null') {
        return null;
      }
      const sessionUser = JSON.parse(raw);
      // Synchronize with active user in users list
      const freshUser = allUsers.find(
        (u) => u.id === sessionUser.id || u.username?.toLowerCase() === (sessionUser.username || '').toLowerCase()
      );
      if (freshUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
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

    let user = null;

    // 1. Cek langsung ke Supabase Cloud (Live Data)
    try {
      const client = getSupabaseClient();
      if (client) {
        const { data: cloudUsers, error } = await client
          .from('users')
          .select('*')
          .or(`username.ilike.${cleanUsername},email.ilike.${cleanUsername}`)
          .limit(1);

        if (!error && cloudUsers && cloudUsers.length > 0) {
          const u = cloudUsers[0];
          if (u.password === cleanPassword) {
            user = {
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
            };

            // Sinkronkan ke memory/localStorage lokal browser baru
            const allLocal = getUsers().filter(
              (x) => x.id !== user.id && x.username?.toLowerCase() !== user.username?.toLowerCase()
            );
            allLocal.push(user);
            saveUsers(allLocal);
          } else {
            throw new Error('Username atau kata sandi tidak valid.');
          }
        }
      }
    } catch (err) {
      if (err.message === 'Username atau kata sandi tidak valid.') {
        throw err;
      }
      console.warn('Supabase cloud login fallback to local cache:', err.message);
    }

    // 2. Jika offline / belum ditemukan di cloud, cek di cache lokal
    if (!user) {
      const users = getUsers();
      user = users.find(
        (u) =>
          (u.username?.toLowerCase() === cleanUsername.toLowerCase() || u.email?.toLowerCase() === cleanUsername.toLowerCase()) &&
          u.password === cleanPassword
      );
    }

    if (!user) {
      throw new Error('Username atau kata sandi tidak valid.');
    }

    if (user.status !== 'Aktif') {
      throw new Error('Akun ini telah dinonaktifkan. Hubungi Super Admin.');
    }

    const now = new Date().toLocaleString('id-ID');
    user.lastLogin = now;
    
    // Update local users list with last login
    const allUsers = getUsers().map((u) => (u.id === user.id ? { ...u, lastLogin: now } : u));
    saveUsers(allUsers);

    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      // Set Session Cookie untuk Next.js Server Middleware (Redirect langsung)
      document.cookie = `koperasi_auth_session=${encodeURIComponent(user.username || 'user')}; path=/; max-age=604800; SameSite=Lax`;
      window.dispatchEvent(new Event('koperasi_auth_updated'));
    }

    // Sync last login ke Supabase
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

  updateUser(id, updatedFields) {
    const users = getUsers();
    const index = users.findIndex((u) => u.id === id || u.user_id === id);
    if (index === -1) throw new Error('Pengguna tidak ditemukan.');

    if (updatedFields.nama) {
      updatedFields.avatar = updatedFields.nama
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }

    users[index] = { ...users[index], ...updatedFields };
    saveUsers(users);

    // If updated user is current session user, update session immediately
    const current = this.getCurrentUser();
    if (current && (current.id === id || current.username === users[index].username)) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users[index]));
      window.dispatchEvent(new Event('koperasi_auth_updated'));
    }

    // Sync to Supabase
    try {
      const client = getSupabaseClient();
      if (client) {
        const payload = {};
        if (updatedFields.username) payload.username = updatedFields.username;
        if (updatedFields.password) payload.password = updatedFields.password;
        if (updatedFields.nama) payload.nama = updatedFields.nama;
        if (updatedFields.email) payload.email = updatedFields.email;
        if (updatedFields.role) payload.role = updatedFields.role;
        if (updatedFields.status) payload.status = updatedFields.status;
        if (updatedFields.avatar) payload.avatar = updatedFields.avatar;

        client
          .from('users')
          .update(payload)
          .or(`user_id.eq.${id},username.eq.${users[index].username}`)
          .then(({ error }) => {
            if (error) console.error('Supabase user update error:', error.message);
          });
      }
    } catch (e) {
      console.error('Supabase user update exception:', e);
    }

    return users[index];
  },

  deleteUser(id) {
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

    // Sync to Supabase
    try {
      const client = getSupabaseClient();
      if (client && targetUser) {
        client
          .from('users')
          .delete()
          .or(`user_id.eq.${id},username.eq.${targetUser.username}`)
          .then(({ error }) => {
            if (error) console.error('Supabase user delete error:', error.message);
          });
      }
    } catch (e) {
      console.error('Supabase user delete exception:', e);
    }

    return true;
  }
};
