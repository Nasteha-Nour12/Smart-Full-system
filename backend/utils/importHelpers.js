export const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const normalizeRow = (row) => {
  const normalized = {};
  for (const [key, value] of Object.entries(row || {})) {
    normalized[normalizeKey(key)] = value;
  }
  return normalized;
};

export const getField = (row, aliases, fallback = "") => {
  const normalized = normalizeRow(row);
  for (const alias of aliases) {
    const key = normalizeKey(alias);
    const value = normalized[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
};

export const toSkillsArray = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

