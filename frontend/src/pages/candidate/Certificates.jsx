import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import { getMyCertificatesRequest } from "../../api/certificates.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyCertificatesRequest();
      setCertificates(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load certificates"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  return (
    <div>
      <PageTitle title="Certificates" subtitle="View all certificates issued to you" />
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {certificates.map((certificate) => (
          <div key={certificate._id} className="rounded-xl bg-white p-5 shadow">
            <p className="text-xs uppercase tracking-wide text-slate-500">{certificate.sourceType}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{certificate.sourceId}</h3>
            <p className="mt-2 text-sm text-slate-600">Issued: {formatDate(certificate.issuedAt)}</p>
            <a
              href={certificate.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-blue-600 underline"
            >
              Open Certificate
            </a>
          </div>
        ))}
      </div>

      {!loading && certificates.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          No certificates available yet
        </div>
      ) : null}
    </div>
  );
};

export default Certificates;
