import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import { getExecutiveOverviewRequest, getOperationalInsightsRequest } from "../../api/insights.api";

const Operations = () => {
  const [executive, setExecutive] = useState(null);
  const [operations, setOperations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [executiveRes, operationsRes] = await Promise.all([
          getExecutiveOverviewRequest(),
          getOperationalInsightsRequest(),
        ]);
        setExecutive(executiveRes.data);
        setOperations(operationsRes.data);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      <PageTitle title="ICT Operations" subtitle="Data quality, workflow blockers, and records needing attention" />
      {loading ? <Loader /> : null}

      {!loading && executive && operations ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Operational Alerts</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {operations.alerts.map((item) => (
                <div key={item.key} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{item.count}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                    Severity: {item.severity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">System Snapshot</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span>Pending approvals</span>
                <span className="font-semibold text-slate-900">{executive.totals.pendingApprovals}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span>Total users</span>
                <span className="font-semibold text-slate-900">{executive.totals.users}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span>Total companies</span>
                <span className="font-semibold text-slate-900">{executive.totals.companies}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span>Total internships</span>
                <span className="font-semibold text-slate-900">{executive.totals.internships}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span>Total Go To Work cases</span>
                <span className="font-semibold text-slate-900">{executive.totals.goToWork}</span>
              </div>
            </div>

            <h3 className="mt-6 text-base font-semibold text-slate-900">Internships Ending Soon</h3>
            <div className="mt-3 space-y-3">
              {operations.recentIssues.internshipsEndingSoon.map((item) => (
                <div key={item._id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-900">{item.position}</p>
                  <p className="text-slate-500">{item.companyId?.name || "-"} - {new Date(item.endDate).toLocaleDateString()}</p>
                </div>
              ))}
              {operations.recentIssues.internshipsEndingSoon.length === 0 ? (
                <p className="text-sm text-slate-500">No internships ending soon.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Operations;