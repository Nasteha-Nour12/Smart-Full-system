const extractNumber = (value, prefix) => {
  const raw = String(value || "").trim().toUpperCase();
  const normalizedPrefix = String(prefix || "").toUpperCase();
  if (!raw.startsWith(normalizedPrefix)) return 0;
  const tail = raw.slice(normalizedPrefix.length);
  const num = Number.parseInt(tail, 10);
  return Number.isFinite(num) ? num : 0;
};

const formatId = (prefix, value) => {
  const normalizedPrefix = String(prefix || "").toUpperCase();
  const width = Math.max(3, String(value).length);
  return `${normalizedPrefix}${String(value).padStart(width, "0")}`;
};

export const generatePrefixedIdNo = async (Model, prefix, field = "idNo") => {
  const regex = new RegExp(`^${String(prefix).toUpperCase()}\\d+$`, "i");
  const rows = await Model.find({ [field]: { $regex: regex } }).select(field).lean();

  let maxValue = 0;
  for (const row of rows) {
    maxValue = Math.max(maxValue, extractNumber(row?.[field], prefix));
  }

  let nextValue = maxValue + 1;
  let nextId = formatId(prefix, nextValue);

  while (await Model.exists({ [field]: nextId })) {
    nextValue += 1;
    nextId = formatId(prefix, nextValue);
  }

  return nextId;
};

export const ensurePrefixedIdNo = async (Model, currentValue, prefix, field = "idNo") => {
  const raw = String(currentValue || "").trim();
  if (!raw) return generatePrefixedIdNo(Model, prefix, field);

  const normalizedPrefix = String(prefix || "").toUpperCase();
  const upper = raw.toUpperCase();
  if (upper.startsWith(normalizedPrefix)) return upper;

  return `${normalizedPrefix}${upper.replace(/[^A-Z0-9]/g, "")}`;
};
