import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import Loader from "../../components/ui/Loader";
import { getExecutiveOverviewRequest } from "../../api/insights.api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await getExecutiveOverviewRequest();
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <PageTitle title="CEO Dashboard" subtitle="Executive overview of growth, approvals, and program pipeline" />
      {loading ? <Loader /> : null}

      {!loading && data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Users" value={data.totals.users} />
            <StatCard label="Companies" value={data.totals.companies} />
            <StatCard label="Programs" value={data.totals.programs} />
            <StatCard label="Opportunities" value={data.totals.opportunities} />
            <StatCard label="Pending Approvals" value={data.totals.pendingApprovals} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-slate-900">Business Flow</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Applications</p>
                  <div className="mt-3 space-y-2">
                    {Object.entries(data.breakdowns.applicationStatuses || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span>{key}</span>
                        <span className="font-semibold text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">Go To Work</p>
                  <div className="mt-3 space-y-2">
                    {Object.entries(data.breakdowns.goToWorkStatuses || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span>{key}</span>
                        <span className="font-semibold text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-slate-900">Approval Queue</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Pending Users</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {data.breakdowns.userStatuses?.PENDING || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Pending Companies</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {data.breakdowns.companyStatuses?.PENDING || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Open Programs</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {data.breakdowns.programStatuses?.OPEN || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
