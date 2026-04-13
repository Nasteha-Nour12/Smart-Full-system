import api from "./axios";

export const getMyCandidateProfileRequest = async () => {
  const res = await api.get("/candidate-profiles/me");
  return res.data;
};

export const saveMyCandidateProfileRequest = async (data) => {
  const res = await api.post("/candidate-profiles/me", data);
  return res.data;
};

export const updateMyCandidateProfileRequest = async (data) => {
  const res = await api.put("/candidate-profiles/me", data);
  return res.data;
};

export const addSkillRequest = async (data) => {
  const res = await api.post("/candidate-profiles/me/skills", data);
  return res.data;
};

export const removeSkillRequest = async (skillId) => {
  const res = await api.delete(`/candidate-profiles/me/skills/${skillId}`);
  return res.data;
};

// Admin endpoints
export const getAllCandidateProfilesRequest = async (params = {}) => {
  const res = await api.get("/candidate-profiles", { params });
  return res.data;
};

export const getCandidateProfileByUserIdRequest = async (userId) => {
  const res = await api.get(`/candidate-profiles/${userId}`);
  return res.data;
};

export const deleteCandidateProfileByUserIdRequest = async (userId) => {
  const res = await api.delete(`/candidate-profiles/${userId}`);
  return res.data;
};

export const upsertCandidateProfileByAdminRequest = async (data) => {
  const res = await api.post("/candidate-profiles/admin-upsert", data);
  return res.data;
};

export const importCandidateProfilesRequest = async (rows) => {
  const res = await api.post("/candidate-profiles/import", { rows });
  return res.data;
};

export const syncCandidateProfilesProgramsRequest = async () => {
  const res = await api.post("/candidate-profiles/sync-programs");
  return res.data;
};
