import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOpportunitiesRequest } from "../../api/opportunities.api";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const res = await getOpportunitiesRequest({ status: "PUBLISHED" });
        setOpportunities(res.data || []);
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          setRequiresLogin(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <PublicTopbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-[2rem] bg-slate-900 px-8 py-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Opportunities</p>
          <h1 className="mt-3 text-4xl font-black">Jobs and internships from active companies</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Browse the kind of opportunities available on the platform and create an account to apply, track interviews, and manage progress.
          </p>
        </div>

        {loading ? <p className="mt-10 text-slate-500">Loading opportunities...</p> : null}

        {requiresLogin ? (
          <GateCard
            title="Login is required to view the full opportunity list"
            text="Si aad u aragto details-ka oo dhan iyo inaad apply gareyso, waxaad u baahan tahay account job seeker ah."
          />
        ) : null}

        {!loading && !requiresLogin ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {opportunities.map((opportunity) => (
              <div key={opportunity._id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{opportunity.type}</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{opportunity.title}</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {opportunity.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{opportunity.description || "No description"}</p>
                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <p>Company: {opportunity.companyId?.name || "-"}</p>
                  <p>Location: {opportunity.location || "-"}</p>
                  <p>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link
                    to="/Register"
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Register to Apply
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Login
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
};

const PublicTopbar = () => (
  <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link to="/" className="text-xl font-bold text-slate-900">
        Smart Employment System
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/programs" className="text-sm font-medium text-slate-600">
          Programs
        </Link>
        <Link to="/login" className="text-sm font-medium text-slate-600">
          Login
        </Link>
      </div>
    </div>
  </header>
);

const GateCard = ({ title, text }) => (
  <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    <p className="mt-3 max-w-2xl text-slate-600">{text}</p>
    <div className="mt-6 flex gap-3">
      <Link to="/login" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold">
        Login
      </Link>
      <Link to="/Register" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
        Register
      </Link>
    </div>
  </div>
);

export default Opportunities;
