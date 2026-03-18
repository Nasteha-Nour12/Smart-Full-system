import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import { getOpportunitiesRequest } from "../../api/opportunities.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getOpportunitiesRequest();
        setOpportunities(res.data || []);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load opportunities"));
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  return (
    <div>
      <PageTitle
        title="Opportunities"
        subtitle="Browse published opportunities. Backend create/update permissions are currently restricted to admin."
      />

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {opportunities.map((opportunity) => (
          <div key={opportunity._id} className="rounded-xl bg-white p-5 shadow">
            <p className="text-xs uppercase tracking-wide text-slate-500">{opportunity.type}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{opportunity.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{opportunity.description || "No description"}</p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Company: {opportunity.companyId?.name || "-"}</p>
              <p>Location: {opportunity.location || "-"}</p>
              <p>Deadline: {formatDate(opportunity.deadline)}</p>
              <p>Status: {opportunity.status}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && opportunities.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          No opportunities found
        </div>
      ) : null}
    </div>
  );
};

export default Opportunities;
