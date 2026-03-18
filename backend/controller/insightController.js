import Application from "../model/Application.js";
import Certificate from "../model/Certificate.js";
import Company from "../model/Company.js";
import Enrollment from "../model/Enrollment.js";
import GoToWork from "../model/GoToWork.js";
import Internship from "../model/Internship.js";
import Opportunity from "../model/Opportunity.js";
import Program from "../model/Program.js";
import User from "../model/User.js";

const toMap = (items, keyField = "_id", valueField = "count") =>
  items.reduce((acc, item) => {
    acc[item[keyField]] = item[valueField];
    return acc;
  }, {});

export const getExecutiveOverview = async (_req, res) => {
  try {
    const [
      totalUsers,
      totalCompanies,
      totalPrograms,
      totalOpportunities,
      totalApplications,
      totalEnrollments,
      totalInternships,
      totalCertificates,
      totalGoToWork,
      userStatuses,
      companyStatuses,
      programStatuses,
      opportunityStatuses,
      applicationStatuses,
      internshipStatuses,
      goToWorkStatuses,
      programTypes,
      opportunityTypes,
      recentUsers,
      recentCompanies,
      recentOpportunities,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      Program.countDocuments(),
      Opportunity.countDocuments(),
      Application.countDocuments(),
      Enrollment.countDocuments(),
      Internship.countDocuments(),
      Certificate.countDocuments(),
      GoToWork.countDocuments(),
      User.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Company.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Program.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Opportunity.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Internship.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      GoToWork.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Program.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      Opportunity.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select("fullName role status createdAt"),
      Company.find().sort({ createdAt: -1 }).limit(5).select("name status industry createdAt"),
      Opportunity.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title status type deadline createdAt")
        .populate("companyId", "name"),
    ]);

    const pendingApprovals =
      (toMap(userStatuses).PENDING || 0) + (toMap(companyStatuses).PENDING || 0);

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          companies: totalCompanies,
          programs: totalPrograms,
          opportunities: totalOpportunities,
          applications: totalApplications,
          enrollments: totalEnrollments,
          internships: totalInternships,
          certificates: totalCertificates,
          goToWork: totalGoToWork,
          pendingApprovals,
        },
        breakdowns: {
          userStatuses: toMap(userStatuses),
          companyStatuses: toMap(companyStatuses),
          programStatuses: toMap(programStatuses),
          opportunityStatuses: toMap(opportunityStatuses),
          applicationStatuses: toMap(applicationStatuses),
          internshipStatuses: toMap(internshipStatuses),
          goToWorkStatuses: toMap(goToWorkStatuses),
          programTypes: toMap(programTypes),
          opportunityTypes: toMap(opportunityTypes),
        },
        recent: {
          users: recentUsers,
          companies: recentCompanies,
          opportunities: recentOpportunities,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOperationalInsights = async (_req, res) => {
  try {
    const now = new Date();

    const [
      pendingUsers,
      bannedUsers,
      companiesPendingReview,
      draftPrograms,
      closedPrograms,
      draftOpportunities,
      overduePublishedOpportunities,
      applicationsWithoutInterview,
      activeInternshipsWithoutEvaluation,
      goToWorkWithoutMatch,
      goToWorkInterviewScheduled,
      certificatesMissingUrl,
      recentErrorsProxy,
    ] = await Promise.all([
      User.countDocuments({ status: "PENDING" }),
      User.countDocuments({ status: "BANNED" }),
      Company.countDocuments({ status: "PENDING" }),
      Program.countDocuments({ status: "DRAFT" }),
      Program.countDocuments({ status: "CLOSED" }),
      Opportunity.countDocuments({ status: "DRAFT" }),
      Opportunity.countDocuments({ status: "PUBLISHED", deadline: { $lt: now } }),
      Application.countDocuments({ status: "INTERVIEW", interviewDate: null }),
      Internship.countDocuments({ status: "ACTIVE", evaluationScore: null }),
      GoToWork.countDocuments({ status: { $in: ["MATCHING", "INTERVIEW", "CONTRACT"] }, matchedCompanyId: null }),
      GoToWork.countDocuments({ interviewDate: { $ne: null } }),
      Certificate.countDocuments({ $or: [{ certificateUrl: "" }, { certificateUrl: null }] }),
      Opportunity.find({ status: "PUBLISHED", deadline: { $lt: now } })
        .limit(5)
        .select("title deadline status")
        .populate("companyId", "name"),
    ]);

    const alerts = [
      { key: "pendingUsers", label: "Users waiting for approval", count: pendingUsers, severity: pendingUsers > 0 ? "medium" : "low" },
      { key: "companiesPendingReview", label: "Companies waiting review", count: companiesPendingReview, severity: companiesPendingReview > 0 ? "medium" : "low" },
      { key: "draftPrograms", label: "Programs still in draft", count: draftPrograms, severity: draftPrograms > 2 ? "medium" : "low" },
      { key: "draftOpportunities", label: "Opportunities still in draft", count: draftOpportunities, severity: draftOpportunities > 2 ? "medium" : "low" },
      { key: "overduePublishedOpportunities", label: "Published opportunities past deadline", count: overduePublishedOpportunities, severity: overduePublishedOpportunities > 0 ? "high" : "low" },
      { key: "applicationsWithoutInterview", label: "Interview-stage apps without interview date", count: applicationsWithoutInterview, severity: applicationsWithoutInterview > 0 ? "high" : "low" },
      { key: "activeInternshipsWithoutEvaluation", label: "Active internships missing evaluation", count: activeInternshipsWithoutEvaluation, severity: activeInternshipsWithoutEvaluation > 0 ? "medium" : "low" },
      { key: "goToWorkWithoutMatch", label: "Go To Work cases with no matched company", count: goToWorkWithoutMatch, severity: goToWorkWithoutMatch > 0 ? "medium" : "low" },
      { key: "bannedUsers", label: "Banned user accounts", count: bannedUsers, severity: bannedUsers > 0 ? "low" : "low" },
      { key: "closedPrograms", label: "Closed programs", count: closedPrograms, severity: "low" },
      { key: "goToWorkInterviewScheduled", label: "Go To Work interviews scheduled", count: goToWorkInterviewScheduled, severity: "low" },
      { key: "certificatesMissingUrl", label: "Certificates missing URL", count: certificatesMissingUrl, severity: certificatesMissingUrl > 0 ? "high" : "low" },
    ];

    res.json({
      success: true,
      data: {
        alerts,
        recentIssues: {
          overduePublishedOpportunities: recentErrorsProxy,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
