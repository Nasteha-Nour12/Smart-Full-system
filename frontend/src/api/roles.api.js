import api from "./axios";

export const getRolesRequest = async () => {
  const res = await api.get("/roles");
  return res.data;
};

export const createRoleRequest = async (data) => {
  const res = await api.post("/roles", data);
  return res.data;
};

export const updateRoleRequest = async (id, data) => {
  const res = await api.put(`/roles/${id}`, data);
  return res.data;
};

export const deleteRoleRequest = async (id) => {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
};
