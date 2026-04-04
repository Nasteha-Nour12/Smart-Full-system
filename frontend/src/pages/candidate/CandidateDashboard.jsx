import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getMyInternshipsRequest } from "../../api/internships.api";
import { getMyGoToWorkRequest } from "../../api/goToWork.api";
import { getMyTrainingProgramsRequest } from "../../api/trainingPrograms.api";

const CandidateDashboard = () => {
  const [stats, setStats] = useState({
    trainings: 0,
    internships: 0,
    goToWorkStatus: "No request",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [internships, trainings] = await Promise.all([
          getMyInternshipsRequest(),
          getMyTrainingProgramsRequest(),
        ]);

        let goToWorkStatus = "No request";
        try {
          const goToWork = await getMyGoToWorkRequest();
          goToWorkStatus = goToWork.data?.status || "Submitted";
        } catch {
          goToWorkStatus = "No request";
        }

        setStats({
          trainings: trainings.data?.length || 0,
          internships: internships.data?.length || 0,
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
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
          <StatCard label="Training Programs" value={stats.trainings} />
          <StatCard label="Internships" value={stats.internships} />
          <StatCard label="Go To Work" value={stats.goToWorkStatus} />
        </div>
      ) : null}
    </div>
  );
};

export default CandidateDashboard;
