import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { enrollProgramRequest, getMyEnrollmentsRequest } from "../../api/enrollments.api";
import { getProgramsRequest } from "../../api/programs.api";
import { formatCurrency, formatDate, getErrorMessage } from "../../utils/formatters";

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [enrolledProgramIds, setEnrolledProgramIds] = useState([]);
  const [submittingId, setSubmittingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError("");
      const [programsRes, enrollmentsRes] = await Promise.all([
        getProgramsRequest({ status: "OPEN" }),
        getMyEnrollmentsRequest(),
      ]);
      setPrograms(programsRes.data || []);
      setEnrolledProgramIds(
        (enrollmentsRes.data || []).map((item) => item.programId?._id).filter(Boolean)
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load programs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleEnroll = async (programId) => {
    try {
      setSubmittingId(programId);
      await enrollProgramRequest(programId);
      alert("Enrollment submitted successfully");
      await loadPrograms();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to enroll"));
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div>
      <PageTitle title="Programs" subtitle="Browse open programs and enroll" />

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((program) => (
          <div key={program._id} className="rounded-xl bg-white p-5 shadow">
            <p className="text-xs uppercase tracking-wide text-slate-500">{program.type}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{program.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{program.description || "No description"}</p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Dates: {formatDate(program.startDate)} - {formatDate(program.endDate)}</p>
              <p>Seats: {program.seats}</p>
              <p>Fee: {formatCurrency(program.fee)}</p>
            </div>
            <Button
              className="mt-4 w-full"
              onClick={() => handleEnroll(program._id)}
              disabled={enrolledProgramIds.includes(program._id) || submittingId === program._id}
              loading={submittingId === program._id}
            >
              {enrolledProgramIds.includes(program._id) ? "Already Requested" : "Enroll Now"}
            </Button>
          </div>
        ))}
      </div>

      {!loading && programs.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          No open programs right now
        </div>
      ) : null}
    </div>
  );
};

export default Programs;
