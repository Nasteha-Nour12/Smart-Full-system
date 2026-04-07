<<<<<<< HEAD
import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import { getExecutiveOverviewRequest, getOperationalInsightsRequest } from "../../api/insights.api";

const Reports = () => {
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
      <PageTitle title="CEO Reports" subtitle="Executive summaries and operational risks" />
      {loading ? <Loader /> : null}

      {!loading && executive && operations ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Portfolio Mix</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Internships by Status</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {Object.entries(executive.breakdowns.internshipStatuses || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span>{key}</span>
                      <span className="font-semibold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Go To Work by Status</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {Object.entries(executive.breakdowns.goToWorkStatuses || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span>{key}</span>
                      <span className="font-semibold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <h2 className="mt-6 text-lg font-semibold text-slate-900">Recent Activity</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Latest Users</p>
                <div className="mt-3 space-y-3">
                  {executive.recent.users.map((user) => (
                    <div key={user._id} className="text-sm">
                      <p className="font-medium text-slate-900">{user.fullName}</p>
                      <p className="text-slate-500">{user.role} - {user.status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Latest Companies</p>
                <div className="mt-3 space-y-3">
                  {executive.recent.companies.map((company) => (
                    <div key={company._id} className="text-sm">
                      <p className="font-medium text-slate-900">{company.name}</p>
                      <p className="text-slate-500">{company.industry} - {company.status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Latest Internships</p>
                <div className="mt-3 space-y-3">
                  {executive.recent.internships.map((item) => (
                    <div key={item._id} className="text-sm">
                      <p className="font-medium text-slate-900">{item.position}</p>
                      <p className="text-slate-500">{item.companyId?.name || "-"} - {item.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Risk Watch</h2>
            <div className="mt-4 space-y-3">
              {operations.alerts
                .filter((item) => item.count > 0)
                .map((item) => (
                  <div key={item.key} className="rounded-lg bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">Severity: {item.severity}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{item.count}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Reports;
=======
import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import { getExecutiveOverviewRequest, getOperationalInsightsRequest } from "../../api/insights.api";
import { formatDate } from "../../utils/formatters";

const Reports = () => {
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
      <PageTitle title="CEO Reports" subtitle="Executive summaries and operational risks" />
      {loading ? <Loader /> : null}

      {!loading && executive && operations ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Executive KPIs</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total Profiles</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{executive.totals.candidateProfiles || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Registered Today</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{executive.totals.candidateProfilesToday || 0}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pending Approvals</p>
                <p className="mt-1 text-2xl font-bold text-amber-700">{executive.totals.pendingApprovals || 0}</p>
              </div>
            </div>

            <h2 className="mt-6 text-lg font-semibold text-slate-900">7-Day Registration Trend</h2>
            <div className="mt-4 grid gap-2">
              {(executive.trends?.registrationsLast7Days?.labels || []).map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">{formatDate(label)}</span>
                  <span className="font-semibold text-slate-900">
                    {executive.trends?.registrationsLast7Days?.values?.[index] || 0}
                  </span>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-slate-900">Portfolio Mix</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Internships by Status</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {Object.entries(executive.breakdowns.internshipStatuses || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span>{key}</span>
                      <span className="font-semibold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Go To Work by Status</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {Object.entries(executive.breakdowns.goToWorkStatuses || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span>{key}</span>
                      <span className="font-semibold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <h2 className="mt-6 text-lg font-semibold text-slate-900">Recent Activity</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Latest Users</p>
                <div className="mt-3 space-y-3">
                  {executive.recent.users.map((user) => (
                    <div key={user._id} className="text-sm">
                      <p className="font-medium text-slate-900">{user.fullName}</p>
                      <p className="text-slate-500">{user.role} - {user.status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Latest Companies</p>
                <div className="mt-3 space-y-3">
                  {executive.recent.companies.map((company) => (
                    <div key={company._id} className="text-sm">
                      <p className="font-medium text-slate-900">{company.name}</p>
                      <p className="text-slate-500">{company.industry} - {company.status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">Latest Internships</p>
                <div className="mt-3 space-y-3">
                  {executive.recent.internships.map((item) => (
                    <div key={item._id} className="text-sm">
                      <p className="font-medium text-slate-900">{item.position}</p>
                      <p className="text-slate-500">{item.companyId?.name || "-"} - {item.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Risk Watch</h2>
            <div className="mt-4 space-y-3">
              {operations.alerts
                .filter((item) => item.count > 0)
                .map((item) => (
                  <div key={item.key} className="rounded-lg bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">Severity: {item.severity}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{item.count}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Reports;
>>>>>>> 9129225 (Start real project changes)
