import api from "./axios";

export const createProgramRequest = async (data) => {
  const res = await api.post("/programs", data);
  return res.data;
};

export const getProgramsRequest = async (params = {}) => {
  const res = await api.get("/programs", { params });
  return res.data;
};

export const getProgramByIdRequest = async (id) => {
  const res = await api.get(`/programs/${id}`);
  return res.data;
};

export const updateProgramRequest = async (id, data) => {
  const res = await api.put(`/programs/${id}`, data);
  return res.data;
};

export const deleteProgramRequest = async (id) => {
  const res = await api.delete(`/programs/${id}`);
  return res.data;
};

export const updateProgramStatusRequest = async (id, status) => {
  const res = await api.patch(`/programs/${id}/status`, { status });
  return res.data;
};
