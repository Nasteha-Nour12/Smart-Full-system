import api from "./axios";

export const getExecutiveOverviewRequest = async () => {
  const res = await api.get("/insights/executive-overview");
  return res.data;
};

export const getOperationalInsightsRequest = async () => {
  const res = await api.get("/insights/operational-insights");
  return res.data;
};
