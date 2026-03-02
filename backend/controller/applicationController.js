import Application from "../model/Application.js";
import Opportunity from "../model/Opportunity.js";

/* =======================================================
   CANDIDATE: APPLY
======================================================= */
export const applyOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.body;

    // optional: check opportunity exists + is published + deadline not passed
    const op = await Opportunity.findById(opportunityId);
    if (!op) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    if (op.status !== "PUBLISHED") {
      return res.status(400).json({ success: false, message: "Opportunity is not published" });
    }

    if (op.deadline && new Date(op.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: "Deadline has passed" });
    }

    const app = await Application.create({
      opportunityId,
      candidateId: req.user.id,
      status: "SUBMITTED",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: app,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already applied to this opportunity",
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   CANDIDATE: GET MY APPLICATIONS
======================================================= */
export const getMyApplications = async (req, res) => {
  try {
    const list = await Application.find({ candidateId: req.user.id })
      .populate({
        path: "opportunityId",
        populate: { path: "companyId", select: "name location industry" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ALL APPLICATIONS (filters)
   ?status=INTERVIEW&opportunityId=...
======================================================= */
export const getAllApplications = async (req, res) => {
  try {
    const { status, opportunityId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (opportunityId) filter.opportunityId = opportunityId;

    const list = await Application.find(filter)
      .populate("candidateId", "username email")
      .populate({
        path: "opportunityId",
        populate: { path: "companyId", select: "name location" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ONE APPLICATION
======================================================= */
export const getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("candidateId", "username email")
      .populate({
        path: "opportunityId",
        populate: { path: "companyId", select: "name location" },
      });

    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, data: app });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

/* =======================================================
   ADMIN: UPDATE STATUS / INTERVIEW DATE / NOTES
======================================================= */
export const updateApplication = async (req, res) => {
  try {
    const allowed = ["status", "interviewDate", "notes"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({
      success: true,
      message: "Application updated successfully",
      data: app,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   CANDIDATE: WITHDRAW (delete) - optional
======================================================= */
export const withdrawMyApplication = async (req, res) => {
  try {
    const deleted = await Application.findOneAndDelete({
      _id: req.params.id,
      candidateId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};