import api from "./axios";

export const applyOpportunityRequest = async (opportunityId) => {
  const res = await api.post("/applications", { opportunityId });
  return res.data;
};

export const getMyApplicationsRequest = async () => {
  const res = await api.get("/applications/me");
  return res.data;
};

export const withdrawMyApplicationRequest = async (id) => {
  const res = await api.delete(`/applications/me/${id}`);
  return res.data;
};

export const getApplicationsRequest = async (params = {}) => {
  const res = await api.get("/applications", { params });
  return res.data;
};

export const getApplicationByIdRequest = async (id) => {
  const res = await api.get(`/applications/${id}`);
  return res.data;
};

export const updateApplicationRequest = async (id, data) => {
  const res = await api.put(`/applications/${id}`, data);
  return res.data;
};
