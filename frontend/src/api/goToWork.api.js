<<<<<<< HEAD
import api from "./axios";

export const submitGoToWorkRequest = async (data) => {
  const res = await api.post("/go-to-work", data);
  return res.data;
};

export const getMyGoToWorkRequest = async () => {
  const res = await api.get("/go-to-work/me");
  return res.data;
};

export const getGoToWorkRequests = async (params = {}) => {
  const res = await api.get("/go-to-work", { params });
  return res.data;
};

export const getGoToWorkByIdRequest = async (id) => {
  const res = await api.get(`/go-to-work/${id}`);
  return res.data;
};

export const updateGoToWorkRequest = async (id, data) => {
  const res = await api.put(`/go-to-work/${id}`, data);
  return res.data;
};

export const updateGoToWorkStatusRequest = async (id, status) => {
  const res = await api.patch(`/go-to-work/${id}/status`, { status });
  return res.data;
};

export const importGoToWorkRequest = async (rows) => {
  const res = await api.post("/go-to-work/import", { rows });
  return res.data;
};
=======
import api from "./axios";

export const submitGoToWorkRequest = async (data) => {
  const res = await api.post("/go-to-work", data);
  return res.data;
};

export const getMyGoToWorkRequest = async () => {
  const res = await api.get("/go-to-work/me");
  return res.data;
};

export const getGoToWorkRequests = async (params = {}) => {
  const res = await api.get("/go-to-work", { params });
  return res.data;
};

export const getGoToWorkByIdRequest = async (id) => {
  const res = await api.get(`/go-to-work/${id}`);
  return res.data;
};

export const updateGoToWorkRequest = async (id, data) => {
  const res = await api.put(`/go-to-work/${id}`, data);
  return res.data;
};

export const updateGoToWorkStatusRequest = async (id, status) => {
  const res = await api.patch(`/go-to-work/${id}/status`, { status });
  return res.data;
};

export const deleteGoToWorkRequest = async (id) => {
  const res = await api.delete(`/go-to-work/${id}`);
  return res.data;
};

export const importGoToWorkRequest = async (rows) => {
  const res = await api.post("/go-to-work/import", { rows });
  return res.data;
};
>>>>>>> 9129225 (Start real project changes)
