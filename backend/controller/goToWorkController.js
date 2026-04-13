import GoToWork from "../model/GoToWork.js";
import User from "../model/User.js";
import { getField } from "../utils/importHelpers.js";
import { hasCompletedMandatoryTraining, markCandidateNotEligible } from "../utils/eligibility.js";
import { ensurePrefixedIdNo } from "../utils/idGenerator.js";

const canAssignCandidate = (role) =>
  ["ADMIN", "EMPLOYER", "INTERNSHIP_EMPLOYER"].includes(role);

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

const ensureGoToWorkId = async (docOrId) => {
  if (!docOrId) return null;
  const doc = typeof docOrId === "object" ? docOrId : await GoToWork.findById(docOrId);
  if (!doc) return null;
  if (String(doc.idNo || "").trim()) return doc;
  doc.idNo = await ensurePrefixedIdNo(GoToWork, "", "GTW");
  await doc.save();
  return doc;
};

/* =======================================================
   JOB_SEEKER: SUBMIT (create once)
======================================================= */
export const submitGoToWork = async (req, res) => {
  try {
    let targetCandidateId = req.user.id;
    if (canAssignCandidate(req.user.role)) {
      const resolved = await resolveCandidate({
        candidateId: req.body?.candidateId,
        contact: req.body?.contact,
        email: req.body?.email,
        phone: req.body?.phone,
        fullName: req.body?.fullName,
      });
      targetCandidateId = resolved || req.body?.candidateId || req.user.id;
    }

    const exists = await GoToWork.findOne({ candidateId: targetCandidateId });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "You already have a Go To Work request",
      });
    }

    const eligible = await hasCompletedMandatoryTraining(targetCandidateId);
    if (!eligible) {
      await markCandidateNotEligible(targetCandidateId, "OPPORTUNITY_LOST");
      return res.status(409).json({
        success: false,
        message:
          "Mandatory 3-day training is required and must be completed before Go To Work assignment.",
        eligibility: "NOT_ELIGIBLE",
      });
    }

    const gtw = await GoToWork.create({
      idNo: await ensurePrefixedIdNo(GoToWork, req.body?.idNo || "", "GTW"),
      candidateId: targetCandidateId,
      notes: req.body?.notes || "",
      status: req.body?.status || "SUBMITTED",
      matchedCompanyId: req.body?.matchedCompanyId || null,
      interviewDate: req.body?.interviewDate || null,
      contractUrl: req.body?.contractUrl || "",
      readinessStatus: req.body?.readinessStatus || "READY",
      interviewStatus: req.body?.interviewStatus || "PENDING",
      placementStatus: req.body?.placementStatus || "IN_QUEUE",
      jobTitle: req.body?.jobTitle || "",
      workLocation: req.body?.workLocation || "",
    });

    res.status(201).json({
      success: true,
      message: "Go To Work request submitted",
      data: gtw,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const importGoToWork = async (req, res) => {
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
    const seenCandidates = new Set();

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

        const exists = await GoToWork.findOne({ candidateId });
        if (exists) throw new Error("Candidate already has Go To Work request");
        if (seenCandidates.has(String(candidateId))) throw new Error("Duplicate candidate in the uploaded file");
        seenCandidates.add(String(candidateId));

        const payload = {
          idNo: await ensurePrefixedIdNo(GoToWork, String(getField(row, ["idNo", "id no", "id_number"], "")).trim(), "GTW"),
          candidateId,
          status: String(getField(row, ["status", "goToWorkStatus", "go to work status"], "SUBMITTED")).toUpperCase(),
          matchedCompanyId: getField(row, ["matchedCompanyId", "matched company id"], null) || null,
          interviewDate: getField(row, ["interviewDate", "interview date"], null) || null,
          contractUrl: String(getField(row, ["contractUrl", "contract url", "contractLetter", "contract letter"], "")).trim(),
          readinessStatus: String(getField(row, ["readinessStatus", "readiness status"], "READY")).toUpperCase(),
          interviewStatus: String(getField(row, ["interviewStatus", "interview status"], "PENDING")).toUpperCase(),
          placementStatus: String(getField(row, ["placementStatus", "placement status"], "IN_QUEUE")).toUpperCase(),
          jobTitle: String(getField(row, ["jobTitle", "job title"], "")).trim(),
          workLocation: String(getField(row, ["workLocation", "work location"], "")).trim(),
          notes: String(getField(row, ["notes"], "")).trim(),
        };

        const doc = await GoToWork.create(payload);
        created.push(doc);
      } catch (error) {
        failed.push({ row: i + 1, message: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${created.length} Go To Work rows`,
      data: created,
      failed,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   JOB_SEEKER: GET MY REQUEST
======================================================= */
export const getMyGoToWork = async (req, res) => {
  try {
    let gtw = await GoToWork.findOne({ candidateId: req.user.id })
      .populate("matchedCompanyId", "name location industry status");
    gtw = await ensureGoToWorkId(gtw);

    if (!gtw) {
      return res.json({
        success: true,
        data: null,
        message: "No Go To Work request found",
      });
    }

    res.json({ success: true, data: gtw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ALL REQUESTS (filters)
   ?status=SCREENING
======================================================= */
export const getAllGoToWork = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const list = await GoToWork.find(filter)
      .populate("candidateId", "fullName email phone")
      .populate("matchedCompanyId", "name location")
      .sort({ createdAt: -1 });
    await Promise.all(list.map((row) => ensureGoToWorkId(row)));

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ONE
======================================================= */
export const getGoToWorkById = async (req, res) => {
  try {
    let gtw = await GoToWork.findById(req.params.id)
      .populate("candidateId", "fullName email phone")
      .populate("matchedCompanyId", "name location");
    gtw = await ensureGoToWorkId(gtw);

    if (!gtw) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, data: gtw });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

/* =======================================================
   ADMIN: UPDATE (status, match, interview, contract, notes)
======================================================= */
export const updateGoToWork = async (req, res) => {
  try {
    const allowed = [
      "status",
      "matchedCompanyId",
      "interviewDate",
      "contractUrl",
      "notes",
      "readinessStatus",
      "interviewStatus",
      "placementStatus",
      "jobTitle",
      "workLocation",
    ];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const gtw = await GoToWork.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("candidateId", "fullName email phone")
      .populate("matchedCompanyId", "name location");

    if (!gtw) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({
      success: true,
      message: "Go To Work updated successfully",
      data: gtw,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: UPDATE STATUS ONLY
======================================================= */
export const updateGoToWorkStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "SUBMITTED",
      "SCREENING",
      "MATCHING",
      "INTERVIEW",
      "CONTRACT",
      "PLACED",
      "REJECTED",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const row = await GoToWork.findById(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    if (["INTERVIEW", "CONTRACT", "PLACED"].includes(status)) {
      const eligible = await hasCompletedMandatoryTraining(row.candidateId);
      if (!eligible) {
        await markCandidateNotEligible(row.candidateId, "REMOVED_FROM_QUEUE");
        return res.status(409).json({
          success: false,
          message: "Candidate is not eligible for placement because mandatory training is not completed",
        });
      }
    }

    const gtw = await GoToWork.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: gtw,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: DELETE REQUEST
======================================================= */
export const deleteGoToWork = async (req, res) => {
  try {
    const deleted = await GoToWork.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    res.json({ success: true, message: "Go To Work request deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
