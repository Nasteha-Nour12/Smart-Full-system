import Enrollment from "../model/Enrollment.js";
import Program from "../model/Program.js";

/* =======================================================
   ENROLL IN PROGRAM (Candidate)
======================================================= */
export const enrollProgram = async (req, res) => {
  try {
    const { programId } = req.body;

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    if (program.status !== "OPEN") {
      return res.status(400).json({ success: false, message: "Program is not open" });
    }

    if (program.seats <= 0) {
      return res.status(400).json({ success: false, message: "No seats available" });
    }

    const enrollment = await Enrollment.create({
      programId,
      candidateId: req.user.id,
    });

    // reduce seats
    program.seats -= 1;
    if (program.seats === 0) {
      program.status = "CLOSED";
    }

    await program.save();

    res.status(201).json({
      success: true,
      message: "Successfully enrolled",
      data: enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this program",
      });
    }

    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   GET MY ENROLLMENTS
======================================================= */
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      candidateId: req.user.id,
    }).populate("programId");

    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: GET ALL ENROLLMENTS
======================================================= */
export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("programId")
      .populate("candidateId", "username email");

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =======================================================
   ADMIN: UPDATE STATUS / PROGRESS
======================================================= */
export const updateEnrollment = async (req, res) => {
  try {
    const { status, progressPercent } = req.body;

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    if (status) enrollment.status = status;
    if (progressPercent !== undefined)
      enrollment.progressPercent = progressPercent;

    await enrollment.save();

    res.json({
      success: true,
      message: "Enrollment updated successfully",
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* =======================================================
   DROP PROGRAM (Candidate)
======================================================= */
export const dropEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      candidateId: req.user.id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    enrollment.status = "DROPPED";
    await enrollment.save();

    res.json({
      success: true,
      message: "Program dropped successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};