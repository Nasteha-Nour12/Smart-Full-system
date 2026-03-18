import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { dropEnrollmentRequest, getMyEnrollmentsRequest } from "../../api/enrollments.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyEnrollmentsRequest();
      setEnrollments(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load enrollments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const handleDrop = async (id) => {
    try {
      await dropEnrollmentRequest(id);
      await loadEnrollments();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to drop enrollment"));
    }
  };

  return (
    <div>
      <PageTitle title="My Enrollments" subtitle="Track your program journey" />
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {enrollments.map((enrollment) => (
          <div key={enrollment._id} className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">{enrollment.programId?.title || "-"}</h3>
            <p className="mt-2 text-sm text-slate-600">
              {enrollment.programId?.description || "No description"}
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Status: {enrollment.status}</p>
              <p>Progress: {enrollment.progressPercent || 0}%</p>
              <p>Started: {formatDate(enrollment.createdAt)}</p>
            </div>
            {enrollment.status !== "DROPPED" ? (
              <Button variant="danger" className="mt-4" onClick={() => handleDrop(enrollment._id)}>
                Drop Program
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {!loading && enrollments.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          You have no enrollments yet
        </div>
      ) : null}
    </div>
  );
};

export default MyEnrollments;
