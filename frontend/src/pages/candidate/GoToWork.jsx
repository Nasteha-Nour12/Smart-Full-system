import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { getMyGoToWorkRequest, submitGoToWorkRequest } from "../../api/goToWork.api";
import { formatDateTime, getErrorMessage } from "../../utils/formatters";

const GoToWork = () => {
  const [request, setRequest] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyGoToWorkRequest();
      setRequest(res.data || null);
      setNotes(res.data?.notes || "");
    } catch (err) {
      if (err?.response?.status === 404) {
        setRequest(null);
      } else {
        setError(getErrorMessage(err, "Failed to load Go To Work request"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, []);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await submitGoToWorkRequest({ notes });
      await loadRequest();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to submit request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Go To Work" subtitle="Request support for job placement" />
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading && request ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-500">Current Status</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">{request.status}</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Matched Company: {request.matchedCompanyId?.name || "-"}</p>
            <p>Interview: {formatDateTime(request.interviewDate)}</p>
            <p>Contract: {request.contractUrl || "-"}</p>
            <p>Notes: {request.notes || "-"}</p>
          </div>
        </div>
      ) : null}

      {!loading && !request ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">
            Submit one request and the admin team will help match you with a company.
          </p>
          <label className="mt-4 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            rows="5"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Tell us your goals, preferred role, or anything helpful"
          />
          <Button className="mt-4" onClick={handleSubmit} loading={saving}>
            Submit Go To Work Request
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default GoToWork;
