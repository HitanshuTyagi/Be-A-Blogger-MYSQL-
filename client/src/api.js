const API = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
}

async function request(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

// Auth
export const login = async (email, password) => {
  const data = await request(`${API}/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) });
  setToken(data.token);
  return data;
};

export const register = async (username, email, password) => {
  const data = await request(`${API}/auth/register`, { method: 'POST', body: JSON.stringify({ username, email, password }) });
  setToken(data.token);
  return data;
};

export const logout = () => {
  removeToken();
  return Promise.resolve({ message: 'Logged out' });
};

export const getMe = () =>
  request(`${API}/auth/me`);

// Posts
export const getPosts = (q = '') =>
  request(`${API}/posts?q=${encodeURIComponent(q)}`);

export const getPost = (slug) =>
  request(`${API}/posts/${slug}`);

export const getPostForEdit = (id) =>
  request(`${API}/posts/${id}/edit`);

export const createPost = (formData) =>
  request(`${API}/posts`, { method: 'POST', body: formData });

export const updatePost = (id, formData) =>
  request(`${API}/posts/${id}`, { method: 'PUT', body: formData });

export const deletePost = (id) =>
  request(`${API}/posts/${id}`, { method: 'DELETE' });

export const likePost = (id) =>
  request(`${API}/posts/${id}/like`, { method: 'POST' });

export const addComment = (slug, text, name) =>
  request(`${API}/posts/${slug}/comments`, { method: 'POST', body: JSON.stringify({ text, name }) });

export const deleteComment = (slug, commentId) =>
  request(`${API}/posts/${slug}/comments/${commentId}`, { method: 'DELETE' });

// Users
export const getProfile = () =>
  request(`${API}/users/profile`);

export const updateProfile = (formData) =>
  request(`${API}/users/profile`, { method: 'POST', body: formData });

// Contact
export const submitContact = (name, email, message) =>
  request(`${API}/contact`, { method: 'POST', body: JSON.stringify({ name, email, message }) });

// Admin
export const getAdminDashboard = () =>
  request(`${API}/admin`);

export const getAdminUsers = () =>
  request(`${API}/admin/users`);

export const deleteUser = (id) =>
  request(`${API}/admin/users/${id}`, { method: 'DELETE' });

export const makeAdmin = (id) =>
  request(`${API}/admin/users/${id}/make-admin`, { method: 'POST' });

export const getAdminPosts = () =>
  request(`${API}/admin/posts`);
