import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import { getApplicationsRequest } from "../../api/applications.api";
import { getErrorMessage } from "../../utils/formatters";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getApplicationsRequest();
        setApplications(res.data || []);
      } catch (err) {
        if (err?.response?.status === 403) {
          setError("Backend currently allows only ADMIN users to access applications.");
        } else {
          setError(getErrorMessage(err, "Failed to load applications"));
        }
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  return (
    <div>
      <PageTitle
        title="Applications"
        subtitle="This page is ready, but backend permissions currently limit this data to admin users."
      />
      {loading ? <Loader /> : null}
      {error ? <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow">{error}</div> : null}

      {!loading && !error && (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">Applications loaded: {applications.length}</p>
        </div>
      )}
    </div>
  );
};

export default Applications;
