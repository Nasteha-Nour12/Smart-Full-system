import api from "./axios";

export const issueCertificateRequest = async (data) => {
  const res = await api.post("/certificates", data);
  return res.data;
};

export const getMyCertificatesRequest = async () => {
  const res = await api.get("/certificates/me");
  return res.data;
};

export const getCertificatesRequest = async (params = {}) => {
  const res = await api.get("/certificates", { params });
  return res.data;
};

export const getCertificateByIdRequest = async (id) => {
  const res = await api.get(`/certificates/${id}`);
  return res.data;
};

export const deleteCertificateRequest = async (id) => {
  const res = await api.delete(`/certificates/${id}`);
  return res.data;
};
