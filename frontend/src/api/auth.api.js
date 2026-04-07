import api from "./axios";

// REGISTER
export const registerRequest = async (data) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

// LOGIN
export const loginRequest = async (data) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

// UPDATE ME
export const updateMeRequest = async (data) => {
  const res = await api.patch("/users/me/update", data);
  return res.data;
};

// LOGOUT (local)
export const logoutRequest = async () => {
  const res = await api.post("/users/logout");
  return res.data;
};
