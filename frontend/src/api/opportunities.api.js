import api from "./axios";

export const createOpportunityRequest = async (data) => {
  const res = await api.post("/opportunities", data);
  return res.data;
};

export const getOpportunitiesRequest = async (params = {}) => {
  const res = await api.get("/opportunities", { params });
  return res.data;
};

export const getOpportunityByIdRequest = async (id) => {
  const res = await api.get(`/opportunities/${id}`);
  return res.data;
};

export const updateOpportunityRequest = async (id, data) => {
  const res = await api.put(`/opportunities/${id}`, data);
  return res.data;
};

export const deleteOpportunityRequest = async (id) => {
  const res = await api.delete(`/opportunities/${id}`);
  return res.data;
};

export const updateOpportunityStatusRequest = async (id, status) => {
  const res = await api.patch(`/opportunities/${id}/status`, { status });
  return res.data;
};
