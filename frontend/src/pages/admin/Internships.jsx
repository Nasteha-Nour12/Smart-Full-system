import { useEffect, useMemo, useState } from "react";
import FileUploadField from "../../components/common/FileUploadField";
import ExcelImportPanel from "../../components/common/ExcelImportPanel";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import {
  deleteInternshipRequest,
  getInternshipsRequest,
  importInternshipsRequest,
  requestInternshipRequest,
  updateInternshipRequest,
  updateInternshipStatusRequest,
} from "../../api/internships.api";
import { getCompaniesRequest } from "../../api/companies.api";
import { getAllCandidateProfilesRequest } from "../../api/candidateProfiles.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const educationLevels = ["BACHELOR_DEGREE", "MASTER_DEGREE", "SECONDARY_LEVEL", "NONE"];

const Internships = () => {
  const quickStatuses = ["PENDING", "ACTIVE", "COMPLETED"];
  const [internships, setInternships] = useState([]);
  const [internshipCandidates, setInternshipCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    position: "",
    startDate: "",
    endDate: "",
    status: "PENDING",
    evaluationScore: "",
    recommendationLetterUrl: "",
    internshipFee: 0,
  });
  const [createForm, setCreateForm] = useState({
    candidateId: "",
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError("");
      const [internshipRes, companiesRes, candidateRes] = await Promise.all([
        getInternshipsRequest(),
        getCompaniesRequest(),
        getAllCandidateProfilesRequest({ selectedProgram: "INTERNSHIP" }),
      ]);
      setInternships(internshipRes.data || []);
      setCompanies(companiesRes.data || []);
      setInternshipCandidates(candidateRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load internships"));
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    const getId = (value) => (typeof value === "object" ? String(value?._id || "") : String(value || ""));
    const existingByCandidate = new Set(
      internships.map((row) => getId(row.candidateId)).filter(Boolean)
    );

    const virtualRows = internshipCandidates
      .filter((profile) => {
        const id = getId(profile.userId);
        return id && !existingByCandidate.has(id);
      })
      .map((profile) => ({
        _id: `virtual-internship-${getId(profile.userId)}`,
        isVirtual: true,
        idNo: profile.idNo,
        fullName: profile.userId?.fullName || "-",
        contact: profile.contact || profile.userId?.phone || profile.userId?.email || "-",
        district: profile.district || "",
        educationLevel: profile.educationLevel || "",
        faculty: profile.faculty || "",
        otherSkills: Array.isArray(profile.skills) ? profile.skills.map((s) => s?.name).filter(Boolean).join(", ") : "",
        candidateId: profile.userId,
        status: "PENDING",
        internshipFee: 0,
      }));

    return [...internships, ...virtualRows];
  }, [internships, internshipCandidates]);

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
      internshipFee: internship.internshipFee ?? 0,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateInternshipRequest(selected._id, {
        ...form,
        evaluationScore: form.evaluationScore === "" ? null : Number(form.evaluationScore),
        internshipFee: Number(form.internshipFee || 0),
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this internship row?")) return;
    try {
      await deleteInternshipRequest(id);
      await loadInternships();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete internship"));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await requestInternshipRequest({
        ...createForm,
        internshipFee: Number(createForm.internshipFee || 0),
      });
      setOpenCreate(false);
      setCreateForm({
        candidateId: "",
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
      });
      await loadInternships();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to create internship"));
    } finally {
      setSaving(false);
    }
  };

  const openCreateFromCandidate = (row) => {
    setCreateForm((prev) => ({
      ...prev,
      candidateId: row.candidateId?._id || row.candidateId || "",
      idNo: row.idNo || "",
      fullName: row.fullName || row.candidateId?.fullName || "",
      contact: row.contact || row.candidateId?.phone || row.candidateId?.email || "",
      district: row.district || "",
      educationLevel: row.educationLevel || "",
      faculty: row.faculty || "",
      otherSkills: row.otherSkills || "",
    }));
    setOpenCreate(true);
  };

  return (
    <div>
      <PageTitle title="Internships" subtitle="Manage candidate internship requests and outcomes">
        <Button onClick={() => setOpenCreate(true)}>Add Internship</Button>
      </PageTitle>
      <ExcelImportPanel
        title="Excel Import - Internship Program"
        description="Required columns: contact/phone/email, companyId, position, startDate, endDate, Full Name, Gender, Contact, District, Education Level, Faculty, Other Skills, Internship Status, Internship Fee, and file URL columns. ID No auto-generates."
        onImport={async (rows) => {
          const res = await importInternshipsRequest(rows);
          await loadInternships();
          return res;
        }}
      />
      <div className="mb-4 max-w-md">
        <Input
          label="Search by ID No, Name, Contact"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((internship) => {
                  const key = search.toLowerCase();
                  if (!key) return true;
                  return (
                    String(internship.idNo || "").toLowerCase().includes(key) ||
                    String(internship.fullName || "").toLowerCase().includes(key) ||
                    String(internship.contact || "").toLowerCase().includes(key)
                  );
                })
                .map((internship) => (
                <tr key={internship._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">
                      {internship.fullName || internship.candidateId?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{internship.contact || internship.candidateId?.email || "-"}</p>
                  </td>
                  <td className="p-3">{internship.companyId?.name || "-"}</td>
                  <td className="p-3">{internship.position || "-"}</td>
                  <td className="p-3">
                    {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                  </td>
                  <td className="p-3">{internship.status}</td>
                  <td className="p-3">${internship.internshipFee || 0}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {internship.isVirtual ? (
                        <Button variant="secondary" onClick={() => openCreateFromCandidate(internship)}>
                          Create
                        </Button>
                      ) : (
                        <>
                          {quickStatuses.map((status) => (
                            <Button
                              key={status}
                              variant="secondary"
                              className="min-w-[115px]"
                              onClick={() => handleStatus(internship._id, status)}
                              disabled={internship.status === status}
                            >
                              {status}
                            </Button>
                          ))}
                          <Button
                            variant="danger"
                            className="min-w-[115px]"
                            onClick={() => handleDelete(internship._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">
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
            <Input
              label="Internship Fee"
              type="number"
              min="0"
              value={form.internshipFee}
              onChange={(event) => setForm((prev) => ({ ...prev, internshipFee: event.target.value }))}
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

      <Modal open={openCreate} title="Add Internship" onClose={() => setOpenCreate(false)} footer={null} size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="ID No"
              value={createForm.idNo}
              onChange={() => {}}
              placeholder="Auto-generated (IN...)"
              disabled
            />
            <div />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Full Name"
              value={createForm.fullName}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Gender</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={createForm.gender}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, gender: event.target.value }))}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input
              label="Contact"
              value={createForm.contact}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, contact: event.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="District"
              value={createForm.district}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, district: event.target.value }))}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Education Level</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={createForm.educationLevel}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, educationLevel: event.target.value }))}
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
              value={createForm.faculty}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, faculty: event.target.value }))}
              required
            />
          </div>
          <Input
            label="Other Skills"
            value={createForm.otherSkills}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, otherSkills: event.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Company</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={createForm.companyId}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, companyId: event.target.value }))}
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
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Position"
              value={createForm.position}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, position: event.target.value }))}
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={createForm.startDate}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, startDate: event.target.value }))}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={createForm.endDate}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, endDate: event.target.value }))}
              required
            />
          </div>
          <Input
            label="Internship Fee"
            type="number"
            min="0"
            value={createForm.internshipFee}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, internshipFee: event.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Create Internship
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Internships;
