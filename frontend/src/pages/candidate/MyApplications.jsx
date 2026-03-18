import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import {
  getMyApplicationsRequest,
  withdrawMyApplicationRequest,
} from "../../api/applications.api";
import { formatDateTime, getErrorMessage } from "../../utils/formatters";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyApplicationsRequest();
      setApplications(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load applications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleWithdraw = async (id) => {
    try {
      await withdrawMyApplicationRequest(id);
      await loadApplications();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to withdraw application"));
    }
  };

  return (
    <div>
      <PageTitle title="My Applications" subtitle="Monitor your application progress" />
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {applications.map((application) => (
          <div key={application._id} className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">{application.opportunityId?.title || "-"}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {application.opportunityId?.companyId?.name || "-"} • {application.opportunityId?.companyId?.location || "-"}
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Status: {application.status}</p>
              <p>Interview: {formatDateTime(application.interviewDate)}</p>
              <p>Submitted: {formatDateTime(application.createdAt)}</p>
            </div>
            {application.status === "SUBMITTED" ? (
              <Button
                variant="danger"
                className="mt-4"
                onClick={() => handleWithdraw(application._id)}
              >
                Withdraw
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {!loading && applications.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          You have not applied yet
        </div>
      ) : null}
    </div>
  );
};

export default MyApplications;
