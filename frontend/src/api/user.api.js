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

export const updateUserRoleRequest = async (id, role) => {
  const res = await api.patch(`/users/${id}/role`, { role });
  return res.data;
};

export const updateMyProfileRequest = async (data) => {
  const res = await api.patch("/users/me/update", data);
  return res.data;
};
