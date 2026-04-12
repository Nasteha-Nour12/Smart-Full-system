export const SELECTED_PROGRAM = {
  VISITOR: "VISITOR",
  CANDIDATE: "CANDIDATE",
  INTERNSHIP: "INTERNSHIP",
  HOSPITALITY: "HOSPITALITY",
  GO_TO_WORK: "GO_TO_WORK",
};

export const HOSPITALITY_TYPE = {
  NO_SKILL: "NO_SKILL",
  HAVE_SKILL_NO_EXPERIENCE: "HAVE_SKILL_NO_EXPERIENCE",
  HAVE_SKILL_AND_EXPERIENCE: "HAVE_SKILL_AND_EXPERIENCE",
};

export const TRAINING_STATUS = {
  PENDING: "PENDING",
  SCHEDULED: "SCHEDULED",
  ATTENDING: "ATTENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  ABSENT: "ABSENT",
};

export const applyCandidateProgramLogic = (payload) => {
  const next = { ...payload };
  const selectedProgram = String(payload.selectedProgram || "").toUpperCase();
  const hospitalityType = String(payload.hospitalityType || "").toUpperCase();
  const mandatoryTrainingStatus = String(
    payload.mandatoryTrainingStatus || payload.trainingStatus || TRAINING_STATUS.PENDING
  ).toUpperCase();

  next.selectedProgram = selectedProgram || SELECTED_PROGRAM.VISITOR;
  next.hospitalityType = hospitalityType || "";
  next.mandatoryTrainingStatus = mandatoryTrainingStatus;
  next.trainingStatus = mandatoryTrainingStatus;

  if (next.selectedProgram === SELECTED_PROGRAM.HOSPITALITY) {
    if (next.hospitalityType === HOSPITALITY_TYPE.NO_SKILL) {
      next.assignedProgram = "HOSPITALITY_TRAINING_2_MONTHS";
      if (payload.trainingFee === undefined || payload.trainingFee === null || payload.trainingFee === "") {
        next.trainingFee = 60;
      }
      if (payload.programFee === undefined || payload.programFee === null || payload.programFee === "") {
        next.programFee = 60;
      }
      next.candidateStatus = "PENDING_TRAINING";
      return next;
    }

    if (next.hospitalityType === HOSPITALITY_TYPE.HAVE_SKILL_NO_EXPERIENCE) {
      next.assignedProgram = SELECTED_PROGRAM.INTERNSHIP;
    } else if (next.hospitalityType === HOSPITALITY_TYPE.HAVE_SKILL_AND_EXPERIENCE) {
      next.assignedProgram = SELECTED_PROGRAM.GO_TO_WORK;
    } else {
      next.assignedProgram = SELECTED_PROGRAM.INTERNSHIP;
    }
  } else if (next.selectedProgram === SELECTED_PROGRAM.INTERNSHIP) {
    next.assignedProgram = SELECTED_PROGRAM.INTERNSHIP;
  } else if (next.selectedProgram === SELECTED_PROGRAM.GO_TO_WORK) {
    next.assignedProgram = SELECTED_PROGRAM.GO_TO_WORK;
  }

  if (
    next.assignedProgram === SELECTED_PROGRAM.INTERNSHIP ||
    next.assignedProgram === SELECTED_PROGRAM.GO_TO_WORK
  ) {
    if (payload.trainingFee === undefined || payload.trainingFee === null || payload.trainingFee === "") {
      next.trainingFee = 10;
    }
    if (next.mandatoryTrainingStatus !== TRAINING_STATUS.COMPLETED) {
      next.candidateStatus = payload.candidateStatus || "NOT_ELIGIBLE";
    } else {
      next.candidateStatus = payload.candidateStatus || "ACTIVE";
    }
  }

  return next;
};

