// Authentication & Admin User Management Service
const AUTH_STORAGE_KEY = 'koperasi_idaman_auth_v1';
const USERS_STORAGE_KEY = 'koperasi_idaman_users_v1';

const defaultUsers = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'password123',
    nama: 'Administrator Utama',
    email: 'admin@koperasi-idaman.co.id',
    role: 'Super Admin',
    status: 'Aktif',
    avatar: 'AD',
    lastLogin: '2024-05-20 08:30'
  },
  {
    id: 'USR-002',
    username: 'bendahara',
    password: 'password123',
    nama: 'Ratna Kusuma, S.E.',
    email: 'ratna.bendahara@koperasi-idaman.co.id',
    role: 'Bendahara',
    status: 'Aktif',
    avatar: 'RK',
    lastLogin: '2024-05-19 14:15'
  },
  {
    id: 'USR-003',
    username: 'kasir',
    password: 'password123',
    nama: 'Siti Rahayu',
    email: 'siti.kasir@koperasi-idaman.co.id',
    role: 'Kasir & Teller',
    status: 'Aktif',
    avatar: 'SR',
    lastLogin: '2024-05-20 09:00'
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
        (u) => u.id === sessionUser.id || u.username.toLowerCase() === (sessionUser.username || '').toLowerCase()
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

  login(username, password) {
    const users = getUsers();
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) &&
        u.password === password
    );

    if (!user) {
      throw new Error('Username atau kata sandi tidak valid.');
    }

    if (user.status !== 'Aktif') {
      throw new Error('Akun ini telah dinonaktifkan. Hubungi Super Admin.');
    }

    const now = new Date().toLocaleString('id-ID');
    user.lastLogin = now;
    saveUsers(users);

    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('koperasi_auth_updated'));
    }

    return user;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
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
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
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

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
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
    return newUser;
  },

  updateUser(id, updatedFields) {
    const users = getUsers();
    const index = users.findIndex((u) => u.id === id);
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

    return users[index];
  },

  deleteUser(id) {
    const current = this.getCurrentUser();
    if (current && current.id === id) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
    }

    let users = getUsers();
    if (users.length <= 1) {
      throw new Error('Minimal harus ada 1 akun admin.');
    }

    users = users.filter((u) => u.id !== id);
    saveUsers(users);
    return true;
  }
};
