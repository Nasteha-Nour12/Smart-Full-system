import GoToWork from "../model/GoToWork.js";

/* =======================================================
   JOB_SEEKER: SUBMIT (create once)
======================================================= */
export const submitGoToWork = async (req, res) => {
  try {
    const exists = await GoToWork.findOne({ candidateId: req.user.id });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "You already have a Go To Work request",
      });
    }

    const gtw = await GoToWork.create({
      candidateId: req.user.id,
      notes: req.body?.notes || "",
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

/* =======================================================
   JOB_SEEKER: GET MY REQUEST
======================================================= */
export const getMyGoToWork = async (req, res) => {
  try {
    const gtw = await GoToWork.findOne({ candidateId: req.user.id })
      .populate("matchedCompanyId", "name location industry status");

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
      .populate("candidateId", "username email")
      .populate("matchedCompanyId", "name location")
      .sort({ createdAt: -1 });

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
    const gtw = await GoToWork.findById(req.params.id)
      .populate("candidateId", "username email")
      .populate("matchedCompanyId", "name location");

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
    const allowed = ["status", "matchedCompanyId", "interviewDate", "contractUrl", "notes"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const gtw = await GoToWork.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("candidateId", "username email")
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

    const gtw = await GoToWork.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!gtw) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: gtw,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
