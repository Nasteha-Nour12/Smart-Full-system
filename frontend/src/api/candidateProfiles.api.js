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
