import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { applyOpportunityRequest, getMyApplicationsRequest } from "../../api/applications.api";
import { getOpportunitiesRequest } from "../../api/opportunities.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
  const [submittingId, setSubmittingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError("");
      const [opportunitiesRes, applicationsRes] = await Promise.all([
        getOpportunitiesRequest({ status: "PUBLISHED" }),
        getMyApplicationsRequest(),
      ]);
      setOpportunities(opportunitiesRes.data || []);
      setAppliedOpportunityIds(
        (applicationsRes.data || []).map((item) => item.opportunityId?._id).filter(Boolean)
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load opportunities"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleApply = async (opportunityId) => {
    try {
      setSubmittingId(opportunityId);
      await applyOpportunityRequest(opportunityId);
      alert("Application submitted successfully");
      await loadOpportunities();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to apply"));
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div>
      <PageTitle title="Opportunities" subtitle="Apply for published jobs and internships" />
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {opportunities.map((opportunity) => (
          <div key={opportunity._id} className="rounded-xl bg-white p-5 shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">{opportunity.type}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{opportunity.title}</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{opportunity.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{opportunity.description || "No description"}</p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Company: {opportunity.companyId?.name || "-"}</p>
              <p>Location: {opportunity.location || "-"}</p>
              <p>Deadline: {formatDate(opportunity.deadline)}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-700">Requirements</p>
              <p className="text-sm text-slate-600">{opportunity.requirements || "No requirements provided"}</p>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => handleApply(opportunity._id)}
              disabled={appliedOpportunityIds.includes(opportunity._id) || submittingId === opportunity._id}
              loading={submittingId === opportunity._id}
            >
              {appliedOpportunityIds.includes(opportunity._id) ? "Already Applied" : "Apply Now"}
            </Button>
          </div>
        ))}
      </div>

      {!loading && opportunities.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          No published opportunities available
        </div>
      ) : null}
    </div>
  );
};

export default Opportunities;
