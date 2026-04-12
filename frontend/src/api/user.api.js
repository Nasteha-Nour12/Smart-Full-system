import api from "./axios";

export const getUsersRequest = async () => {
  const res = await api.get("/users");
  return res.data;
};

export const createAdminUserRequest = async (data) => {
  const res = await api.post("/users/admin-create", data);
  return res.data;
};

export const getUserByIdRequest = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const approveUserRequest = async (id) => {
  const res = await api.patch(`/users/${id}/approve`);
  return res.data;
};

export const banUserRequest = async (id) => {
  const res = await api.patch(`/users/${id}/ban`);
  return res.data;
};

export const updateUserRoleRequest = async (id, accessRole) => {
  const res = await api.patch(`/users/${id}/role`, { accessRole });
  return res.data;
};

export const updateMyProfileRequest = async (data) => {
  const res = await api.patch("/users/me/update", data);
  return res.data;
};

export const getPendingPasswordRequests = async () => {
  const res = await api.get("/users/password-requests/pending");
  return res.data;
};

export const approvePasswordRequest = async (id) => {
  const res = await api.patch(`/users/password-requests/${id}/approve`);
  return res.data;
};

export const rejectPasswordRequest = async (id) => {
  const res = await api.patch(`/users/password-requests/${id}/reject`);
  return res.data;
};
