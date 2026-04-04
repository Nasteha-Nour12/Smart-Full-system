import api from "./axios";

export const createTrainingProgramRequest = async (data) => {
  const res = await api.post("/training-programs", data);
  return res.data;
};

export const getMyTrainingProgramsRequest = async () => {
  const res = await api.get("/training-programs/me");
  return res.data;
};

export const cancelMyTrainingProgramRequest = async (id) => {
  const res = await api.patch(`/training-programs/me/cancel/${id}`);
  return res.data;
};

export const getTrainingProgramsRequest = async () => {
  const res = await api.get("/training-programs");
  return res.data;
};

export const getTrainingProgramByIdRequest = async (id) => {
  const res = await api.get(`/training-programs/${id}`);
  return res.data;
};

export const updateTrainingProgramRequest = async (id, data) => {
  const res = await api.put(`/training-programs/${id}`, data);
  return res.data;
};

export const updateTrainingProgramStatusRequest = async (id, trainingStatus) => {
  const res = await api.patch(`/training-programs/${id}/status`, { trainingStatus });
  return res.data;
};

export const deleteTrainingProgramRequest = async (id) => {
  const res = await api.delete(`/training-programs/${id}`);
  return res.data;
};

export const importTrainingProgramsRequest = async (rows) => {
  const res = await api.post("/training-programs/import", { rows });
  return res.data;
};
