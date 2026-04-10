import api from "./axios";

// REGISTER
export const registerRequest = async (data) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

// LOGIN
export const loginRequest = async (data) => {
  const res = await api.post("/users/login", data);
  const token = res?.data?.accessToken;
  if (token) {
    localStorage.setItem("smart-ses-token", token);
    localStorage.setItem("token", token);
  }
  return res.data;
};

// UPDATE ME
export const updateMeRequest = async (data) => {
  const res = await api.patch("/users/me/update", data);
  return res.data;
};

// LOGOUT (local)
export const logoutRequest = async () => {
  try {
    await api.post("/users/logout");
  } catch {
    // Ignore logout API failures and clear local session anyway.
  }
  localStorage.removeItem("smart-ses-token");
  localStorage.removeItem("token");
  return { success: true };
};
