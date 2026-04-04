import api from "./axios";

export const createHospitalityProgramRequest = async (data) => {
  const res = await api.post("/hospitality-programs", data);
  return res.data;
};

export const getHospitalityProgramsRequest = async (params = {}) => {
  const res = await api.get("/hospitality-programs", { params });
  return res.data;
};

export const getHospitalityProgramByIdRequest = async (id) => {
  const res = await api.get(`/hospitality-programs/${id}`);
  return res.data;
};

export const updateHospitalityProgramRequest = async (id, data) => {
  const res = await api.put(`/hospitality-programs/${id}`, data);
  return res.data;
};

