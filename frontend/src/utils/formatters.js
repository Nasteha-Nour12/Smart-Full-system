export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  if (data?.message) return data.message;

  const firstFieldError = Object.values(data?.fieldErrors || {}).flat()?.[0];
  if (firstFieldError) return firstFieldError;

  return fallback;
};
