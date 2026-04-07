import api from "./axios";

export const getExecutiveOverviewRequest = async () => {
  const res = await api.get("/insights/executive-overview");
  return res.data;
};

export const getOperationalInsightsRequest = async () => {
  const res = await api.get("/insights/operational-insights");
  return res.data;
};

export const getTodayRegistrationsRequest = async () => {
  const res = await api.get("/insights/today-registrations");
  return res.data;
};

export const sendTodayRegistrationsSmsRequest = async (payload = {}) => {
  const res = await api.post("/insights/notify/today-registrations-sms", payload);
  return res.data;
};
