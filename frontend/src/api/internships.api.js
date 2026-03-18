import api from "./axios";

export const requestInternshipRequest = async (data) => {
  const res = await api.post("/internships", data);
  return res.data;
};

export const getMyInternshipsRequest = async () => {
  const res = await api.get("/internships/me");
  return res.data;
};

export const cancelMyInternshipRequest = async (id) => {
  const res = await api.patch(`/internships/me/cancel/${id}`);
  return res.data;
};

export const getInternshipsRequest = async () => {
  const res = await api.get("/internships");
  return res.data;
};

export const getInternshipByIdRequest = async (id) => {
  const res = await api.get(`/internships/${id}`);
  return res.data;
};

export const updateInternshipRequest = async (id, data) => {
  const res = await api.put(`/internships/${id}`, data);
  return res.data;
};

export const updateInternshipStatusRequest = async (id, status) => {
  const res = await api.patch(`/internships/${id}/status`, { status });
  return res.data;
};
