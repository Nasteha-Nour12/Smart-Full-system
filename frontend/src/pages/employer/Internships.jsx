import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import { getInternshipsRequest } from "../../api/internships.api";
import { getErrorMessage } from "../../utils/formatters";

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInternships = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getInternshipsRequest();
        setInternships(res.data || []);
      } catch (err) {
        if (err?.response?.status === 403) {
          setError("Backend currently allows only ADMIN users to access internships management.");
        } else {
          setError(getErrorMessage(err, "Failed to load internships"));
        }
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, []);

  return (
    <div>
      <PageTitle
        title="Internships"
        subtitle="Internship employer access is enabled for internship monitoring."
      />
      {loading ? <Loader /> : null}
      {error ? <div className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow">{error}</div> : null}

      {!loading && !error && (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-slate-600">Internships loaded: {internships.length}</p>
        </div>
      )}
    </div>
  );
};

export default Internships;
