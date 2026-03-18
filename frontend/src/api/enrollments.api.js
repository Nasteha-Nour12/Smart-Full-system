import api from "./axios";

export const enrollProgramRequest = async (programId) => {
  const res = await api.post("/enrollments", { programId });
  return res.data;
};

export const getMyEnrollmentsRequest = async () => {
  const res = await api.get("/enrollments/me");
  return res.data;
};

export const dropEnrollmentRequest = async (id) => {
  const res = await api.patch(`/enrollments/drop/${id}`);
  return res.data;
};

export const getEnrollmentsRequest = async () => {
  const res = await api.get("/enrollments");
  return res.data;
};

export const updateEnrollmentRequest = async (id, data) => {
  const res = await api.put(`/enrollments/${id}`, data);
  return res.data;
};
