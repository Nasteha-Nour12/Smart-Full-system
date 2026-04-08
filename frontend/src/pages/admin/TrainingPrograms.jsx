import { useEffect, useMemo, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import ExcelImportPanel from "../../components/common/ExcelImportPanel";
import {
  createTrainingProgramRequest,
  deleteTrainingProgramRequest,
  getTrainingProgramsRequest,
  importTrainingProgramsRequest,
  updateTrainingProgramStatusRequest,
} from "../../api/trainingPrograms.api";
import { getAllCandidateProfilesRequest } from "../../api/candidateProfiles.api";
import { getErrorMessage } from "../../utils/formatters";

const quickStatuses = ["PENDING", "COMPLETED"];
const educationLevels = ["BACHELOR_DEGREE", "MASTER_DEGREE", "SECONDARY_LEVEL", "NONE"];
const emptyCreateForm = {
  idNo: "",
  fullName: "",
  gender: "MALE",
  contact: "",
  district: "",
  educationLevel: "",
  faculty: "",
  otherSkills: "",
  selectedProgram: "INTERNSHIP",
  hospitalityType: "",
  trainingFee: 10,
};

const TrainingPrograms = () => {
  const [rows, setRows] = useState([]);
  const [trainingCandidates, setTrainingCandidates] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const statusBadgeClass = (status) => {
    if (status === "COMPLETED") return "bg-emerald-100 text-emerald-800";
    if (status === "ABSENT") return "bg-rose-100 text-rose-800";
    if (status === "PENDING") return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-700";
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [trainingRes, profilesRes] = await Promise.all([
        getTrainingProgramsRequest(),
        getAllCandidateProfilesRequest(),
      ]);
      setRows(trainingRes.data || []);
      const eligibleProfiles = (profilesRes.data || []).filter((profile) =>
        ["PENDING", "COMPLETED"].includes(String(profile.trainingStatus || "").toUpperCase())
      );
      setTrainingCandidates(eligibleProfiles);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load training programs"));
    } finally {
      setLoading(false);
    }
  };

  const mergedRows = useMemo(() => {
    const getId = (value) => (typeof value === "object" ? String(value?._id || "") : String(value || ""));
    const existingByCandidate = new Set(rows.map((row) => getId(row.candidateId)).filter(Boolean));

    const virtualRows = trainingCandidates
      .filter((profile) => {
        const id = getId(profile.userId);
        return id && !existingByCandidate.has(id);
      })
      .map((profile) => ({
        _id: `virtual-training-${getId(profile.userId)}`,
        isVirtual: true,
        candidateId: profile.userId,
        idNo: profile.idNo || "",
        fullName: profile.userId?.fullName || "",
        trainingType: "MANDATORY_3_DAY",
        contact: profile.contact || profile.userId?.phone || profile.userId?.email || "",
        district: profile.district || "",
        educationLevel: profile.educationLevel || "",
        faculty: profile.faculty || "",
        otherSkills: Array.isArray(profile.skills) ? profile.skills.map((s) => s?.name).filter(Boolean).join(", ") : "",
        selectedProgram: profile.selectedProgram || "INTERNSHIP",
        hospitalityType: profile.hospitalityType || "",
        trainingStatus: String(profile.trainingStatus || "PENDING").toUpperCase(),
        trainingFee: Number(profile.trainingFee || 10),
      }));

    return [...rows, ...virtualRows];
  }, [rows, trainingCandidates]);

  const searchKey = search.toLowerCase();
  const filteredRows = mergedRows.filter((row) => {
    if (!searchKey) return true;
    return (
      String(row.idNo || "").toLowerCase().includes(searchKey) ||
      String(row.fullName || "").toLowerCase().includes(searchKey) ||
      String(row.contact || "").toLowerCase().includes(searchKey)
    );
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickStatus = async (id, status) => {
    try {
      await updateTrainingProgramStatusRequest(id, status);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update training status"));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this training registration?")) return;
    try {
      await deleteTrainingProgramRequest(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete training registration"));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createTrainingProgramRequest({
        ...createForm,
        trainingFee: Number(createForm.trainingFee || 0),
      });
      setOpenCreate(false);
      setCreateForm(emptyCreateForm);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to create training registration"));
    } finally {
      setSaving(false);
    }
  };

  const openCreateFromCandidate = (row) => {
    setCreateForm({
      ...emptyCreateForm,
      idNo: row.idNo || "",
      fullName: row.fullName || "",
      gender: row.gender || "MALE",
      contact: row.contact || "",
      district: row.district || "",
      educationLevel: row.educationLevel || "",
      faculty: row.faculty || "",
      otherSkills: row.otherSkills || "",
      selectedProgram: row.selectedProgram || "INTERNSHIP",
      hospitalityType: row.hospitalityType || "",
      trainingFee: Number(row.trainingFee || 10),
      candidateId: row.candidateId?._id || row.candidateId || "",
      trainingStatus: row.trainingStatus || "PENDING",
    });
    setOpenCreate(true);
  };

  return (
    <div>
      <PageTitle title="Training Programs" subtitle="Admin management for training registrations">
        <Button onClick={() => setOpenCreate(true)}>Add Training</Button>
      </PageTitle>
      <ExcelImportPanel
        title="Excel Import - Training Program"
        description="Required columns: contact/phone/email, Full Name, Gender, Contact, District, Education Level, Faculty, Other Skills, Training Status, Training Fee, and file URL columns. ID No auto-generates."
        onImport={async (rows) => {
          const res = await importTrainingProgramsRequest(rows);
          await loadData();
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
                <th className="p-3 text-left">ID No</th>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Training Type</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Faculty</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="p-3">{row.idNo}</td>
                  <td className="p-3">{row.fullName}</td>
                  <td className="p-3">{row.trainingType || "-"}</td>
                  <td className="p-3">{row.contact}</td>
                  <td className="p-3">{row.faculty}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                        row.trainingStatus
                      )}`}
                    >
                      {row.trainingStatus}
                    </span>
                  </td>
                  <td className="p-3">${row.trainingFee || 0}</td>
                  <td className="p-3">
                    {row.durationDays ? `${row.durationDays} days` : ""}
                    {row.durationDays && row.durationMonths ? " / " : ""}
                    {row.durationMonths ? `${row.durationMonths} months` : ""}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {row.isVirtual ? (
                        <Button variant="secondary" className="min-w-[115px]" onClick={() => openCreateFromCandidate(row)}>
                          Create
                        </Button>
                      ) : (
                        <>
                          {quickStatuses.map((status) => (
                            <Button
                              key={status}
                              variant="secondary"
                              className="min-w-[115px]"
                              onClick={() => handleQuickStatus(row._id, status)}
                              disabled={row.trainingStatus === status}
                            >
                              {status}
                            </Button>
                          ))}
                          <Button variant="danger" className="min-w-[115px]" onClick={() => handleDelete(row._id)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-slate-500">
                    No training programs found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={openCreate} title="Add Training Program" onClose={() => setOpenCreate(false)} footer={null} size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="ID No"
              value={createForm.idNo}
              onChange={() => {}}
              placeholder="Auto-generated (TR...)"
              disabled
            />
            <div />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Full Name"
              value={createForm.fullName}
              onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={createForm.gender}
                onChange={(e) => setCreateForm((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input
              label="Contact"
              value={createForm.contact}
              onChange={(e) => setCreateForm((p) => ({ ...p, contact: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="District"
              value={createForm.district}
              onChange={(e) => setCreateForm((p) => ({ ...p, district: e.target.value }))}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Education Level</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={createForm.educationLevel}
                onChange={(e) => setCreateForm((p) => ({ ...p, educationLevel: e.target.value }))}
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
              onChange={(e) => setCreateForm((p) => ({ ...p, faculty: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Other Skills (comma separated)"
            value={createForm.otherSkills}
            onChange={(e) => setCreateForm((p) => ({ ...p, otherSkills: e.target.value }))}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Selected Program</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={createForm.selectedProgram}
                onChange={(e) => setCreateForm((p) => ({ ...p, selectedProgram: e.target.value }))}
              >
                <option value="INTERNSHIP">INTERNSHIP</option>
                <option value="GO_TO_WORK">GO TO WORK</option>
                <option value="HOSPITALITY">HOSPITALITY</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Hospitality Type</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={createForm.hospitalityType}
                onChange={(e) => setCreateForm((p) => ({ ...p, hospitalityType: e.target.value }))}
                disabled={createForm.selectedProgram !== "HOSPITALITY"}
              >
                <option value="">N/A</option>
                <option value="NO_SKILL">NO_SKILL</option>
                <option value="HAVE_SKILL_NO_EXPERIENCE">HAVE_SKILL_NO_EXPERIENCE</option>
                <option value="HAVE_SKILL_AND_EXPERIENCE">HAVE_SKILL_AND_EXPERIENCE</option>
              </select>
            </div>
            <Input
              label="Training Fee"
              type="number"
              min="0"
              value={createForm.trainingFee}
              onChange={(e) => setCreateForm((p) => ({ ...p, trainingFee: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Create Training
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingPrograms;
