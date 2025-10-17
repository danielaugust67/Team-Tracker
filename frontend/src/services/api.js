import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  timeout: 10000,
});

// PENTING: Menambahkan Interceptor untuk Otentikasi
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Jika token ada, tambahkan ke header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fungsi untuk login user.
 */
export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  try {
    const response = await apiClient.post('/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  } catch (error) {
    console.error("API Login Error:", error.response || error.message);
    if (error.response && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Terjadi kesalahan saat mencoba login.');
  }
};

/**
 * Fungsi untuk mengambil semua data statistik dashboard.
 * @returns {Promise<object>} Data statistik dashboard.
 */
export const getDashboardData = async () => {
    try {
        // Lakukan GET request ke endpoint /dashboard/stats
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error("API Dashboard Error:", error.response || error.message);
        if (error.response && error.response.status === 401) {
            // Jika error 401 (Unauthorized), mungkin token expired
            throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        }
        throw new Error('Gagal memuat data dashboard.');
    }
};

/**
 * Mengambil daftar semua tugas dari backend.
 * @returns {Promise<Array>} Daftar tugas.
 */
export const getTasks = async () => {
    try {
        const response = await apiClient.get('/tasks/');
        return response.data;
    } catch (error) {
        console.error("API Get Tasks Error:", error.response || error.message);
        throw new Error('Gagal memuat daftar tugas.');
    }
};

/**
 * Membuat tugas baru.
 * @param {object} taskData - Data tugas baru (title, description, status, etc.).
 * @returns {Promise<object>} Data tugas yang baru dibuat.
 */
export const createTask = async (taskData) => {
    try {
        const response = await apiClient.post('/tasks/', taskData);
        return response.data;
    } catch (error) {
        console.error("API Create Task Error:", error.response || error.message);
        throw new Error(error.response?.data?.detail || 'Gagal membuat tugas baru.');
    }
};

/**
 * Memperbarui tugas yang ada.
 * @param {number} taskId - ID tugas yang akan diperbarui.
 * @param {object} taskData - Data pembaruan tugas.
 * @returns {Promise<object>} Data tugas yang sudah diperbarui.
 */
export const updateTask = async (taskId, taskData) => {
    try {
        const response = await apiClient.put(`/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        console.error("API Update Task Error:", error.response || error.message);
        throw new Error(error.response?.data?.detail || 'Gagal memperbarui tugas.');
    }
};

/**
 * Menghapus tugas.
 * @param {number} taskId - ID tugas yang akan dihapus.
 * @returns {Promise<object>} Pesan konfirmasi.
 */
export const deleteTask = async (taskId) => {
    try {
        const response = await apiClient.delete(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.error("API Delete Task Error:", error.response || error.message);
        throw new Error(error.response?.data?.detail || 'Gagal menghapus tugas.');
    }
};

/**
 * Mengambil daftar semua anggota tim.
 * @returns {Promise<Array>} Daftar anggota.
 */
export const getMembers = async () => {
    try {
        const response = await apiClient.get('/members/'); // Sesuaikan dengan URL endpoint Anda
        return response.data;
    } catch (error) {
        console.error("API Get Members Error:", error.response || error.message);
        throw new Error('Gagal memuat daftar anggota.');
    }
};

/**
 * Membuat anggota tim baru.
 * @param {object} memberData - Data anggota baru (name, role).
 * @returns {Promise<object>} Data anggota yang baru dibuat.
 */
export const createMember = async (memberData) => {
    try {
        const response = await apiClient.post('/members/', memberData);
        return response.data;
    } catch (error) {
        console.error("API Create Member Error:", error.response || error.message);
        throw new Error(error.response?.data?.detail || 'Gagal membuat anggota baru.');
    }
};

/**
 * Memperbarui anggota tim yang ada.
 * @param {number} memberId - ID anggota yang akan diperbarui.
 * @param {object} memberData - Data pembaruan anggota.
 * @returns {Promise<object>} Data anggota yang sudah diperbarui.
 */
export const updateMember = async (memberId, memberData) => {
    try {
        const response = await apiClient.put(`/members/${memberId}`, memberData);
        return response.data;
    } catch (error) {
        console.error("API Update Member Error:", error.response || error.message);
        throw new Error(error.response?.data?.detail || 'Gagal memperbarui anggota.');
    }
};

/**
 * Menghapus anggota tim.
 * @param {number} memberId - ID anggota yang akan dihapus.
 * @returns {Promise<object>} Pesan konfirmasi.
 */
export const deleteMember = async (memberId) => {
    try {
        const response = await apiClient.delete(`/members/${memberId}`);
        return response.data;
    } catch (error) {
        console.error("API Delete Member Error:", error.response || error.message);
        throw new Error(error.response?.data?.detail || 'Gagal menghapus anggota.');
    }
};