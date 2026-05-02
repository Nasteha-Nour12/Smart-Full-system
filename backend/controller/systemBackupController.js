import Company from "../model/Company.js";
import CandidateProfile from "../model/candidateProfile.js";
import GoToWork from "../model/GoToWork.js";
import HospitalityProgram from "../model/HospitalityProgram.js";
import Internship from "../model/Internship.js";
import RoleConfig from "../model/RoleConfig.js";
import TrainingProgram from "../model/TrainingProgram.js";
import User from "../model/User.js";

const backupModels = {
  users: User,
  companies: Company,
  candidateProfiles: CandidateProfile,
  trainingPrograms: TrainingProgram,
  hospitalityPrograms: HospitalityProgram,
  internships: Internship,
  goToWork: GoToWork,
  roleConfigs: RoleConfig,
};

export const downloadSystemBackup = async (_req, res) => {
  try {
    const entries = await Promise.all(
      Object.entries(backupModels).map(async ([key, Model]) => {
        const data = await Model.find().lean();
        return [key, data];
      })
    );

    const collections = Object.fromEntries(entries);
    const payload = {
      app: "smart-full-system",
      version: 1,
      exportedAt: new Date().toISOString(),
      collections,
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="system-backup-${stamp}.json"`);
    return res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error("downloadSystemBackup error:", error);
    return res.status(500).json({ message: "Failed to generate backup file" });
  }
};

export const restoreSystemBackup = async (req, res) => {
  try {
    const body = req.body || {};
    const collections = body.collections;

    if (!collections || typeof collections !== "object" || Array.isArray(collections)) {
      return res.status(400).json({ message: "Invalid backup format: collections object is required" });
    }

    for (const [key, Model] of Object.entries(backupModels)) {
      const docs = collections[key];
      if (!Array.isArray(docs)) {
        continue;
      }

      await Model.deleteMany({});
      if (docs.length > 0) {
        await Model.insertMany(docs, { ordered: false });
      }
    }

    return res.status(200).json({
      message: "System data restored successfully",
      restoredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("restoreSystemBackup error:", error);
    return res.status(500).json({ message: "Failed to restore backup file" });
  }
};
