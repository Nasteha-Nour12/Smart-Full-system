import api from "./axios";

export const downloadSystemBackupRequest = () =>
  api.get("/system/backup", { responseType: "blob" });

export const restoreSystemBackupRequest = (payload) =>
  api.post("/system/restore", payload);
