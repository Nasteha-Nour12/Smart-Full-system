import api from "./axios";

// CREATE COMPANY
export const createCompanyRequest = async (data) => {
  const res = await api.post("/companies", data);
  return res.data;
};

// GET ALL COMPANIES
export const getCompaniesRequest = async () => {
  const res = await api.get("/companies");
  return res.data;
};

// GET SINGLE COMPANY
export const getCompanyByIdRequest = async (id) => {
  const res = await api.get(`/companies/${id}`);
  return res.data;
};

// UPDATE COMPANY
export const updateCompanyRequest = async (id, data) => {
  const res = await api.put(`/companies/${id}`, data);
  return res.data;
};

// DELETE COMPANY
export const deleteCompanyRequest = async (id) => {
  const res = await api.delete(`/companies/${id}`);
  return res.data;
};

// APPROVE / REJECT COMPANY
export const updateCompanyStatusRequest = async (id, status) => {
  const res = await api.patch(`/companies/${id}/status`, { status });
  return res.data;
};