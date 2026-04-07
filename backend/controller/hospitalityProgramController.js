<<<<<<< HEAD
import HospitalityProgram from "../model/HospitalityProgram.js";
import User from "../model/User.js";

const HOSPITALITY_TYPES = {
  NO_SKILL: "NO_SKILL",
  HAVE_SKILL_NO_EXPERIENCE: "HAVE_SKILL_NO_EXPERIENCE",
  HAVE_SKILL_AND_EXPERIENCE: "HAVE_SKILL_AND_EXPERIENCE",
};

const computeHospitalityResult = (hospitalityType) => {
  if (hospitalityType === HOSPITALITY_TYPES.NO_SKILL) {
    return {
      assignedResult: "TRAINING",
      duration: "2 Months",
      fee: 60,
    };
  }
  if (hospitalityType === HOSPITALITY_TYPES.HAVE_SKILL_NO_EXPERIENCE) {
    return {
      assignedResult: "INTERNSHIP_RECOMMENDATION",
      duration: "",
      fee: 0,
    };
  }
  return {
    assignedResult: "GO_TO_WORK_RECOMMENDATION",
    duration: "",
    fee: 0,
  };
};

const normalizeSkills = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

const resolveCandidateId = async ({ candidateId, contact, email, phone, fullName }) => {
  if (candidateId) return candidateId;
  const lookup = [];
  if (email) lookup.push({ email: String(email).toLowerCase() });
  if (phone) lookup.push({ phone: String(phone).trim() });
  if (contact) {
    const c = String(contact).trim();
    lookup.push({ phone: c });
    if (c.includes("@")) lookup.push({ email: c.toLowerCase() });
  }
  if (!lookup.length) return null;
  const user = await User.findOne({ $or: lookup, ...(fullName ? { fullName: String(fullName).trim() } : {}) });
  return user?._id || null;
};

const buildPayload = async (body) => {
  const hospitalityType = String(body.hospitalityType || "").toUpperCase();
  const computed = computeHospitalityResult(hospitalityType);
  return {
    candidateId: await resolveCandidateId({
      candidateId: body.candidateId,
      contact: body.contact,
      email: body.email,
      phone: body.phone,
      fullName: body.fullName,
    }),
    idNo: String(body.idNo || "").trim(),
    fullName: String(body.fullName || "").trim(),
    gender: String(body.gender || "OTHER").toUpperCase(),
    contact: String(body.contact || "").trim(),
    district: String(body.district || "").trim(),
    educationLevel: String(body.educationLevel || "").trim(),
    faculty: String(body.faculty || "").trim(),
    otherSkills: normalizeSkills(body.otherSkills),
    hospitalityType,
    assignedResult: computed.assignedResult,
    duration: computed.duration,
    fee: computed.fee,
    status: String(body.status || "PENDING").toUpperCase(),
    notes: String(body.notes || "").trim(),
  };
};

export const createHospitality = async (req, res) => {
  try {
    const payload = await buildPayload(req.body);
    if (!payload.idNo || !payload.fullName || !payload.contact || !payload.district || !payload.educationLevel || !payload.faculty) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const created = await HospitalityProgram.create(payload);
    res.status(201).json({ success: true, message: "Hospitality record created", data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getHospitalityList = async (req, res) => {
  try {
    const { q = "", district, educationLevel, faculty, hospitalityType, status } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (educationLevel) filter.educationLevel = educationLevel;
    if (faculty) filter.faculty = faculty;
    if (hospitalityType) filter.hospitalityType = hospitalityType;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { idNo: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
        { contact: { $regex: q, $options: "i" } },
      ];
    }

    const rows = await HospitalityProgram.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHospitalityById = async (req, res) => {
  try {
    const row = await HospitalityProgram.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Hospitality record not found" });
    res.json({ success: true, data: row });
  } catch {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

export const updateHospitality = async (req, res) => {
  try {
    const payload = await buildPayload(req.body);
    const updated = await HospitalityProgram.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ success: false, message: "Hospitality record not found" });
    res.json({ success: true, message: "Hospitality record updated", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

=======
import HospitalityProgram from "../model/HospitalityProgram.js";
import User from "../model/User.js";
import { ensurePrefixedIdNo } from "../utils/idGenerator.js";

const HOSPITALITY_TYPES = {
  NO_SKILL: "NO_SKILL",
  HAVE_SKILL_NO_EXPERIENCE: "HAVE_SKILL_NO_EXPERIENCE",
  HAVE_SKILL_AND_EXPERIENCE: "HAVE_SKILL_AND_EXPERIENCE",
};
const EDUCATION_LEVELS = ["BACHELOR_DEGREE", "MASTER_DEGREE", "SECONDARY_LEVEL", "NONE"];
const NAME_REGEX = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;

const computeHospitalityResult = (hospitalityType) => {
  if (hospitalityType === HOSPITALITY_TYPES.NO_SKILL) {
    return {
      assignedResult: "TRAINING",
      duration: "2 Months",
      fee: 60,
    };
  }
  if (hospitalityType === HOSPITALITY_TYPES.HAVE_SKILL_NO_EXPERIENCE) {
    return {
      assignedResult: "INTERNSHIP_RECOMMENDATION",
      duration: "",
      fee: 0,
    };
  }
  return {
    assignedResult: "GO_TO_WORK_RECOMMENDATION",
    duration: "",
    fee: 0,
  };
};

const normalizeSkills = (value) => {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

const resolveCandidateId = async ({ candidateId, contact, email, phone, fullName }) => {
  if (candidateId) return candidateId;
  const lookup = [];
  if (email) lookup.push({ email: String(email).toLowerCase() });
  if (phone) lookup.push({ phone: String(phone).trim() });
  if (contact) {
    const c = String(contact).trim();
    lookup.push({ phone: c });
    if (c.includes("@")) lookup.push({ email: c.toLowerCase() });
  }
  if (!lookup.length) return null;
  const user = await User.findOne({ $or: lookup, ...(fullName ? { fullName: String(fullName).trim() } : {}) });
  return user?._id || null;
};

const buildPayload = async (body) => {
  const hospitalityType = String(body.hospitalityType || "").toUpperCase();
  const computed = computeHospitalityResult(hospitalityType);
  return {
    candidateId: await resolveCandidateId({
      candidateId: body.candidateId,
      contact: body.contact,
      email: body.email,
      phone: body.phone,
      fullName: body.fullName,
    }),
    idNo: await ensurePrefixedIdNo(HospitalityProgram, String(body.idNo || "").trim(), "HOS"),
    fullName: String(body.fullName || "").trim(),
    gender: String(body.gender || "OTHER").toUpperCase(),
    contact: String(body.contact || "").trim(),
    district: String(body.district || "").trim(),
    educationLevel: String(body.educationLevel || "").trim(),
    faculty: String(body.faculty || "").trim(),
    otherSkills: normalizeSkills(body.otherSkills),
    hospitalityType,
    assignedResult: computed.assignedResult,
    duration: computed.duration,
    fee: computed.fee,
    status: String(body.status || "PENDING").toUpperCase(),
    notes: String(body.notes || "").trim(),
  };
};

const assertHospitalityPayload = (payload) => {
  const requiredStrings = ["fullName", "contact", "district", "educationLevel", "faculty"];
  for (const field of requiredStrings) {
    if (typeof payload[field] !== "string" || !payload[field].trim()) {
      throw new Error(`Validation error at ${field}: expected non-empty string.`);
    }
  }
  if (!NAME_REGEX.test(String(payload.fullName).trim())) {
    throw new Error("Validation error at fullName: letters only.");
  }
  if (!PHONE_REGEX.test(String(payload.contact).trim())) {
    throw new Error("Validation error at contact: expected valid phone digits.");
  }
  const education = String(payload.educationLevel || "").trim().toUpperCase();
  if (!EDUCATION_LEVELS.includes(education)) {
    throw new Error(`Validation error at educationLevel: expected one of ${EDUCATION_LEVELS.join(", ")}.`);
  }
  payload.educationLevel = education;
  if (payload.fee !== undefined && payload.fee !== null && typeof payload.fee !== "number") {
    throw new Error(`Validation error at fee: expected number but received ${typeof payload.fee}.`);
  }
};

export const createHospitality = async (req, res) => {
  try {
    const payload = await buildPayload(req.body);
    assertHospitalityPayload(payload);
    const created = await HospitalityProgram.create(payload);
    res.status(201).json({ success: true, message: "Hospitality record created", data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getHospitalityList = async (req, res) => {
  try {
    const { q = "", district, educationLevel, faculty, hospitalityType, status } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (educationLevel) filter.educationLevel = educationLevel;
    if (faculty) filter.faculty = faculty;
    if (hospitalityType) filter.hospitalityType = hospitalityType;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { idNo: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
        { contact: { $regex: q, $options: "i" } },
      ];
    }

    const rows = await HospitalityProgram.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHospitalityById = async (req, res) => {
  try {
    const row = await HospitalityProgram.findById(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Hospitality record not found" });
    res.json({ success: true, data: row });
  } catch {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

export const updateHospitality = async (req, res) => {
  try {
    const payload = await buildPayload(req.body);
    assertHospitalityPayload(payload);
    const updated = await HospitalityProgram.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ success: false, message: "Hospitality record not found" });
    res.json({ success: true, message: "Hospitality record updated", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
>>>>>>> 9129225 (Start real project changes)
