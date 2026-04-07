<<<<<<< HEAD
import CandidateProfile from "../model/candidateProfile.js";
import Company from "../model/Company.js";
import GoToWork from "../model/GoToWork.js";
import Internship from "../model/Internship.js";
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
      totalCandidateProfiles,
      totalInternships,
      totalGoToWork,
      userStatuses,
      companyStatuses,
      internshipStatuses,
      goToWorkStatuses,
      recentUsers,
      recentCompanies,
      recentInternships,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      CandidateProfile.countDocuments(),
      Internship.countDocuments(),
      GoToWork.countDocuments(),
      User.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Company.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Internship.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      GoToWork.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select("fullName role status createdAt"),
      Company.find().sort({ createdAt: -1 }).limit(5).select("name status industry createdAt"),
      Internship.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("position status startDate endDate createdAt")
        .populate("candidateId", "fullName")
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
          candidateProfiles: totalCandidateProfiles,
          internships: totalInternships,
          goToWork: totalGoToWork,
          pendingApprovals,
        },
        breakdowns: {
          userStatuses: toMap(userStatuses),
          companyStatuses: toMap(companyStatuses),
          internshipStatuses: toMap(internshipStatuses),
          goToWorkStatuses: toMap(goToWorkStatuses),
        },
        recent: {
          users: recentUsers,
          companies: recentCompanies,
          internships: recentInternships,
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
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const [
      pendingUsers,
      bannedUsers,
      companiesPendingReview,
      internshipsPending,
      activeInternshipsWithoutEvaluation,
      goToWorkWithoutMatch,
      goToWorkInterviewScheduled,
      candidateProfilesMissingCv,
      recentInternshipsEndingSoon,
    ] = await Promise.all([
      User.countDocuments({ status: "PENDING" }),
      User.countDocuments({ status: "BANNED" }),
      Company.countDocuments({ status: "PENDING" }),
      Internship.countDocuments({ status: "PENDING" }),
      Internship.countDocuments({ status: "ACTIVE", evaluationScore: null }),
      GoToWork.countDocuments({ status: { $in: ["MATCHING", "INTERVIEW", "CONTRACT"] }, matchedCompanyId: null }),
      GoToWork.countDocuments({ interviewDate: { $ne: null } }),
      CandidateProfile.countDocuments({ $or: [{ cvUrl: "" }, { cvUrl: null }] }),
      Internship.find({ endDate: { $gte: now, $lte: next7Days } })
        .limit(5)
        .select("position endDate status")
        .populate("candidateId", "fullName")
        .populate("companyId", "name"),
    ]);

    const alerts = [
      { key: "pendingUsers", label: "Users waiting for approval", count: pendingUsers, severity: pendingUsers > 0 ? "medium" : "low" },
      { key: "companiesPendingReview", label: "Companies waiting review", count: companiesPendingReview, severity: companiesPendingReview > 0 ? "medium" : "low" },
      { key: "internshipsPending", label: "Internships waiting approval", count: internshipsPending, severity: internshipsPending > 0 ? "medium" : "low" },
      { key: "activeInternshipsWithoutEvaluation", label: "Active internships missing evaluation", count: activeInternshipsWithoutEvaluation, severity: activeInternshipsWithoutEvaluation > 0 ? "medium" : "low" },
      { key: "goToWorkWithoutMatch", label: "Go To Work cases with no matched company", count: goToWorkWithoutMatch, severity: goToWorkWithoutMatch > 0 ? "medium" : "low" },
      { key: "bannedUsers", label: "Banned user accounts", count: bannedUsers, severity: bannedUsers > 0 ? "low" : "low" },
      { key: "goToWorkInterviewScheduled", label: "Go To Work interviews scheduled", count: goToWorkInterviewScheduled, severity: "low" },
      { key: "candidateProfilesMissingCv", label: "Candidate profiles missing CV", count: candidateProfilesMissingCv, severity: candidateProfilesMissingCv > 0 ? "high" : "low" },
    ];

    res.json({
      success: true,
      data: {
        alerts,
        recentIssues: {
          internshipsEndingSoon: recentInternshipsEndingSoon,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
=======
import CandidateProfile from "../model/candidateProfile.js";
import Company from "../model/Company.js";
import GoToWork from "../model/GoToWork.js";
import Internship from "../model/Internship.js";
import User from "../model/User.js";
import { sendSms } from "../utils/smsService.js";

const toMap = (items, keyField = "_id", valueField = "count") =>
  items.reduce((acc, item) => {
    acc[item[keyField]] = item[valueField];
    return acc;
  }, {});

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const buildDailyTrend = async (days = 7) => {
  const labels = [];
  const values = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const { start, end } = getDayRange(day);
    const count = await CandidateProfile.countDocuments({ createdAt: { $gte: start, $lt: end } });
    labels.push(start.toISOString().slice(0, 10));
    values.push(count);
  }

  return { labels, values };
};

export const getExecutiveOverview = async (_req, res) => {
  try {
    const { start: todayStart, end: tomorrowStart } = getDayRange();
    const [
      totalUsers,
      totalCompanies,
      totalCandidateProfiles,
      totalInternships,
      totalGoToWork,
      candidateProfilesToday,
      userStatuses,
      companyStatuses,
      internshipStatuses,
      goToWorkStatuses,
      recentUsers,
      recentCompanies,
      recentInternships,
      registrationsTrend,
    ] = await Promise.all([
      User.countDocuments(),
      Company.countDocuments(),
      CandidateProfile.countDocuments(),
      Internship.countDocuments(),
      GoToWork.countDocuments(),
      CandidateProfile.countDocuments({ createdAt: { $gte: todayStart, $lt: tomorrowStart } }),
      User.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Company.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Internship.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      GoToWork.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select("fullName role status createdAt"),
      Company.find().sort({ createdAt: -1 }).limit(5).select("name status industry createdAt"),
      Internship.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("position status startDate endDate createdAt")
        .populate("candidateId", "fullName")
        .populate("companyId", "name"),
      buildDailyTrend(7),
    ]);

    const pendingApprovals =
      (toMap(userStatuses).PENDING || 0) + (toMap(companyStatuses).PENDING || 0);

    res.json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          companies: totalCompanies,
          candidateProfiles: totalCandidateProfiles,
          candidateProfilesToday,
          internships: totalInternships,
          goToWork: totalGoToWork,
          pendingApprovals,
        },
        breakdowns: {
          userStatuses: toMap(userStatuses),
          companyStatuses: toMap(companyStatuses),
          internshipStatuses: toMap(internshipStatuses),
          goToWorkStatuses: toMap(goToWorkStatuses),
        },
        recent: {
          users: recentUsers,
          companies: recentCompanies,
          internships: recentInternships,
        },
        trends: {
          registrationsLast7Days: registrationsTrend,
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
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const [
      pendingUsers,
      bannedUsers,
      companiesPendingReview,
      internshipsPending,
      activeInternshipsWithoutEvaluation,
      goToWorkWithoutMatch,
      goToWorkInterviewScheduled,
      candidateProfilesMissingCv,
      recentInternshipsEndingSoon,
    ] = await Promise.all([
      User.countDocuments({ status: "PENDING" }),
      User.countDocuments({ status: "BANNED" }),
      Company.countDocuments({ status: "PENDING" }),
      Internship.countDocuments({ status: "PENDING" }),
      Internship.countDocuments({ status: "ACTIVE", evaluationScore: null }),
      GoToWork.countDocuments({ status: { $in: ["MATCHING", "INTERVIEW", "CONTRACT"] }, matchedCompanyId: null }),
      GoToWork.countDocuments({ interviewDate: { $ne: null } }),
      CandidateProfile.countDocuments({ $or: [{ cvUrl: "" }, { cvUrl: null }] }),
      Internship.find({ endDate: { $gte: now, $lte: next7Days } })
        .limit(5)
        .select("position endDate status")
        .populate("candidateId", "fullName")
        .populate("companyId", "name"),
    ]);

    const alerts = [
      { key: "pendingUsers", label: "Users waiting for approval", count: pendingUsers, severity: pendingUsers > 0 ? "medium" : "low" },
      { key: "companiesPendingReview", label: "Companies waiting review", count: companiesPendingReview, severity: companiesPendingReview > 0 ? "medium" : "low" },
      { key: "internshipsPending", label: "Internships waiting approval", count: internshipsPending, severity: internshipsPending > 0 ? "medium" : "low" },
      { key: "activeInternshipsWithoutEvaluation", label: "Active internships missing evaluation", count: activeInternshipsWithoutEvaluation, severity: activeInternshipsWithoutEvaluation > 0 ? "medium" : "low" },
      { key: "goToWorkWithoutMatch", label: "Go To Work cases with no matched company", count: goToWorkWithoutMatch, severity: goToWorkWithoutMatch > 0 ? "medium" : "low" },
      { key: "bannedUsers", label: "Banned user accounts", count: bannedUsers, severity: bannedUsers > 0 ? "low" : "low" },
      { key: "goToWorkInterviewScheduled", label: "Go To Work interviews scheduled", count: goToWorkInterviewScheduled, severity: "low" },
      { key: "candidateProfilesMissingCv", label: "Candidate profiles missing CV", count: candidateProfilesMissingCv, severity: candidateProfilesMissingCv > 0 ? "high" : "low" },
    ];

    res.json({
      success: true,
      data: {
        alerts,
        recentIssues: {
          internshipsEndingSoon: recentInternshipsEndingSoon,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTodaysRegistrationStats = async (_req, res) => {
  try {
    const { start, end } = getDayRange();
    const count = await CandidateProfile.countDocuments({ createdAt: { $gte: start, $lt: end } });
    res.json({
      success: true,
      data: {
        date: start.toISOString().slice(0, 10),
        candidateProfilesToday: count,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendTodaysRegistrationSms = async (req, res) => {
  try {
    const { start, end } = getDayRange();
    const count = await CandidateProfile.countDocuments({ createdAt: { $gte: start, $lt: end } });
    const message = `SMART-SES: Today registered candidates = ${count}. Date: ${start.toISOString().slice(0, 10)}.`;
    const smsResult = await sendSms({ message, to: req.body?.to });

    res.json({
      success: true,
      message: smsResult.sent ? "SMS notification sent." : "SMS preview generated (provider not configured).",
      data: {
        date: start.toISOString().slice(0, 10),
        candidateProfilesToday: count,
        sms: smsResult,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
>>>>>>> 9129225 (Start real project changes)
