import TrainingProgram from "../model/TrainingProgram.js";
import CandidateProfile from "../model/candidateProfile.js";

export const hasCompletedMandatoryTraining = async (candidateId) => {
  const mandatoryTraining = await TrainingProgram.findOne({
    candidateId,
    trainingType: "MANDATORY_3_DAY",
    trainingStatus: "COMPLETED",
  }).lean();

  if (mandatoryTraining) return true;

  const profile = await CandidateProfile.findOne({ userId: candidateId }).lean();
  return profile?.mandatoryTrainingStatus === "COMPLETED";
};

export const markCandidateNotEligible = async (candidateId, reason = "NOT_ELIGIBLE") => {
  await CandidateProfile.findOneAndUpdate(
    { userId: candidateId },
    { candidateStatus: reason },
    { new: true }
  );
};

