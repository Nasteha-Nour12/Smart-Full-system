import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getOperationalInsightsRequest } from "../../api/insights.api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await getOperationalInsightsRequest();
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const findCount = (key) => data?.alerts?.find((item) => item.key === key)?.count || 0;

  return (
    <div>
      <PageTitle title="ICT Officer Dashboard" subtitle="Monitor workflow blockers, data quality, and platform readiness" />
      {loading ? <Loader /> : null}

      {!loading && data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Pending Users" value={findCount("pendingUsers")} />
            <StatCard label="Pending Companies" value={findCount("companiesPendingReview")} />
            <StatCard label="Overdue Opportunities" value={findCount("overduePublishedOpportunities")} />
            <StatCard label="Unmatched GTW Cases" value={findCount("goToWorkWithoutMatch")} />
          </div>

          <div className="mt-6 rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Priority Queue</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.alerts
                .filter((item) => item.count > 0)
                .map((item) => (
                  <div key={item.key} className="rounded-lg border border-slate-200 p-4">
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{item.count}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                      {item.severity} priority
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
