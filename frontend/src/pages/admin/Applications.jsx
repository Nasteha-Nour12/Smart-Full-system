import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import {
  getApplicationsRequest,
  updateApplicationRequest,
} from "../../api/applications.api";
import { formatDate, formatDateTime, getErrorMessage } from "../../utils/formatters";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: "SUBMITTED", interviewDate: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getApplicationsRequest();
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

  const openEdit = (application) => {
    setSelected(application);
    setForm({
      status: application.status || "SUBMITTED",
      interviewDate: application.interviewDate?.slice(0, 16) || "",
      notes: application.notes || "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateApplicationRequest(selected._id, {
        ...form,
        interviewDate: form.interviewDate || null,
      });
      setSelected(null);
      await loadApplications();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update application"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Applications" subtitle="Review candidate applications and update status" />

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Opportunity</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Interview</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">
                      {application.candidateId?.username || application.candidateId?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{application.candidateId?.email || "-"}</p>
                  </td>
                  <td className="p-3">{application.opportunityId?.title || "-"}</td>
                  <td className="p-3">{application.opportunityId?.companyId?.name || "-"}</td>
                  <td className="p-3">{application.status}</td>
                  <td className="p-3">{formatDateTime(application.interviewDate)}</td>
                  <td className="p-3 text-right">
                    <Button variant="secondary" onClick={() => openEdit(application)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No applications found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        open={!!selected}
        title="Manage Application"
        onClose={() => setSelected(null)}
        footer={null}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p>
                <span className="font-medium">Candidate:</span>{" "}
                {selected.candidateId?.username || selected.candidateId?.fullName || "-"}
              </p>
              <p>
                <span className="font-medium">Opportunity:</span> {selected.opportunityId?.title || "-"}
              </p>
              <p>
                <span className="font-medium">Applied:</span> {formatDate(selected.createdAt)}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Interview Date</label>
              <input
                type="datetime-local"
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.interviewDate}
                onChange={(event) => setForm((prev) => ({ ...prev, interviewDate: event.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                className="w-full rounded border border-slate-300 px-3 py-2"
                rows="4"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
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

export default Applications;
