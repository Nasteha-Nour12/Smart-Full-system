import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { getEnrollmentsRequest, updateEnrollmentRequest } from "../../api/enrollments.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "ENROLLED", progressPercent: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getEnrollmentsRequest();
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

  const openManage = (enrollment) => {
    setSelected(enrollment);
    setForm({
      status: enrollment.status || "ENROLLED",
      progressPercent: enrollment.progressPercent ?? 0,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateEnrollmentRequest(selected._id, {
        status: form.status,
        progressPercent: Number(form.progressPercent),
      });
      setSelected(null);
      await loadEnrollments();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update enrollment"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Enrollments" subtitle="Track program progress and status" />

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Program</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Progress</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">
                      {enrollment.candidateId?.username || enrollment.candidateId?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{enrollment.candidateId?.email || "-"}</p>
                  </td>
                  <td className="p-3">{enrollment.programId?.title || "-"}</td>
                  <td className="p-3">{enrollment.status}</td>
                  <td className="p-3">{enrollment.progressPercent || 0}%</td>
                  <td className="p-3">{formatDate(enrollment.createdAt)}</td>
                  <td className="p-3 text-right">
                    <Button variant="secondary" onClick={() => openManage(enrollment)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No enrollments found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={!!selected} title="Manage Enrollment" onClose={() => setSelected(null)} footer={null}>
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p>
                <span className="font-medium">Program:</span> {selected.programId?.title || "-"}
              </p>
              <p>
                <span className="font-medium">Candidate:</span>{" "}
                {selected.candidateId?.username || selected.candidateId?.fullName || "-"}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="ENROLLED">ENROLLED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DROPPED">DROPPED</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Progress Percent</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.progressPercent}
                onChange={(event) => setForm((prev) => ({ ...prev, progressPercent: event.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Enrollments;
