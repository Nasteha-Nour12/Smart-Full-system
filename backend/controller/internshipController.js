import Internship from "../model/Internship.js";

/* =======================================================
   CANDIDATE: REQUEST INTERNSHIP (create PENDING)
======================================================= */
export const requestInternship = async (req, res) => {
  try {
    const { companyId, position, startDate, endDate } = req.body;

    const internship = await Internship.create({
      candidateId: req.user.id,
      companyId,
      position,
      startDate,
      endDate,
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

/* =======================================================
   CANDIDATE: GET MY INTERNSHIPS
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
      .populate("candidateId", "username email")
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
      .populate("candidateId", "username email")
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
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
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

    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
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
   CANDIDATE: CANCEL MY REQUEST (only if PENDING/ACTIVE)
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