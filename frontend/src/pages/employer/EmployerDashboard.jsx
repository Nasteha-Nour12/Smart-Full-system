import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getCompaniesRequest } from "../../api/companies.api";
import { getOpportunitiesRequest } from "../../api/opportunities.api";

const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    companies: 0,
    approvedCompanies: 0,
    opportunities: 0,
    publishedOpportunities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [companiesRes, opportunitiesRes] = await Promise.all([
          getCompaniesRequest(),
          getOpportunitiesRequest(),
        ]);

        const companies = companiesRes.data || [];
        const opportunities = opportunitiesRes.data || [];

        setStats({
          companies: companies.length,
          approvedCompanies: companies.filter((company) => company.status === "APPROVED").length,
          opportunities: opportunities.length,
          publishedOpportunities: opportunities.filter((item) => item.status === "PUBLISHED").length,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      <PageTitle title="Employer Dashboard" subtitle="Overview of company records and market opportunities" />
      {loading ? <Loader /> : null}
      {!loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Companies" value={stats.companies} />
          <StatCard label="Approved Companies" value={stats.approvedCompanies} />
          <StatCard label="All Opportunities" value={stats.opportunities} />
          <StatCard label="Published Opportunities" value={stats.publishedOpportunities} />
        </div>
      ) : null}
    </div>
  );
};

export default EmployerDashboard;
