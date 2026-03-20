import { useEffect, useState } from "react";
import FileUploadField from "../../components/common/FileUploadField";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import {
  getInternshipsRequest,
  updateInternshipRequest,
  updateInternshipStatusRequest,
} from "../../api/internships.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    position: "",
    startDate: "",
    endDate: "",
    status: "PENDING",
    evaluationScore: "",
    recommendationLetterUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getInternshipsRequest();
      setInternships(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load internships"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const openManage = (internship) => {
    setSelected(internship);
    setForm({
      position: internship.position || "",
      startDate: internship.startDate?.slice(0, 10) || "",
      endDate: internship.endDate?.slice(0, 10) || "",
      status: internship.status || "PENDING",
      evaluationScore: internship.evaluationScore ?? "",
      recommendationLetterUrl: internship.recommendationLetterUrl || "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateInternshipRequest(selected._id, {
        ...form,
        evaluationScore: form.evaluationScore === "" ? null : Number(form.evaluationScore),
      });
      setSelected(null);
      await loadInternships();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update internship"));
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updateInternshipStatusRequest(id, status);
      await loadInternships();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update internship status"));
    }
  };

  return (
    <div>
      <PageTitle title="Internships" subtitle="Manage candidate internship requests and outcomes" />

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Position</th>
                <th className="p-3 text-left">Period</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map((internship) => (
                <tr key={internship._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">
                      {internship.candidateId?.username || internship.candidateId?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{internship.candidateId?.email || "-"}</p>
                  </td>
                  <td className="p-3">{internship.companyId?.name || "-"}</td>
                  <td className="p-3">{internship.position}</td>
                  <td className="p-3">
                    {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                  </td>
                  <td className="p-3">{internship.status}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="secondary" onClick={() => openManage(internship)}>
                        Manage
                      </Button>
                      {["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"].map((status) => (
                        <Button
                          key={status}
                          variant="secondary"
                          onClick={() => handleStatus(internship._id, status)}
                          disabled={internship.status === status}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {internships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No internships found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={!!selected} title="Manage Internship" onClose={() => setSelected(null)} footer={null}>
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Position"
                value={form.position}
                onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  className="w-full rounded border border-slate-300 px-3 py-2"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              />
              <Input
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
            <Input
              label="Evaluation Score"
              type="number"
              min="0"
              max="100"
              value={form.evaluationScore}
              onChange={(event) => setForm((prev) => ({ ...prev, evaluationScore: event.target.value }))}
            />
            <FileUploadField
              label="Recommendation Letter"
              value={form.recommendationLetterUrl}
              accept=".pdf,.doc,.docx,image/*"
              buttonLabel="Upload Letter"
              helperText="Upload recommendation ama completion letter"
              onUploaded={(url) =>
                setForm((prev) => ({ ...prev, recommendationLetterUrl: url }))
              }
            />
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

export default Internships;
