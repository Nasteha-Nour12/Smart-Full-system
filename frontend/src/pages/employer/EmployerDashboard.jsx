import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getCompaniesRequest } from "../../api/companies.api";
import { getInternshipsRequest } from "../../api/internships.api";
import { getTrainingProgramsRequest } from "../../api/trainingPrograms.api";

const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    companies: 0,
    approvedCompanies: 0,
    internships: 0,
    activeInternships: 0,
    trainingPrograms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [companiesRes, internshipsRes, trainingsRes] = await Promise.all([
          getCompaniesRequest(),
          getInternshipsRequest(),
          getTrainingProgramsRequest(),
        ]);

        const companies = companiesRes.data || [];
        const internships = internshipsRes.data || [];
        const trainings = trainingsRes.data || [];

        setStats({
          companies: companies.length,
          approvedCompanies: companies.filter((company) => company.status === "APPROVED").length,
          internships: internships.length,
          activeInternships: internships.filter((item) => item.status === "ACTIVE").length,
          trainingPrograms: trainings.length,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <PageTitle title="Employer Dashboard" subtitle="Overview of company records and internship pipeline" />
      {loading ? <Loader /> : null}
      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Companies" value={stats.companies} />
          <StatCard label="Approved Companies" value={stats.approvedCompanies} />
          <StatCard label="Training Programs" value={stats.trainingPrograms} />
          <StatCard label="All Internships" value={stats.internships} />
          <StatCard label="Active Internships" value={stats.activeInternships} />
        </div>
      ) : null}
    </div>
  );
};

export default EmployerDashboard;
