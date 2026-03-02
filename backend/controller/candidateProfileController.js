import CandidateProfile from "../model/candidateProfile.js";

/* =======================================================
   GET MY PROFILE (logged-in candidate)
======================================================= */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user.id }).populate(
      "userId",
      "username email role"
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
    const payload = { ...req.body, userId: req.user.id };

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: req.user.id },
      payload,
      { new: true, upsert: true, runValidators: true }
    );

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
    const profile = await CandidateProfile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

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
    const { name, level } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Skill name is required" });
    }

    const profile = await CandidateProfile.findOne({ userId: req.user.id });
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
    const { skillId } = req.params;

    const profile = await CandidateProfile.findOne({ userId: req.user.id });
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
    const profiles = await CandidateProfile.find()
      .populate("userId", "username email role")
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
    const profile = await CandidateProfile.findOne({ userId: req.params.userId }).populate(
      "userId",
      "username email role"
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
    const deleted = await CandidateProfile.findOneAndDelete({ userId: req.params.userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};