import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import FileUploadField from "../../components/common/FileUploadField";
import { getCompaniesRequest } from "../../api/companies.api";
import {
  cancelMyInternshipRequest,
  getMyInternshipsRequest,
  requestInternshipRequest,
} from "../../api/internships.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const educationLevels = ["BACHELOR_DEGREE", "MASTER_DEGREE", "SECONDARY_LEVEL", "NONE"];

const emptyForm = {
  companyId: "",
  position: "",
  startDate: "",
  endDate: "",
  idNo: "",
  fullName: "",
  gender: "MALE",
  contact: "",
  district: "",
  educationLevel: "",
  faculty: "",
  otherSkills: "",
  internshipFee: 0,
  files: {
    cvUrl: "",
    coverLetterUrl: "",
    nationalIdUrl: "",
    secondaryCertificateUrl: "",
    universityCertificateUrl: "",
    passportPhoto1Url: "",
    passportPhoto2Url: "",
    contractLetterUrl: "",
  },
};

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [internshipsRes, companiesRes] = await Promise.all([
        getMyInternshipsRequest(),
        getCompaniesRequest(),
      ]);
      setInternships(internshipsRes.data || []);
      setCompanies((companiesRes.data || []).filter((company) => company.status === "APPROVED"));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load internships"));
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
      await requestInternshipRequest({
        ...form,
        internshipFee: Number(form.internshipFee || 0),
      });
      setOpenForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to submit internship request"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelMyInternshipRequest(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to cancel internship"));
    }
  };

  return (
    <div>
      <PageTitle title="Internships" subtitle="Request and track your internship placements">
        <Button onClick={() => setOpenForm(true)}>Request Internship</Button>
      </PageTitle>
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {internships.map((internship) => (
          <div key={internship._id} className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">{internship.position}</h3>
            <p className="mt-2 text-sm text-slate-600">{internship.companyId?.name || "-"}</p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>Status: {internship.status}</p>
              <p>Applicant: {internship.fullName}</p>
              <p>ID: {internship.idNo}</p>
              <p>
                Period: {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
              </p>
              <p>Fee: ${internship.internshipFee || 0}</p>
              <p>Score: {internship.evaluationScore ?? "-"}</p>
            </div>
            {internship.status !== "COMPLETED" && internship.status !== "CANCELLED" ? (
              <Button variant="danger" className="mt-4" onClick={() => handleCancel(internship._id)}>
                Cancel Request
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {!loading && internships.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          No internship requests yet
        </div>
      ) : null}

      <Modal open={openForm} title="Request Internship" onClose={() => setOpenForm(false)} footer={null}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="ID No"
              value={form.idNo}
              onChange={() => {}}
              placeholder="Auto-generated (IN...)"
              disabled
            />
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.gender}
                onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input
              label="Contact"
              value={form.contact}
              onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
              required
            />
            <Input
              label="District"
              value={form.district}
              onChange={(event) => setForm((prev) => ({ ...prev, district: event.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Education Level</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.educationLevel}
                onChange={(event) => setForm((prev) => ({ ...prev, educationLevel: event.target.value }))}
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
            <Input
              label="Faculty"
              value={form.faculty}
              onChange={(event) => setForm((prev) => ({ ...prev, faculty: event.target.value }))}
              required
            />
            <Input
              label="Internship Fee"
              type="number"
              min="0"
              value={form.internshipFee}
              onChange={(event) => setForm((prev) => ({ ...prev, internshipFee: event.target.value }))}
            />
          </div>
          <Input
            label="Other Skills (comma separated)"
            value={form.otherSkills}
            onChange={(event) => setForm((prev) => ({ ...prev, otherSkills: event.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Company</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={form.companyId}
              onChange={(event) => setForm((prev) => ({ ...prev, companyId: event.target.value }))}
              required
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Position"
            value={form.position}
            onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FileUploadField
              label="CV"
              value={form.files.cvUrl}
              onUploaded={(url) => setForm((prev) => ({ ...prev, files: { ...prev.files, cvUrl: url } }))}
            />
            <FileUploadField
              label="Cover Letter"
              value={form.files.coverLetterUrl}
              onUploaded={(url) => setForm((prev) => ({ ...prev, files: { ...prev.files, coverLetterUrl: url } }))}
            />
            <FileUploadField
              label="National ID"
              value={form.files.nationalIdUrl}
              onUploaded={(url) => setForm((prev) => ({ ...prev, files: { ...prev.files, nationalIdUrl: url } }))}
            />
            <FileUploadField
              label="Secondary Certificate"
              value={form.files.secondaryCertificateUrl}
              onUploaded={(url) =>
                setForm((prev) => ({ ...prev, files: { ...prev.files, secondaryCertificateUrl: url } }))
              }
            />
            <FileUploadField
              label="University Certificate"
              value={form.files.universityCertificateUrl}
              onUploaded={(url) =>
                setForm((prev) => ({ ...prev, files: { ...prev.files, universityCertificateUrl: url } }))
              }
            />
            <FileUploadField
              label="Passport Photo 1"
              value={form.files.passportPhoto1Url}
              onUploaded={(url) => setForm((prev) => ({ ...prev, files: { ...prev.files, passportPhoto1Url: url } }))}
            />
            <FileUploadField
              label="Passport Photo 2"
              value={form.files.passportPhoto2Url}
              onUploaded={(url) => setForm((prev) => ({ ...prev, files: { ...prev.files, passportPhoto2Url: url } }))}
            />
            <FileUploadField
              label="Contract Letter"
              value={form.files.contractLetterUrl}
              onUploaded={(url) => setForm((prev) => ({ ...prev, files: { ...prev.files, contractLetterUrl: url } }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Internships;
