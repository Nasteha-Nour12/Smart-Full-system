import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getMyApplicationsRequest } from "../../api/applications.api";
import { getMyCertificatesRequest } from "../../api/certificates.api";
import { getMyEnrollmentsRequest } from "../../api/enrollments.api";
import { getMyInternshipsRequest } from "../../api/internships.api";
import { getMyGoToWorkRequest } from "../../api/goToWork.api";

const CandidateDashboard = () => {
  const [stats, setStats] = useState({
    enrollments: 0,
    applications: 0,
    internships: 0,
    certificates: 0,
    goToWorkStatus: "No request",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [enrollments, applications, internships, certificates] = await Promise.all([
          getMyEnrollmentsRequest(),
          getMyApplicationsRequest(),
          getMyInternshipsRequest(),
          getMyCertificatesRequest(),
        ]);

        let goToWorkStatus = "No request";
        try {
          const goToWork = await getMyGoToWorkRequest();
          goToWorkStatus = goToWork.data?.status || "Submitted";
        } catch {
          goToWorkStatus = "No request";
        }

        setStats({
          enrollments: enrollments.data?.length || 0,
          applications: applications.data?.length || 0,
          internships: internships.data?.length || 0,
          certificates: certificates.data?.length || 0,
          goToWorkStatus,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <PageTitle title="Candidate Dashboard" subtitle="A quick snapshot of your progress" />
      {loading ? <Loader /> : null}
      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Enrollments" value={stats.enrollments} />
          <StatCard label="Applications" value={stats.applications} />
          <StatCard label="Internships" value={stats.internships} />
          <StatCard label="Certificates" value={stats.certificates} />
          <StatCard label="Go To Work" value={stats.goToWorkStatus} />
        </div>
      ) : null}
    </div>
  );
};

export default CandidateDashboard;
