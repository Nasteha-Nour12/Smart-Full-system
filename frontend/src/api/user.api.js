// src/api/user.api.jsx
import api from "./axios";

/**
 * 👤 USER API (Admin only)
 */

// Get all users
export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data;
};

// Get single user by ID
export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

// Create / register new user (Admin)
export const createUser = async (data) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

// Update user (role / status)
export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

// Delete user
export const deleteUser = async (id) => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

// Link user to Student / Teacher / Parent
export const linkUser = async (userId, payload) => {
  const res = await api.post(`/users/${userId}/link`, payload);
  return res.data;
};

// Unlink user
export const unlinkUser = async (userId) => {
  const res = await api.delete(`/users/${userId}/unlink`);
  return res.data;
};
