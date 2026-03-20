import api from "./axios";

export const uploadSingleFileRequest = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/uploads/single", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
