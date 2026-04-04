import TrainingProgram from "../model/TrainingProgram.js";
import User from "../model/User.js";
import { getField, toSkillsArray } from "../utils/importHelpers.js";
import { applyCandidateProgramLogic } from "../utils/candidateProgramLogic.js";

const allowedStatuses = ["PENDING", "SCHEDULED", "ATTENDING", "COMPLETED", "FAILED", "ABSENT", "CANCELLED"];

const normalizePayload = (payload) => ({
  ...payload,
  otherSkills: toSkillsArray(payload.otherSkills),
});

const applyTrainingTypeDefaults = (payload) => {
  const next = { ...payload };
  const selectedProgram = String(next.selectedProgram || "").toUpperCase();
  const hospitalityType = String(next.hospitalityType || "").toUpperCase();

  if (next.trainingType) return next;

  if (selectedProgram === "HOSPITALITY" && hospitalityType === "NO_SKILL") {
    next.trainingType = "HOSPITALITY_LONG_2_MONTH";
    if (!next.durationMonths) next.durationMonths = 2;
    if (!next.trainingFee && next.trainingFee !== 0) next.trainingFee = 60;
    return next;
  }

  if (selectedProgram === "INTERNSHIP" || selectedProgram === "GO_TO_WORK") {
    next.trainingType = "MANDATORY_3_DAY";
    if (!next.durationDays) next.durationDays = 3;
    if (!next.trainingFee && next.trainingFee !== 0) next.trainingFee = 10;
    return next;
  }

  next.trainingType = "GENERAL";
  return next;
};

const canAssignCandidate = (role) =>
  ["ADMIN", "ICT_OFFICER", "EMPLOYER", "INTERNSHIP_EMPLOYER"].includes(role);

const resolveCandidate = async ({ candidateId, contact, email, phone, fullName }) => {
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

export const createTrainingProgram = async (req, res) => {
  try {
    const payload = applyTrainingTypeDefaults(applyCandidateProgramLogic(normalizePayload(req.body)));
    const isPrivileged = canAssignCandidate(req.user.role);
    let targetCandidateId = req.user.id;

    if (isPrivileged) {
      const resolved = await resolveCandidate(payload);
      targetCandidateId = resolved || payload.candidateId || req.user.id;
    }

    const created = await TrainingProgram.create({
      ...payload,
      candidateId: targetCandidateId,
    });
    res.status(201).json({
      success: true,
      message: "Training registration created successfully",
      data: created,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const importTrainingPrograms = async (req, res) => {
  try {
    if (!canAssignCandidate(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }

    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) {
      return res.status(400).json({ success: false, message: "rows array is required" });
    }

    const created = [];
    const failed = [];
    const seenIdNos = new Set();

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      try {
        const candidateId = await resolveCandidate({
          candidateId: getField(row, ["candidateId", "userId"]),
          contact: getField(row, ["contact", "phone", "email"]),
          email: getField(row, ["email"]),
          phone: getField(row, ["phone"]),
          fullName: getField(row, ["fullName", "full name"]),
        });

        if (!candidateId) throw new Error("Candidate user not found by candidateId/phone/email/contact");

        const payload = {
          candidateId,
          idNo: String(getField(row, ["idNo", "id no", "id_number", "idnumber"])).trim(),
          fullName: String(getField(row, ["fullName", "full name"])).trim(),
          gender: String(getField(row, ["gender"], "OTHER")).toUpperCase(),
          contact: String(getField(row, ["contact", "phone", "email"])).trim(),
          district: String(getField(row, ["district"])).trim(),
          educationLevel: String(getField(row, ["educationLevel", "education level"])).trim(),
          faculty: String(getField(row, ["faculty"])).trim(),
          otherSkills: toSkillsArray(getField(row, ["otherSkills", "other skills"])),
          trainingStatus: String(getField(row, ["trainingStatus", "training status"], "PENDING")).toUpperCase(),
          trainingFee: Number(getField(row, ["trainingFee", "training fee"], 0) || 0),
          files: {
            cvUrl: String(getField(row, ["cv", "cvUrl", "cv url"], "")).trim(),
            coverLetterUrl: String(getField(row, ["coverLetter", "cover letter", "coverLetterUrl"], "")).trim(),
            nationalIdUrl: String(getField(row, ["nationalId", "national id", "nationalIdUrl"], "")).trim(),
            secondaryCertificateUrl: String(
              getField(row, ["secondaryCertificate", "secondary certificate", "secondaryCertificateUrl"], "")
            ).trim(),
            universityCertificateUrl: String(
              getField(row, ["universityCertificate", "university certificate", "universityCertificateUrl"], "")
            ).trim(),
            passportPhoto1Url: String(getField(row, ["passportPhoto1", "passport photo 1", "passportPhoto1Url"], "")).trim(),
            passportPhoto2Url: String(getField(row, ["passportPhoto2", "passport photo 2", "passportPhoto2Url"], "")).trim(),
            contractLetterUrl: String(getField(row, ["contractLetter", "contract letter", "contractLetterUrl"], "")).trim(),
          },
          notes: String(getField(row, ["notes"], "")).trim(),
        };

        if (!payload.idNo) throw new Error("idNo is required");
        if (!payload.fullName) throw new Error("fullName is required");
        if (!payload.contact) throw new Error("contact is required");

        const key = payload.idNo.toLowerCase();
        if (seenIdNos.has(key)) throw new Error("Duplicate idNo in the uploaded file");
        seenIdNos.add(key);

        const existing = await TrainingProgram.findOne({ idNo: payload.idNo, candidateId });
        if (existing) throw new Error("Duplicate training record for this idNo and candidate");

        const doc = await TrainingProgram.create(applyTrainingTypeDefaults(applyCandidateProgramLogic(payload)));
        created.push(doc);
      } catch (error) {
        failed.push({ row: i + 1, message: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${created.length} training rows`,
      data: created,
      failed,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyTrainingPrograms = async (req, res) => {
  try {
    const rows = await TrainingProgram.find({ candidateId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTrainingPrograms = async (_req, res) => {
  try {
    const rows = await TrainingProgram.find()
      .populate("candidateId", "fullName email phone role status")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrainingProgramById = async (req, res) => {
  try {
    const row = await TrainingProgram.findById(req.params.id).populate(
      "candidateId",
      "fullName email phone role status"
    );
    if (!row) return res.status(404).json({ success: false, message: "Training registration not found" });
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

export const updateTrainingProgram = async (req, res) => {
  try {
    const payload = applyTrainingTypeDefaults(applyCandidateProgramLogic(normalizePayload(req.body)));
    const updated = await TrainingProgram.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ success: false, message: "Training registration not found" });
    res.json({ success: true, message: "Training registration updated", data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTrainingStatus = async (req, res) => {
  try {
    const { trainingStatus } = req.body;
    if (!allowedStatuses.includes(trainingStatus)) {
      return res.status(400).json({ success: false, message: "Invalid training status" });
    }
    const updated = await TrainingProgram.findByIdAndUpdate(
      req.params.id,
      { trainingStatus },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Training registration not found" });
    res.json({
      success: true,
      message: `Training status updated to ${trainingStatus}`,
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const cancelMyTrainingProgram = async (req, res) => {
  try {
    const row = await TrainingProgram.findOne({ _id: req.params.id, candidateId: req.user.id });
    if (!row) return res.status(404).json({ success: false, message: "Training registration not found" });
    if (row.trainingStatus === "COMPLETED") {
      return res.status(400).json({ success: false, message: "Completed training cannot be cancelled" });
    }
    row.trainingStatus = "CANCELLED";
    await row.save();
    res.json({ success: true, message: "Training registration cancelled", data: row });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTrainingProgram = async (req, res) => {
  try {
    const deleted = await TrainingProgram.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Training registration not found" });
    res.json({ success: true, message: "Training registration deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
