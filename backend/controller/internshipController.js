import Internship from "../model/Internship.js";
import User from "../model/User.js";
import GoToWork from "../model/GoToWork.js";
import CandidateProfile from "../model/candidateProfile.js";
import { getField, toSkillsArray } from "../utils/importHelpers.js";
import { hasCompletedMandatoryTraining, markCandidateNotEligible } from "../utils/eligibility.js";
import { ensurePrefixedIdNo } from "../utils/idGenerator.js";
const EDUCATION_LEVELS = ["BACHELOR_DEGREE", "MASTER_DEGREE", "SECONDARY_LEVEL", "NONE"];
const NAME_REGEX = /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
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

const assertInternshipPayload = (payload) => {
  const requiredStrings = ["fullName", "contact", "district", "educationLevel", "faculty", "position", "companyId"];
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
  if (payload.internshipFee !== undefined && payload.internshipFee !== null && typeof payload.internshipFee !== "number") {
    throw new Error(`Validation error at internshipFee: expected number but received ${typeof payload.internshipFee}.`);
  }
};

/* =======================================================
   JOB_SEEKER: REQUEST INTERNSHIP (create PENDING)
======================================================= */
export const requestInternship = async (req, res) => {
  try {
    const {
      companyId,
      position,
      startDate,
      endDate,
      idNo,
      fullName,
      gender,
      contact,
      district,
      educationLevel,
      faculty,
      otherSkills,
      internshipFee,
      files,
      candidateId,
      email,
      phone,
    } = req.body;

    let targetCandidateId = req.user.id;
    if (canAssignCandidate(req.user.role)) {
      const resolved = await resolveCandidate({
        candidateId,
        contact,
        email,
        phone,
        fullName,
      });
      targetCandidateId = resolved || candidateId || req.user.id;
    }

    const payloadForValidation = {
      companyId,
      position,
      fullName,
      contact,
      district,
      educationLevel,
      faculty,
      internshipFee,
    };
    assertInternshipPayload(payloadForValidation);

    const eligible = await hasCompletedMandatoryTraining(targetCandidateId);
    if (!eligible) {
      await markCandidateNotEligible(targetCandidateId, "OPPORTUNITY_LOST");
      return res.status(409).json({
        success: false,
        message:
          "Mandatory 3-day training is required and must be completed before Internship assignment.",
        eligibility: "NOT_ELIGIBLE",
      });
    }

    const internship = await Internship.create({
      candidateId: targetCandidateId,
      companyId,
      position,
      startDate,
      endDate,
      idNo: await ensurePrefixedIdNo(Internship, idNo, "IN"),
      fullName,
      gender,
      contact,
      district,
      educationLevel,
      faculty,
      otherSkills: toSkillsArray(otherSkills),
      internshipFee: Number(internshipFee || 0),
      files: files || {},
      notes: req.body?.notes || "",
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Internship request submitted",
      data: internship,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const importInternships = async (req, res) => {
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
        const eligible = await hasCompletedMandatoryTraining(candidateId);
        if (!eligible) {
          await markCandidateNotEligible(candidateId, "REMOVED_FROM_QUEUE");
          throw new Error("Candidate is not eligible: mandatory 3-day training is not completed");
        }

        const payload = {
          candidateId,
          companyId: String(getField(row, ["companyId", "company id"])).trim(),
          position: String(getField(row, ["position"])).trim(),
          startDate: getField(row, ["startDate", "start date"]),
          endDate: getField(row, ["endDate", "end date"]),
          idNo: String(getField(row, ["idNo", "id no", "id_number", "idnumber"])).trim(),
          fullName: String(getField(row, ["fullName", "full name"])).trim(),
          gender: String(getField(row, ["gender"], "OTHER")).toUpperCase(),
          contact: String(getField(row, ["contact", "phone", "email"])).trim(),
          district: String(getField(row, ["district"])).trim(),
          educationLevel: String(getField(row, ["educationLevel", "education level"])).trim(),
          faculty: String(getField(row, ["faculty"])).trim(),
          otherSkills: toSkillsArray(getField(row, ["otherSkills", "other skills"])),
          status: String(getField(row, ["internshipStatus", "internship status", "status"], "PENDING")).toUpperCase(),
          internshipFee: Number(getField(row, ["internshipFee", "internship fee"], 0) || 0),
          evaluationScore: getField(row, ["evaluationScore", "evaluation score"], "") === ""
            ? null
            : Number(getField(row, ["evaluationScore", "evaluation score"], 0)),
          recommendationLetterUrl: String(
            getField(row, ["recommendationLetter", "recommendation letter", "recommendationLetterUrl"], "")
          ).trim(),
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
        };
        payload.idNo = await ensurePrefixedIdNo(Internship, payload.idNo, "IN");

        if (!payload.fullName) throw new Error("fullName is required");
        if (!payload.contact) throw new Error("contact is required");
        if (!payload.companyId) throw new Error("companyId is required");
        if (!payload.position) throw new Error("position is required");
        if (!payload.startDate || !payload.endDate) throw new Error("startDate and endDate are required");

        const key = payload.idNo.toLowerCase();
        if (seenIdNos.has(key)) throw new Error("Duplicate idNo in the uploaded file");
        seenIdNos.add(key);

        const existing = await Internship.findOne({
          candidateId,
          idNo: payload.idNo,
          companyId: payload.companyId,
          position: payload.position,
        });
        if (existing) throw new Error("Duplicate internship row for this candidate");

        const doc = await Internship.create(payload);
        created.push(doc);
      } catch (error) {
        failed.push({ row: i + 1, message: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${created.length} internship rows`,
      data: created,
      failed,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   JOB_SEEKER: GET MY INTERNSHIPS
======================================================= */
export const getMyInternships = async (req, res) => {
  try {
    const list = await Internship.find({ candidateId: req.user.id })
      .populate("companyId", "name industry location status")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ALL INTERNSHIPS
======================================================= */
export const getAllInternships = async (req, res) => {
  try {
    const list = await Internship.find()
      .populate("candidateId", "fullName email phone role")
      .populate("companyId", "name location")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ONE
======================================================= */
export const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate("candidateId", "fullName email phone role")
      .populate("companyId", "name location");

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    res.json({ success: true, data: internship });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

/* =======================================================
   ADMIN: UPDATE (status, dates, position, evaluation, letter)
======================================================= */
export const updateInternship = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      ...(req.body.otherSkills ? { otherSkills: toSkillsArray(req.body.otherSkills) } : {}),
    };
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    res.json({
      success: true,
      message: "Internship updated successfully",
      data: internship,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: UPDATE STATUS ONLY
======================================================= */
export const updateInternshipStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const internshipRow = await Internship.findById(req.params.id);
    if (!internshipRow) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }
    if (status === "ACTIVE" || status === "COMPLETED") {
      const eligible = await hasCompletedMandatoryTraining(internshipRow.candidateId);
      if (!eligible) {
        await markCandidateNotEligible(internshipRow.candidateId, "NOT_ELIGIBLE");
        return res.status(409).json({
          success: false,
          message: "Cannot activate internship because mandatory training is not completed",
        });
      }
    }

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (status === "COMPLETED" && internship?.candidateId) {
      const existingGoToWork = await GoToWork.findOne({ candidateId: internship.candidateId });
      if (!existingGoToWork) {
        await GoToWork.create({
          candidateId: internship.candidateId,
          status: "SUBMITTED",
          readinessStatus: "READY",
          interviewStatus: "PENDING",
          placementStatus: "IN_QUEUE",
          notes: "Auto-created after internship completion",
        });
      }
      await CandidateProfile.findOneAndUpdate(
        { userId: internship.candidateId },
        { selectedProgram: "GO_TO_WORK", assignedProgram: "GO_TO_WORK", candidateStatus: "ACTIVE" }
      );
    }

    res.json({
      success: true,
      message: `Internship status updated to ${status}`,
      data: internship,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   JOB_SEEKER: CANCEL MY REQUEST (only if PENDING/ACTIVE)
======================================================= */
export const cancelMyInternship = async (req, res) => {
  try {
    const internship = await Internship.findOne({
      _id: req.params.id,
      candidateId: req.user.id,
    });

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    // you can decide rules
    if (internship.status === "COMPLETED") {
      return res.status(400).json({ success: false, message: "Cannot cancel completed internship" });
    }

    internship.status = "CANCELLED";
    await internship.save();

    res.json({ success: true, message: "Internship cancelled successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: DELETE INTERNSHIP
======================================================= */
export const deleteInternship = async (req, res) => {
  try {
    const deleted = await Internship.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }
    res.json({ success: true, message: "Internship deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
