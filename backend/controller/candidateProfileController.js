import CandidateProfile from "../model/candidateProfile.js";
import mongoose from "mongoose";
import User from "../model/User.js";
import TrainingProgram from "../model/TrainingProgram.js";
import Internship from "../model/Internship.js";
import GoToWork from "../model/GoToWork.js";
import Company from "../model/Company.js";
import { getField, toSkillsArray } from "../utils/importHelpers.js";
import { applyCandidateProgramLogic } from "../utils/candidateProgramLogic.js";
import { ensurePrefixedIdNo } from "../utils/idGenerator.js";

const normalizeObjectId = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const lowered = raw.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return null;
  return mongoose.Types.ObjectId.isValid(raw) ? raw : null;
};

const getAuthUserId = (req) => normalizeObjectId(req.user?.id || req.user?._id || req.user?.sub);

const ensureTrainingForCandidate = async (profile) => {
  const selected = String(profile.selectedProgram || "").toUpperCase();
  const assigned = String(profile.assignedProgram || "").toUpperCase();
  const hospitalityType = String(profile.hospitalityType || "").toUpperCase();

  if (selected === "HOSPITALITY" && hospitalityType === "NO_SKILL") {
    const existing = await TrainingProgram.findOne({
      candidateId: profile.userId,
      trainingType: "HOSPITALITY_LONG_2_MONTH",
    });
    if (!existing) {
      await TrainingProgram.create({
        candidateId: profile.userId,
        idNo: profile.idNo || "N/A",
        fullName: profile.userId?.fullName || profile.fullName || "Candidate",
        gender: profile.gender || "OTHER",
        contact: profile.contact || profile.userId?.phone || profile.userId?.email || "",
        district: profile.district || "N/A",
        educationLevel: profile.educationLevel || profile.education || "N/A",
        faculty: profile.faculty || "N/A",
        otherSkills: profile.skills?.map((s) => s.name) || [],
        selectedProgram: "HOSPITALITY",
        hospitalityType: "NO_SKILL",
        trainingType: "HOSPITALITY_LONG_2_MONTH",
        trainingStatus: "PENDING",
        trainingFee: profile.trainingFee || 60,
        durationMonths: 2,
      });
    }
    return;
  }

  if (assigned === "INTERNSHIP" || assigned === "GO_TO_WORK" || selected === "INTERNSHIP" || selected === "GO_TO_WORK") {
    const existing = await TrainingProgram.findOne({
      candidateId: profile.userId,
      trainingType: "MANDATORY_3_DAY",
    });
    if (!existing) {
      await TrainingProgram.create({
        candidateId: profile.userId,
        idNo: profile.idNo || "N/A",
        fullName: profile.userId?.fullName || profile.fullName || "Candidate",
        gender: profile.gender || "OTHER",
        contact: profile.contact || profile.userId?.phone || profile.userId?.email || "",
        district: profile.district || "N/A",
        educationLevel: profile.educationLevel || profile.education || "N/A",
        faculty: profile.faculty || "N/A",
        otherSkills: profile.skills?.map((s) => s.name) || [],
        selectedProgram: selected || assigned,
        hospitalityType: profile.hospitalityType || "",
        trainingType: "MANDATORY_3_DAY",
        trainingStatus: profile.mandatoryTrainingStatus || "PENDING",
        trainingFee: 10,
        durationDays: 3,
      });
    }
  }
};

const ensureProgramPlacement = async (profile) => {
  const selected = String(profile.selectedProgram || "").toUpperCase();
  const assigned = String(profile.assignedProgram || "").toUpperCase();
  const target = assigned || selected;

  if (target === "INTERNSHIP") {
    const existing = await Internship.findOne({ candidateId: profile.userId });
    if (!existing) {
      const company = await Company.findOne().select("_id").lean();
      if (!company?._id) return;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 30);
      await Internship.create({
        candidateId: profile.userId,
        companyId: company._id,
        idNo: await ensurePrefixedIdNo(Internship, "", "IN"),
        fullName: profile.userId?.fullName || "Visitor",
        gender: profile.gender || "OTHER",
        contact: profile.contact || profile.userId?.phone || profile.userId?.email || "",
        district: profile.district || "N/A",
        educationLevel: profile.educationLevel || profile.education || "NONE",
        faculty: profile.faculty || "N/A",
        otherSkills: profile.skills?.map((s) => s.name) || [],
        position: "PENDING_ASSIGNMENT",
        startDate,
        endDate,
        internshipFee: 0,
        status: "PENDING",
        notes: "Auto-created from Visitors module",
      });
    }
    return;
  }

  if (target === "GO_TO_WORK") {
    const existing = await GoToWork.findOne({ candidateId: profile.userId });
    if (!existing) {
      await GoToWork.create({
        candidateId: profile.userId,
        status: "SUBMITTED",
        readinessStatus: "PENDING",
        interviewStatus: "NOT_SCHEDULED",
        placementStatus: "IN_QUEUE",
        notes: "Auto-created from Visitors module",
      });
    }
  }
};

const resolveUser = async ({ userId, contact, email, phone, fullName }) => {
  const normalizedUserId = normalizeObjectId(userId);
  if (normalizedUserId) return normalizedUserId;
  const lookup = [];
  if (email) lookup.push({ email: String(email).toLowerCase() });
  if (phone) lookup.push({ phone: String(phone).trim() });
  if (contact) {
    const c = String(contact).trim();
    lookup.push({ phone: c });
    if (c.includes("@")) lookup.push({ email: c.toLowerCase() });
  }
  if (!lookup.length) return null;
  const user = await User.findOne({ $or: lookup });
  if (user?._id) return user._id;
  if (!fullName) return null;
  const byName = await User.findOne({ fullName: String(fullName).trim() });
  if (byName?._id) return byName._id;
  return null;
};

const createCandidateUserIfMissing = async ({ contact, email, phone, fullName, idNo }) => {
  const normalizedEmail = String(email || (String(contact || "").includes("@") ? contact : ""))
    .trim()
    .toLowerCase();
  const normalizedPhone = String(phone || (!String(contact || "").includes("@") ? contact : ""))
    .trim();
  const candidateName = String(fullName || "Candidate").trim();
  const cleanId = String(idNo || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const fallbackEmail = cleanId ? `candidate.${cleanId}@smartses.local` : "";
  const finalEmail = normalizedEmail || fallbackEmail;
  const finalPhone = normalizedPhone;

  if (!finalEmail && !finalPhone) return null;

  const existing = await User.findOne({
    $or: [finalEmail ? { email: finalEmail } : null, finalPhone ? { phone: finalPhone } : null].filter(Boolean),
  });
  if (existing?._id) return existing._id;

  const randomPassword = Math.random().toString(36).slice(-10) + "A1!";
  const created = await User.create({
    fullName: candidateName,
    email: finalEmail || undefined,
    phone: finalPhone || undefined,
    passwordHash: randomPassword,
    role: "JOB_SEEKER",
    status: "ACTIVE",
  });
  return created._id;
};

const ensureCandidateRole = async (userId) => {
  if (!userId) return;
  const user = await User.findById(userId);
  if (!user) return;
  const email = String(user.email || "").toLowerCase();
  const looksLikeImportedCandidate = email.startsWith("candidate.") && email.endsWith("@smartses.local");
  if (looksLikeImportedCandidate && user.role !== "JOB_SEEKER") {
    user.role = "JOB_SEEKER";
    await user.save();
  }
};

const withProgramLogic = (payload) => {
  const next = applyCandidateProgramLogic(payload);
  const normalizedEducation = next.educationLevel || next.education || "";
  return {
    ...next,
    education: normalizedEducation,
    educationLevel: normalizedEducation,
  };
};

const withDocumentStatuses = (payload) => {
  const next = { ...payload };
  const statusFromUrl = (url, prev) => {
    if (prev && prev !== "MISSING") return prev;
    return url ? "UPLOADED" : "MISSING";
  };
  next.documents = {
    cv: { url: next.cvUrl || "", status: statusFromUrl(next.cvUrl, next.documents?.cv?.status) },
    coverLetter: {
      url: next.coverLetterUrl || "",
      status: statusFromUrl(next.coverLetterUrl, next.documents?.coverLetter?.status),
    },
    nationalId: { url: next.idUrl || "", status: statusFromUrl(next.idUrl, next.documents?.nationalId?.status) },
    secondaryCertificate: {
      url: next.secondaryCertificateUrl || "",
      status: statusFromUrl(next.secondaryCertificateUrl, next.documents?.secondaryCertificate?.status),
    },
    universityCertificate: {
      url: next.universityCertificateUrl || "",
      status: statusFromUrl(next.universityCertificateUrl, next.documents?.universityCertificate?.status),
    },
    passportPhoto1: {
      url: next.passportPhoto1Url || "",
      status: statusFromUrl(next.passportPhoto1Url, next.documents?.passportPhoto1?.status),
    },
    passportPhoto2: {
      url: next.passportPhoto2Url || "",
      status: statusFromUrl(next.passportPhoto2Url, next.documents?.passportPhoto2?.status),
    },
    contractLetter: {
      url: next.contractLetterUrl || "",
      status: statusFromUrl(next.contractLetterUrl, next.documents?.contractLetter?.status),
    },
  };
  return next;
};

const parseDocumentCell = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return { url: "", status: "MISSING" };

  const normalized = raw.toUpperCase().replace(/[\s-]+/g, "_");
  const statusMap = {
    MISSING: "MISSING",
    UPLOADED: "UPLOADED",
    PENDING: "PENDING_VERIFICATION",
    PENDING_VERIFICATION: "PENDING_VERIFICATION",
    VERIFIED: "VERIFIED",
    YES: "UPLOADED",
    NO: "MISSING",
  };

  if (statusMap[normalized]) {
    return { url: "", status: statusMap[normalized] };
  }

  return { url: raw, status: "UPLOADED" };
};

/* =======================================================
   GET MY PROFILE (logged-in candidate)
======================================================= */
export const getMyProfile = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: "Invalid session. Please login again." });

    const profile = await CandidateProfile.findOne({ userId: authUserId }).populate(
      "userId",
      "fullName email role phone"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Create your profile first.",
      });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   CREATE OR UPDATE MY PROFILE (UPSERT)
   - haddii uu jiro update, haddii uusan jirin create
======================================================= */
export const upsertMyProfile = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: "Invalid session. Please login again." });

    const payload = withDocumentStatuses(withProgramLogic({ ...req.body, userId: authUserId }));
    payload.idNo = await ensurePrefixedIdNo(CandidateProfile, payload.idNo, "CAN");

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: authUserId },
      payload,
      { new: true, upsert: true, runValidators: true }
    );
    await ensureTrainingForCandidate(profile);
    await ensureProgramPlacement(profile);

    res.status(200).json({
      success: true,
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   UPDATE MY PROFILE (partial update)
======================================================= */
export const updateMyProfile = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: "Invalid session. Please login again." });

    const payload = withDocumentStatuses(withProgramLogic(req.body));
    payload.idNo = await ensurePrefixedIdNo(CandidateProfile, payload.idNo, "CAN");
    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: authUserId },
      payload,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    await ensureTrainingForCandidate(profile);
    await ensureProgramPlacement(profile);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADD SKILL (push)
======================================================= */
export const addSkill = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: "Invalid session. Please login again." });

    const { name, level } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Skill name is required" });
    }

    const profile = await CandidateProfile.findOne({ userId: authUserId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // prevent duplicate skill name (case-insensitive)
    const exists = profile.skills.some(
      (s) => s?.name?.toLowerCase() === String(name).toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ success: false, message: "Skill already exists" });
    }

    profile.skills.push({
      name: String(name).trim(),
      level: level || "BEGINNER",
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: "Skill added successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   REMOVE SKILL (by skillId)
======================================================= */
export const removeSkill = async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ success: false, message: "Invalid session. Please login again." });

    const { skillId } = req.params;

    const profile = await CandidateProfile.findOne({ userId: authUserId });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const before = profile.skills.length;
    profile.skills = profile.skills.filter((s) => String(s._id) !== String(skillId));

    if (profile.skills.length === before) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    await profile.save();

    res.json({
      success: true,
      message: "Skill removed successfully",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ALL PROFILES
======================================================= */
export const getAllProfiles = async (req, res) => {
  try {
    const query = {};
    if (req.query.idNo) query.idNo = { $regex: req.query.idNo, $options: "i" };
    if (req.query.district) query.district = req.query.district;
    if (req.query.educationLevel) query.educationLevel = req.query.educationLevel;
    if (req.query.faculty) query.faculty = req.query.faculty;
    if (req.query.selectedProgram) query.selectedProgram = req.query.selectedProgram;
    if (req.query.trainingStatus) query.trainingStatus = req.query.trainingStatus;

    const profiles = await CandidateProfile.find(query)
      .populate("userId", "fullName email role phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET PROFILE BY USER ID
======================================================= */
export const getProfileByUserId = async (req, res) => {
  try {
    const userId = normalizeObjectId(req.params.userId);
    if (!userId) return res.status(400).json({ success: false, message: "Invalid userId" });

    const profile = await CandidateProfile.findOne({ userId }).populate(
      "userId",
      "fullName email role phone"
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: DELETE PROFILE BY USER ID
======================================================= */
export const deleteProfileByUserId = async (req, res) => {
  try {
    const userId = normalizeObjectId(req.params.userId);
    if (!userId) return res.status(400).json({ success: false, message: "Invalid userId" });

    const deleted = await CandidateProfile.findOneAndDelete({ userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const upsertProfileByAdmin = async (req, res) => {
  try {
    let userId = await resolveUser({
      userId: req.body?.userId,
      contact: req.body?.contact,
      email: req.body?.email,
      phone: req.body?.phone,
      fullName: req.body?.fullName,
    });
    if (!userId && req.body?.idNo) {
      const normalizedIdNo = await ensurePrefixedIdNo(CandidateProfile, String(req.body.idNo).trim(), "CAN");
      const existingProfile = await CandidateProfile.findOne({ idNo: normalizedIdNo });
      if (existingProfile?.userId) userId = existingProfile.userId;
    }
    if (!userId) {
      userId = await createCandidateUserIfMissing({
        contact: req.body?.contact,
        email: req.body?.email,
        phone: req.body?.phone,
        fullName: req.body?.fullName,
        idNo: req.body?.idNo,
      });
    }
    await ensureCandidateRole(userId);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Candidate user was not found by userId/contact/phone/email" });
    }

    const payload = withDocumentStatuses(withProgramLogic({
      ...req.body,
      userId,
      otherSkills: toSkillsArray(req.body.otherSkills),
      notes: req.body.notes || req.body.remarks || "",
    }));
    payload.idNo = await ensurePrefixedIdNo(CandidateProfile, payload.idNo, "CAN");

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId },
      payload,
      { new: true, upsert: true, runValidators: true }
    );

    await ensureTrainingForCandidate(profile);
    await ensureProgramPlacement(profile);
    res.status(200).json({ success: true, message: "Candidate registration saved", data: profile });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const importProfilesByAdmin = async (req, res) => {
  try {
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
        const idNo = String(getField(row, ["idNo", "id no", "idnumber", "id_number"])).trim();
        const fullName = String(getField(row, ["fullName", "full name", "candidate", "name"])).trim();
        const contact = String(getField(row, ["contact", "phone", "email"], "")).trim();
        if (!fullName) {
          throw new Error("Required: fullName/candidate");
        }
        const normalizedIdNo = await ensurePrefixedIdNo(CandidateProfile, idNo, "CAN");
        const key = normalizedIdNo.toLowerCase();
        if (seenIdNos.has(key)) throw new Error("Duplicate idNo in uploaded file");
        seenIdNos.add(key);

        const cvDoc = parseDocumentCell(getField(row, ["cv", "cvUrl", "cv url"], ""));
        const coverDoc = parseDocumentCell(getField(row, ["coverLetter", "cover letter", "coverLetterUrl"], ""));
        const idDoc = parseDocumentCell(getField(row, ["nationalId", "national id", "idUrl"], ""));
        const secondaryDoc = parseDocumentCell(
          getField(row, ["secondaryCertificate", "secondary certificate", "secondaryCertificateUrl"], "")
        );
        const universityDoc = parseDocumentCell(
          getField(row, ["universityCertificate", "university certificate", "universityCertificateUrl"], "")
        );
        const passport1Doc = parseDocumentCell(
          getField(row, ["passportPhoto1", "passport photo 1", "passportPhoto1Url", "passportPhotos", "passport photos"], "")
        );
        const passport2Doc = parseDocumentCell(
          getField(row, ["passportPhoto2", "passport photo 2", "passportPhoto2Url", "passportPhotos", "passport photos"], "")
        );
        const contractDoc = parseDocumentCell(getField(row, ["contractLetter", "contract letter", "contractLetterUrl"], ""));

        let userId = await resolveUser({
          userId: getField(row, ["userId", "candidateId"]),
          contact,
          email: getField(row, ["email"]),
          phone: getField(row, ["phone"]),
          fullName,
        });
        if (!userId && normalizedIdNo) {
          const existingProfile = await CandidateProfile.findOne({ idNo: normalizedIdNo });
          if (existingProfile?.userId) userId = existingProfile.userId;
        }
        if (!userId) {
          userId = await createCandidateUserIfMissing({
            contact,
            email: getField(row, ["email"]),
            phone: getField(row, ["phone"]),
            fullName,
            idNo: normalizedIdNo,
          });
        }
        await ensureCandidateRole(userId);
        if (!userId) throw new Error("Candidate user not found");

        const existingDifferent = await CandidateProfile.findOne({ idNo: normalizedIdNo, userId: { $ne: userId } });
        if (existingDifferent) throw new Error("Duplicate idNo already used by another candidate");

        const payload = withDocumentStatuses(withProgramLogic({
          userId,
          idNo: normalizedIdNo,
          fullName,
          gender: String(getField(row, ["gender"], "OTHER")).toUpperCase(),
          contact,
          district: String(getField(row, ["district"])).trim(),
          educationLevel: String(getField(row, ["educationLevel", "education level"])).trim(),
          faculty: String(getField(row, ["faculty"])).trim(),
          otherSkills: toSkillsArray(getField(row, ["otherSkills", "other skills"])),
          selectedProgram: String(getField(row, ["selectedProgram", "selected program"], "CANDIDATE")).toUpperCase(),
          hospitalityType: String(getField(row, ["hospitalityType", "hospitality type"], "")).toUpperCase(),
          candidateStatus: String(getField(row, ["candidateStatus", "candidate status"], "NEW")).toUpperCase(),
          trainingStatus: String(getField(row, ["trainingStatus", "training status"], "PENDING")).toUpperCase(),
          mandatoryTrainingStatus: String(getField(row, ["trainingStatus", "training status"], "PENDING")).toUpperCase(),
          trainingFee: Number(getField(row, ["trainingFee", "training fee"], 0) || 0),
          programFee: Number(getField(row, ["programFee", "program fee"], 0) || 0),
          notes: String(getField(row, ["notes", "remarks"], "")).trim(),
          cvUrl: cvDoc.url,
          coverLetterUrl: coverDoc.url,
          idUrl: idDoc.url,
          secondaryCertificateUrl: secondaryDoc.url,
          universityCertificateUrl: universityDoc.url,
          passportPhoto1Url: passport1Doc.url,
          passportPhoto2Url: passport2Doc.url,
          contractLetterUrl: contractDoc.url,
          documents: {
            cv: { status: cvDoc.status },
            coverLetter: { status: coverDoc.status },
            nationalId: { status: idDoc.status },
            secondaryCertificate: { status: secondaryDoc.status },
            universityCertificate: { status: universityDoc.status },
            passportPhoto1: { status: passport1Doc.status },
            passportPhoto2: { status: passport2Doc.status },
            contractLetter: { status: contractDoc.status },
          },
        }));

        const profile = await CandidateProfile.findOneAndUpdate(
          { userId },
          payload,
          { new: true, upsert: true, runValidators: true }
        );

        await ensureTrainingForCandidate(profile);
        await ensureProgramPlacement(profile);
        created.push(profile);
      } catch (error) {
        failed.push({ row: i + 1, message: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${created.length} candidate rows`,
      data: created,
      failed,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
