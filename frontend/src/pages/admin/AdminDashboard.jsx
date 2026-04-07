<<<<<<< HEAD
import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getAllCandidateProfilesRequest } from "../../api/candidateProfiles.api";
import { getCompaniesRequest } from "../../api/companies.api";
import { getGoToWorkRequests } from "../../api/goToWork.api";
import { getInternshipsRequest } from "../../api/internships.api";
import { getUsersRequest } from "../../api/user.api";
import { getTrainingProgramsRequest } from "../../api/trainingPrograms.api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    candidateProfiles: 0,
    internships: 0,
    goToWork: 0,
    trainingPrograms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [users, companies, candidateProfiles, internships, goToWork, trainingPrograms] =
          await Promise.all([
            getUsersRequest(),
            getCompaniesRequest(),
            getAllCandidateProfilesRequest(),
            getInternshipsRequest(),
            getGoToWorkRequests(),
            getTrainingProgramsRequest(),
          ]);

        setStats({
          users: users.data?.length || 0,
          companies: companies.data?.length || 0,
          candidateProfiles: candidateProfiles.data?.length || 0,
          internships: internships.data?.length || 0,
          goToWork: goToWork.data?.length || 0,
          trainingPrograms: trainingPrograms.data?.length || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <PageTitle title="Admin Dashboard" subtitle="Platform-wide summary across all modules" />
      {loading ? <Loader /> : null}
      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Users" value={stats.users} />
          <StatCard label="Companies" value={stats.companies} />
          <StatCard label="Candidate Profiles" value={stats.candidateProfiles} />
          <StatCard label="Training Programs" value={stats.trainingPrograms} />
          <StatCard label="Internships" value={stats.internships} />
          <StatCard label="Go To Work Requests" value={stats.goToWork} />
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
=======
import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getAllCandidateProfilesRequest } from "../../api/candidateProfiles.api";
import { getCompaniesRequest } from "../../api/companies.api";
import { getGoToWorkRequests } from "../../api/goToWork.api";
import { getInternshipsRequest } from "../../api/internships.api";
import { getUsersRequest } from "../../api/user.api";
import { getTrainingProgramsRequest } from "../../api/trainingPrograms.api";
import { getTodayRegistrationsRequest } from "../../api/insights.api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    candidateProfiles: 0,
    internships: 0,
    goToWork: 0,
    trainingPrograms: 0,
    candidateProfilesToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [users, companies, candidateProfiles, internships, goToWork, trainingPrograms, todayRegs] =
          await Promise.all([
            getUsersRequest(),
            getCompaniesRequest(),
            getAllCandidateProfilesRequest(),
            getInternshipsRequest(),
            getGoToWorkRequests(),
            getTrainingProgramsRequest(),
            getTodayRegistrationsRequest(),
          ]);

        setStats({
          users: users.data?.length || 0,
          companies: companies.data?.length || 0,
          candidateProfiles: candidateProfiles.data?.length || 0,
          internships: internships.data?.length || 0,
          goToWork: goToWork.data?.length || 0,
          trainingPrograms: trainingPrograms.data?.length || 0,
          candidateProfilesToday: todayRegs.data?.candidateProfilesToday || 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <PageTitle title="Admin Dashboard" subtitle="Platform-wide summary across all modules" />
      {loading ? <Loader /> : null}
      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <StatCard label="Users" value={stats.users} />
          <StatCard label="Companies" value={stats.companies} />
          <StatCard label="Candidate Profiles" value={stats.candidateProfiles} />
          <StatCard label="Registered Today" value={stats.candidateProfilesToday} />
          <StatCard label="Training Programs" value={stats.trainingPrograms} />
          <StatCard label="Internships" value={stats.internships} />
          <StatCard label="Go To Work Requests" value={stats.goToWork} />
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
>>>>>>> 9129225 (Start real project changes)
