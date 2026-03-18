import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getApplicationsRequest } from "../../api/applications.api";
import { getCertificatesRequest } from "../../api/certificates.api";
import { getCompaniesRequest } from "../../api/companies.api";
import { getEnrollmentsRequest } from "../../api/enrollments.api";
import { getGoToWorkRequests } from "../../api/goToWork.api";
import { getInternshipsRequest } from "../../api/internships.api";
import { getOpportunitiesRequest } from "../../api/opportunities.api";
import { getProgramsRequest } from "../../api/programs.api";
import { getUsersRequest } from "../../api/user.api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    programs: 0,
    opportunities: 0,
    applications: 0,
    enrollments: 0,
    internships: 0,
    certificates: 0,
    goToWork: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [users, companies, programs, opportunities, applications, enrollments, internships, certificates, goToWork] =
          await Promise.all([
            getUsersRequest(),
            getCompaniesRequest(),
            getProgramsRequest(),
            getOpportunitiesRequest(),
            getApplicationsRequest(),
            getEnrollmentsRequest(),
            getInternshipsRequest(),
            getCertificatesRequest(),
            getGoToWorkRequests(),
          ]);

        setStats({
          users: users.data?.length || 0,
          companies: companies.data?.length || 0,
          programs: programs.data?.length || 0,
          opportunities: opportunities.data?.length || 0,
          applications: applications.data?.length || 0,
          enrollments: enrollments.data?.length || 0,
          internships: internships.data?.length || 0,
          certificates: certificates.data?.length || 0,
          goToWork: goToWork.data?.length || 0,
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Users" value={stats.users} />
          <StatCard label="Companies" value={stats.companies} />
          <StatCard label="Programs" value={stats.programs} />
          <StatCard label="Opportunities" value={stats.opportunities} />
          <StatCard label="Applications" value={stats.applications} />
          <StatCard label="Enrollments" value={stats.enrollments} />
          <StatCard label="Internships" value={stats.internships} />
          <StatCard label="Certificates" value={stats.certificates} />
          <StatCard label="Go To Work Requests" value={stats.goToWork} />
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
