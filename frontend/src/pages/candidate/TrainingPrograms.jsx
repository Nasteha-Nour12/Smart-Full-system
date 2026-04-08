import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import FileUploadField from "../../components/common/FileUploadField";
import {
  cancelMyTrainingProgramRequest,
  createTrainingProgramRequest,
  getMyTrainingProgramsRequest,
} from "../../api/trainingPrograms.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const educationLevels = ["BACHELOR_DEGREE", "MASTER_DEGREE", "SECONDARY_LEVEL", "NONE"];

const emptyFiles = {
  cvUrl: "",
  coverLetterUrl: "",
  nationalIdUrl: "",
  secondaryCertificateUrl: "",
  universityCertificateUrl: "",
  passportPhoto1Url: "",
  passportPhoto2Url: "",
  contractLetterUrl: "",
};

const emptyForm = {
  idNo: "",
  fullName: "",
  gender: "MALE",
  contact: "",
  district: "",
  educationLevel: "",
  faculty: "",
  otherSkills: "",
  trainingFee: 0,
  files: emptyFiles,
};

const TrainingPrograms = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyTrainingProgramsRequest();
      setRows(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load training programs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await createTrainingProgramRequest({
        ...form,
        otherSkills: form.otherSkills,
        trainingFee: Number(form.trainingFee || 0),
      });
      setOpenForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to create training request"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelMyTrainingProgramRequest(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to cancel training request"));
    }
  };

  return (
    <div>
      <PageTitle title="Training Programs" subtitle="Register and track your training program records">
        <Button onClick={() => setOpenForm(true)}>Register Training</Button>
      </PageTitle>

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">ID No</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Faculty</th>
                <th className="p-3 text-left">District</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="p-3">{row.idNo}</td>
                  <td className="p-3">{row.fullName}</td>
                  <td className="p-3">{row.faculty}</td>
                  <td className="p-3">{row.district}</td>
                  <td className="p-3">{row.trainingStatus}</td>
                  <td className="p-3">${row.trainingFee || 0}</td>
                  <td className="p-3 text-right">
                    {row.trainingStatus !== "COMPLETED" && row.trainingStatus !== "CANCELLED" ? (
                      <Button variant="danger" onClick={() => handleCancel(row._id)}>
                        Cancel
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">Updated {formatDate(row.updatedAt)}</span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">
                    No training registrations yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={openForm} title="Training Registration" onClose={() => setOpenForm(false)} footer={null} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="ID No"
              value={form.idNo}
              onChange={() => {}}
              placeholder="Auto-generated (TR...)"
              disabled
            />
            <Input label="Full Name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} required />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input label="Contact" value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} required />
            <Input label="District" value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} required />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Education Level</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.educationLevel}
                onChange={(e) => setForm((p) => ({ ...p, educationLevel: e.target.value }))}
                required
              >
                <option value="">Select level</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === "BACHELOR_DEGREE"
                      ? "Bachelor Degree"
                      : level === "MASTER_DEGREE"
                        ? "Master Degree"
                        : level === "SECONDARY_LEVEL"
                          ? "Secondary Level"
                          : "Midna"}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Faculty" value={form.faculty} onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))} required />
            <Input
              type="number"
              min="0"
              label="Training Fee"
              value={form.trainingFee}
              onChange={(e) => setForm((p) => ({ ...p, trainingFee: e.target.value }))}
            />
          </div>
          <Input
            label="Other Skills (comma separated)"
            value={form.otherSkills}
            onChange={(e) => setForm((p) => ({ ...p, otherSkills: e.target.value }))}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <FileUploadField label="CV" value={form.files.cvUrl} onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, cvUrl: url } }))} />
            <FileUploadField
              label="Cover Letter"
              value={form.files.coverLetterUrl}
              onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, coverLetterUrl: url } }))}
            />
            <FileUploadField
              label="National ID"
              value={form.files.nationalIdUrl}
              onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, nationalIdUrl: url } }))}
            />
            <FileUploadField
              label="Secondary Certificate"
              value={form.files.secondaryCertificateUrl}
              onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, secondaryCertificateUrl: url } }))}
            />
            <FileUploadField
              label="University Certificate"
              value={form.files.universityCertificateUrl}
              onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, universityCertificateUrl: url } }))}
            />
            <FileUploadField
              label="Passport Photo 1"
              value={form.files.passportPhoto1Url}
              onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, passportPhoto1Url: url } }))}
            />
            <FileUploadField
              label="Passport Photo 2"
              value={form.files.passportPhoto2Url}
              onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, passportPhoto2Url: url } }))}
            />
            <FileUploadField
              label="Contract Letter"
              value={form.files.contractLetterUrl}
              onUploaded={(url) => setForm((p) => ({ ...p, files: { ...p.files, contractLetterUrl: url } }))}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Submit Training Registration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingPrograms;
