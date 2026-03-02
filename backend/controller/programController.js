import Program from "../model/Program.js";

/* =======================================================
   CREATE PROGRAM
======================================================= */
export const createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: program,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   GET ALL PROGRAMS (optional query filters)
   ?type=HOSPITALITY&status=OPEN
======================================================= */
export const getPrograms = async (req, res) => {
  try {
    const { type, status } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const programs = await Program.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   GET SINGLE PROGRAM
======================================================= */
export const getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }
};

/* =======================================================
   UPDATE PROGRAM
======================================================= */
export const updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.json({
      success: true,
      message: "Program updated successfully",
      data: program,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   DELETE PROGRAM
======================================================= */
export const deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }
};

/* =======================================================
   UPDATE PROGRAM STATUS (OPEN/CLOSED/DRAFT)
======================================================= */
export const updateProgramStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["OPEN", "CLOSED", "DRAFT"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.json({
      success: true,
      message: `Program status updated to ${status}`,
      data: program,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};