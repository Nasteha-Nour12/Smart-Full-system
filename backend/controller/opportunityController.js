import Opportunity from "../model/Opportunity.js";

/* =======================================================
   CREATE OPPORTUNITY (ADMIN/EMPLOYER)
======================================================= */
export const createOpportunity = async (req, res) => {
  try {
    const op = await Opportunity.create(req.body);

    res.status(201).json({
      success: true,
      message: "Opportunity created successfully",
      data: op,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   GET OPPORTUNITIES (filters)
   ?type=JOB&status=PUBLISHED&companyId=...
======================================================= */
export const getOpportunities = async (req, res) => {
  try {
    const { type, status, companyId } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (companyId) filter.companyId = companyId;

    const list = await Opportunity.find(filter)
      .populate("companyId", "name location industry status")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   GET SINGLE OPPORTUNITY
======================================================= */
export const getOpportunityById = async (req, res) => {
  try {
    const op = await Opportunity.findById(req.params.id).populate(
      "companyId",
      "name location industry status"
    );

    if (!op) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    res.json({ success: true, data: op });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

/* =======================================================
   UPDATE OPPORTUNITY
======================================================= */
export const updateOpportunity = async (req, res) => {
  try {
    const op = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!op) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    res.json({
      success: true,
      message: "Opportunity updated successfully",
      data: op,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   DELETE OPPORTUNITY
======================================================= */
export const deleteOpportunity = async (req, res) => {
  try {
    const op = await Opportunity.findByIdAndDelete(req.params.id);

    if (!op) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    res.json({ success: true, message: "Opportunity deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid ID" });
  }
};

/* =======================================================
   UPDATE STATUS (DRAFT/PUBLISHED/CLOSED)
======================================================= */
export const updateOpportunityStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["DRAFT", "PUBLISHED", "CLOSED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const op = await Opportunity.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!op) {
      return res.status(404).json({ success: false, message: "Opportunity not found" });
    }

    res.json({
      success: true,
      message: `Opportunity status updated to ${status}`,
      data: op,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};