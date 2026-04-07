<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageTitle from "../../components/common/PageTitle";
import ExcelImportPanel from "../../components/common/ExcelImportPanel";
import {
  deleteCandidateProfileByUserIdRequest,
  getAllCandidateProfilesRequest,
  getCandidateProfileByUserIdRequest,
  importCandidateProfilesRequest,
  upsertCandidateProfileByAdminRequest,
} from "../../api/candidateProfiles.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const selectedPrograms = ["INTERNSHIP", "HOSPITALITY", "GO_TO_WORK"];
const hospitalityTypes = ["NO_SKILL", "HAVE_SKILL_NO_EXPERIENCE", "HAVE_SKILL_AND_EXPERIENCE"];
const trainingStatuses = ["PENDING", "SCHEDULED", "ATTENDING", "COMPLETED", "FAILED", "ABSENT"];
const educationLevels = ["NONE", "BACHELOR_DEGREE"];

const emptyForm = {
  userId: "",
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
  candidateStatus: "NEW",
  trainingStatus: "PENDING",
  trainingFee: 10,
  programFee: 0,
  notes: "",
};

const statusBadge = (value) => {
  const map = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    NEW: "bg-slate-100 text-slate-700",
    NOT_ELIGIBLE: "bg-amber-100 text-amber-700",
    OPPORTUNITY_LOST: "bg-rose-100 text-rose-700",
    REMOVED_FROM_QUEUE: "bg-red-100 text-red-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-rose-100 text-rose-700",
    ABSENT: "bg-amber-100 text-amber-700",
  };
  return map[value] || "bg-slate-100 text-slate-700";
};

const deriveProgramValues = (form) => {
  const next = { ...form };
  if (next.selectedProgram === "HOSPITALITY") {
    if (next.hospitalityType === "NO_SKILL") {
      next.trainingFee = 60;
      next.programFee = 60;
      next.candidateStatus = "PENDING_TRAINING";
    } else if (
      next.hospitalityType === "HAVE_SKILL_NO_EXPERIENCE" ||
      next.hospitalityType === "HAVE_SKILL_AND_EXPERIENCE"
    ) {
      next.trainingFee = 10;
      if (next.trainingStatus !== "COMPLETED") {
        next.candidateStatus = "NOT_ELIGIBLE";
      }
    }
    return next;
  }

  if (next.selectedProgram === "INTERNSHIP" || next.selectedProgram === "GO_TO_WORK") {
    next.trainingFee = 10;
    if (next.trainingStatus !== "COMPLETED") {
      next.candidateStatus = "NOT_ELIGIBLE";
    }
  }
  return next;
};

const CandidateProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    search: "",
    district: "",
    educationLevel: "",
    faculty: "",
    selectedProgram: "",
    trainingStatus: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllCandidateProfilesRequest({
        district: filters.district || undefined,
        educationLevel: filters.educationLevel || undefined,
        faculty: filters.faculty || undefined,
        selectedProgram: filters.selectedProgram || undefined,
        trainingStatus: filters.trainingStatus || undefined,
      });
      setProfiles(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load candidate profiles"));
    } finally {
      setLoading(false);
    }
  }, [filters.district, filters.educationLevel, filters.faculty, filters.selectedProgram, filters.trainingStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredProfiles = useMemo(() => {
    const key = filters.search.trim().toLowerCase();
    if (!key) return profiles;
    return profiles.filter((p) => {
      const idNo = String(p.idNo || "").toLowerCase();
      const name = String(p.userId?.fullName || "").toLowerCase();
      const contact = String(p.contact || p.userId?.phone || p.userId?.email || "").toLowerCase();
      return idNo.includes(key) || name.includes(key) || contact.includes(key);
    });
  }, [profiles, filters.search]);

  const openCreate = () => {
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = async (userId) => {
    try {
      const res = await getCandidateProfileByUserIdRequest(userId);
      const p = res.data;
      setForm({
        userId: p.userId?._id || userId,
        idNo: p.idNo || "",
        fullName: p.userId?.fullName || "",
        gender: p.gender || "MALE",
        contact: p.contact || p.userId?.phone || p.userId?.email || "",
        district: p.district || "",
        educationLevel: p.educationLevel || p.education || "",
        faculty: p.faculty || "",
        otherSkills: (p.skills || []).map((s) => s.name).join(", "),
        selectedProgram: p.selectedProgram || "INTERNSHIP",
        hospitalityType: p.hospitalityType || "",
        candidateStatus: p.candidateStatus || "NEW",
        trainingStatus: p.trainingStatus || "PENDING",
        trainingFee: p.trainingFee ?? 10,
        programFee: p.programFee ?? 0,
        notes: p.notes || "",
      });
      setOpenForm(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load candidate profile"));
    }
  };

  const openProfile = async (userId) => {
    try {
      const res = await getCandidateProfileByUserIdRequest(userId);
      setSelected(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load profile"));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Delete this candidate profile? This action cannot be undone.")) return;
    try {
      setSaving(true);
      await deleteCandidateProfileByUserIdRequest(userId);
      toast.success("Candidate profile deleted");
      await load();
      setSelected(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (patch) => {
    setForm((prev) => deriveProgramValues({ ...prev, ...patch }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = deriveProgramValues({
        ...form,
        otherSkills: form.otherSkills,
      });
      await upsertCandidateProfileByAdminRequest(payload);
      toast.success("Candidate registration saved");
      setOpenForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save candidate registration"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Candidate Profiles" subtitle="Register, filter, and manage candidate records">
        <Button onClick={openCreate}>Register Candidate</Button>
      </PageTitle>

      <ExcelImportPanel
        title="Excel Import - Candidate Registration"
        description="Columns: idNo, fullName, gender, contact, district, educationLevel, faculty, otherSkills, selectedProgram, hospitalityType, candidateStatus, trainingFee, programFee."
        onImport={async (rows) => {
          const res = await importCandidateProfilesRequest(rows);
          await load();
          return res;
        }}
      />

      <div className="mb-4 grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-6">
        <Input
          label="Search (ID/Name/Contact)"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <Input
          label="District"
          value={filters.district}
          onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
        />
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Education</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={filters.educationLevel}
            onChange={(e) => setFilters((prev) => ({ ...prev, educationLevel: e.target.value }))}
          >
            <option value="">All</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Faculty"
          value={filters.faculty}
          onChange={(e) => setFilters((prev) => ({ ...prev, faculty: e.target.value }))}
        />
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Program</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={filters.selectedProgram}
            onChange={(e) => setFilters((prev) => ({ ...prev, selectedProgram: e.target.value }))}
          >
            <option value="">All</option>
            {selectedPrograms.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Training Status</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={filters.trainingStatus}
            onChange={(e) => setFilters((prev) => ({ ...prev, trainingStatus: e.target.value }))}
          >
            <option value="">All</option>
            {trainingStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 text-left">ID No</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Program</th>
                <th className="p-3 text-left">Training</th>
                <th className="p-3 text-left">Candidate Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3 font-medium text-slate-800">{p.idNo || "-"}</td>
                  <td className="p-3">{p.userId?.fullName || "-"}</td>
                  <td className="p-3 text-slate-600">{p.contact || p.userId?.email || p.userId?.phone || "-"}</td>
                  <td className="p-3">{p.selectedProgram || "-"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(p.trainingStatus)}`}>
                      {p.trainingStatus || "-"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(p.candidateStatus)}`}>
                      {p.candidateStatus || "-"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openProfile(p.userId?._id || p.userId)}>
                        View
                      </Button>
                      <Button variant="secondary" onClick={() => openEdit(p.userId?._id || p.userId)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(p.userId?._id || p.userId)}
                        loading={saving}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={7}>
                    No candidate profiles found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={openForm} title="Candidate Registration" onClose={() => setOpenForm(false)} footer={null} size="xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Candidate User ID (optional)"
              value={form.userId}
              onChange={(e) => handleFormChange({ userId: e.target.value })}
            />
            <Input label="ID No" value={form.idNo} onChange={(e) => handleFormChange({ idNo: e.target.value })} required />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => handleFormChange({ fullName: e.target.value })}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.gender}
                onChange={(e) => handleFormChange({ gender: e.target.value })}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input
              label="Contact"
              value={form.contact}
              onChange={(e) => handleFormChange({ contact: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="District"
              value={form.district}
              onChange={(e) => handleFormChange({ district: e.target.value })}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Education Level</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.educationLevel}
                onChange={(e) => handleFormChange({ educationLevel: e.target.value })}
                required
              >
                <option value="">Select level</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Faculty"
              value={form.faculty}
              onChange={(e) => handleFormChange({ faculty: e.target.value })}
              required
            />
          </div>
          <Input
            label="Other Skills (comma separated)"
            value={form.otherSkills}
            onChange={(e) => handleFormChange({ otherSkills: e.target.value })}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Selected Program</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.selectedProgram}
                onChange={(e) => handleFormChange({ selectedProgram: e.target.value })}
              >
                {selectedPrograms.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>
            {form.selectedProgram === "HOSPITALITY" ? (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Hospitality Type</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  value={form.hospitalityType}
                  onChange={(e) => handleFormChange({ hospitalityType: e.target.value })}
                >
                  <option value="">Select type</option>
                  {hospitalityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Input label="Hospitality Type" value="N/A" disabled />
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Training Status</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.trainingStatus}
                onChange={(e) => handleFormChange({ trainingStatus: e.target.value })}
              >
                {trainingStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Candidate Status"
              value={form.candidateStatus}
              onChange={(e) => handleFormChange({ candidateStatus: e.target.value.toUpperCase() })}
            />
            <Input
              label="Training Fee (USD)"
              type="number"
              min="0"
              value={form.trainingFee}
              onChange={(e) => handleFormChange({ trainingFee: Number(e.target.value || 0) })}
            />
            <Input
              label="Program Fee (USD)"
              type="number"
              min="0"
              value={form.programFee}
              onChange={(e) => handleFormChange({ programFee: Number(e.target.value || 0) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Notes / Remarks</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              rows={4}
              value={form.notes}
              onChange={(e) => handleFormChange({ notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save Candidate
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!selected} title="Candidate Profile" onClose={() => setSelected(null)} footer={null}>
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="ID No" value={selected.idNo || "-"} />
              <Info label="Full Name" value={selected.userId?.fullName || "-"} />
              <Info label="Contact" value={selected.contact || selected.userId?.email || selected.userId?.phone || "-"} />
              <Info label="District" value={selected.district || "-"} />
              <Info label="Education Level" value={selected.educationLevel || selected.education || "-"} />
              <Info label="Faculty" value={selected.faculty || "-"} />
              <Info label="Selected Program" value={selected.selectedProgram || "-"} />
              <Info label="Hospitality Type" value={selected.hospitalityType || "-"} />
              <Info label="Training Status" value={selected.trainingStatus || "-"} />
              <Info label="Candidate Status" value={selected.candidateStatus || "-"} />
              <Info label="Training Fee" value={`$${selected.trainingFee || 0}`} />
              <Info label="Program Fee" value={`$${selected.programFee || 0}`} />
              <Info label="Created" value={formatDate(selected.createdAt)} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.skills?.length ? (
                  selected.skills.map((s) => (
                    <span key={s._id} className="rounded bg-slate-100 px-2 py-1 text-sm">
                      {s.name} ({s.level})
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No skills</span>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="font-medium text-slate-800">{value}</p>
  </div>
);

export default CandidateProfiles;
=======
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageTitle from "../../components/common/PageTitle";
import ExcelImportPanel from "../../components/common/ExcelImportPanel";
import {
  deleteCandidateProfileByUserIdRequest,
  getAllCandidateProfilesRequest,
  getCandidateProfileByUserIdRequest,
  importCandidateProfilesRequest,
  upsertCandidateProfileByAdminRequest,
} from "../../api/candidateProfiles.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const selectedPrograms = ["INTERNSHIP", "HOSPITALITY", "GO_TO_WORK"];
const hospitalityTypes = ["NO_SKILL", "HAVE_SKILL_NO_EXPERIENCE", "HAVE_SKILL_AND_EXPERIENCE"];
const trainingStatuses = ["PENDING", "SCHEDULED", "ATTENDING", "COMPLETED", "FAILED", "ABSENT"];
const educationLevels = ["BACHELOR_DEGREE", "MASTER_DEGREE", "SECONDARY_LEVEL", "NONE"];
const candidateStatusOptions = [
  { value: "NEW", label: "NEW - Candidate cusub" },
  { value: "PENDING_TRAINING", label: "PENDING_TRAINING - Sugaya tababar" },
  { value: "ACTIVE", label: "ACTIVE - Diyaar ah" },
  { value: "NOT_ELIGIBLE", label: "NOT_ELIGIBLE - Shuruud ma buuxin" },
  { value: "OPPORTUNITY_LOST", label: "OPPORTUNITY_LOST - Fursad seegtay" },
  { value: "REMOVED_FROM_QUEUE", label: "REMOVED_FROM_QUEUE - Laga saaray safka" },
];

const emptyForm = {
  userId: "",
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
  candidateStatus: "",
  trainingStatus: "PENDING",
  trainingFee: 10,
  programFee: 0,
  notes: "",
};

const statusBadge = (value) => {
  const map = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    NEW: "bg-slate-100 text-slate-700",
    NOT_ELIGIBLE: "bg-amber-100 text-amber-700",
    OPPORTUNITY_LOST: "bg-rose-100 text-rose-700",
    REMOVED_FROM_QUEUE: "bg-red-100 text-red-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-rose-100 text-rose-700",
    ABSENT: "bg-amber-100 text-amber-700",
  };
  return map[value] || "bg-slate-100 text-slate-700";
};

const deriveProgramValues = (form) => {
  const next = { ...form };
  if (next.selectedProgram === "HOSPITALITY") {
    if (next.hospitalityType === "NO_SKILL") {
      next.trainingFee = 60;
      next.programFee = 60;
      next.candidateStatus = "PENDING_TRAINING";
    } else if (
      next.hospitalityType === "HAVE_SKILL_NO_EXPERIENCE" ||
      next.hospitalityType === "HAVE_SKILL_AND_EXPERIENCE"
    ) {
      next.trainingFee = 10;
      if (next.trainingStatus !== "COMPLETED") {
        next.candidateStatus = "NOT_ELIGIBLE";
      }
    }
    return next;
  }

  if (next.selectedProgram === "INTERNSHIP" || next.selectedProgram === "GO_TO_WORK") {
    next.trainingFee = 10;
    if (next.trainingStatus !== "COMPLETED") {
      next.candidateStatus = "NOT_ELIGIBLE";
    }
  }
  return next;
};

const CandidateProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    search: "",
    district: "",
    educationLevel: "",
    faculty: "",
    selectedProgram: "",
    trainingStatus: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllCandidateProfilesRequest({
        district: filters.district || undefined,
        educationLevel: filters.educationLevel || undefined,
        faculty: filters.faculty || undefined,
        selectedProgram: filters.selectedProgram || undefined,
        trainingStatus: filters.trainingStatus || undefined,
      });
      setProfiles(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load candidate profiles"));
    } finally {
      setLoading(false);
    }
  }, [filters.district, filters.educationLevel, filters.faculty, filters.selectedProgram, filters.trainingStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredProfiles = useMemo(() => {
    const key = filters.search.trim().toLowerCase();
    return profiles.filter((p) => {
      const idNo = String(p.idNo || "").toLowerCase();
      const name = String(p.userId?.fullName || "").toLowerCase();
      const contact = String(p.contact || p.userId?.phone || p.userId?.email || "").toLowerCase();
      return !key || idNo.includes(key) || name.includes(key) || contact.includes(key);
    });
  }, [profiles, filters.search]);

  const openCreate = () => {
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = async (userId) => {
    try {
      const res = await getCandidateProfileByUserIdRequest(userId);
      const p = res.data;
      setForm({
        userId: p.userId?._id || userId,
        idNo: p.idNo || "",
        fullName: p.userId?.fullName || "",
        gender: p.gender || "MALE",
        contact: p.contact || p.userId?.phone || p.userId?.email || "",
        district: p.district || "",
        educationLevel: p.educationLevel || p.education || "",
        faculty: p.faculty || "",
        otherSkills: (p.skills || []).map((s) => s.name).join(", "),
        selectedProgram: p.selectedProgram || "INTERNSHIP",
        hospitalityType: p.hospitalityType || "",
        candidateStatus: p.candidateStatus || "NEW",
        trainingStatus: p.trainingStatus || "PENDING",
        trainingFee: p.trainingFee ?? 10,
        programFee: p.programFee ?? 0,
        notes: p.notes || "",
      });
      setOpenForm(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load candidate profile"));
    }
  };

  const openProfile = async (userId) => {
    try {
      const res = await getCandidateProfileByUserIdRequest(userId);
      setSelected(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load profile"));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Delete this candidate profile? This action cannot be undone.")) return;
    try {
      setSaving(true);
      await deleteCandidateProfileByUserIdRequest(userId);
      toast.success("Candidate profile deleted");
      await load();
      setSelected(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (patch) => {
    setForm((prev) => deriveProgramValues({ ...prev, ...patch }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = deriveProgramValues({
        ...form,
        otherSkills: form.otherSkills,
      });
      await upsertCandidateProfileByAdminRequest(payload);
      toast.success("Candidate registration saved");
      setOpenForm(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save candidate registration"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Candidate Profiles" subtitle="Register, filter, and manage candidate records">
        <Button onClick={openCreate}>Register Candidate</Button>
      </PageTitle>

      <ExcelImportPanel
        title="Excel Import - Candidate Registration"
        description="Columns: fullName, gender, contact, district, educationLevel, faculty, otherSkills, selectedProgram, hospitalityType, candidateStatus, trainingFee, programFee. ID No auto-generates."
        onImport={async (rows) => {
          const res = await importCandidateProfilesRequest(rows);
          await load();
          return res;
        }}
      />

      <div className="mb-4 grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-6">
        <Input
          label="Search (ID/Name/Contact)"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <Input
          label="District"
          value={filters.district}
          onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
        />
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Education</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={filters.educationLevel}
            onChange={(e) => setFilters((prev) => ({ ...prev, educationLevel: e.target.value }))}
          >
            <option value="">All</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Faculty"
          value={filters.faculty}
          onChange={(e) => setFilters((prev) => ({ ...prev, faculty: e.target.value }))}
        />
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Program</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={filters.selectedProgram}
            onChange={(e) => setFilters((prev) => ({ ...prev, selectedProgram: e.target.value }))}
          >
            <option value="">All</option>
            {selectedPrograms.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Training Status</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={filters.trainingStatus || ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, trainingStatus: e.target.value }))}
          >
            <option value="">All</option>
            {trainingStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 text-left">ID No</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Program</th>
                <th className="p-3 text-left">Training</th>
                <th className="p-3 text-left">Candidate Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3 font-medium text-slate-800">{p.idNo || "-"}</td>
                  <td className="p-3">{p.userId?.fullName || "-"}</td>
                  <td className="p-3 text-slate-600">{p.contact || p.userId?.email || p.userId?.phone || "-"}</td>
                  <td className="p-3">{p.selectedProgram || "-"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(p.trainingStatus)}`}>
                      {p.trainingStatus || "-"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge(p.candidateStatus)}`}>
                      {p.candidateStatus || "-"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openProfile(p.userId?._id || p.userId)}>
                        View
                      </Button>
                      <Button variant="secondary" onClick={() => openEdit(p.userId?._id || p.userId)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(p.userId?._id || p.userId)}
                        loading={saving}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={7}>
                    No candidate profiles found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={openForm} title="Candidate Registration" onClose={() => setOpenForm(false)} footer={null} size="xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-1">
            <Input
              label="ID No"
              value={form.idNo}
              onChange={() => {}}
              placeholder="Auto-generated (CAN...)"
              disabled
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => handleFormChange({ fullName: e.target.value })}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.gender}
                onChange={(e) => handleFormChange({ gender: e.target.value })}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input
              label="Contact"
              value={form.contact}
              onChange={(e) => handleFormChange({ contact: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="District"
              value={form.district}
              onChange={(e) => handleFormChange({ district: e.target.value })}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Education Level</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.educationLevel}
                onChange={(e) => handleFormChange({ educationLevel: e.target.value })}
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
              onChange={(e) => handleFormChange({ faculty: e.target.value })}
              required
            />
          </div>
          <Input
            label="Other Skills (comma separated)"
            value={form.otherSkills}
            onChange={(e) => handleFormChange({ otherSkills: e.target.value })}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Selected Program</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.selectedProgram}
                onChange={(e) => handleFormChange({ selectedProgram: e.target.value })}
              >
                {selectedPrograms.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>
            {form.selectedProgram === "HOSPITALITY" ? (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Hospitality Type</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  value={form.hospitalityType}
                  onChange={(e) => handleFormChange({ hospitalityType: e.target.value })}
                >
                  <option value="">Select type</option>
                  {hospitalityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Input label="Hospitality Type" value="N/A" disabled />
            )}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Training Status</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.trainingStatus}
                onChange={(e) => handleFormChange({ trainingStatus: e.target.value })}
              >
                {trainingStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Candidate Status</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.candidateStatus}
                onChange={(e) => handleFormChange({ candidateStatus: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select candidate status (what this candidate can do)
                </option>
                {candidateStatusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Status-kan ayaa go'aaminaya in candidate-ku heli karo training/internship/go-to-work.
              </p>
            </div>
            <Input
              label="Training Fee (USD)"
              type="number"
              min="0"
              value={form.trainingFee}
              onChange={(e) => handleFormChange({ trainingFee: Number(e.target.value || 0) })}
            />
            <Input
              label="Program Fee (USD)"
              type="number"
              min="0"
              value={form.programFee}
              onChange={(e) => handleFormChange({ programFee: Number(e.target.value || 0) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Notes / Remarks</label>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              rows={4}
              value={form.notes}
              onChange={(e) => handleFormChange({ notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save Candidate
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!selected} title="Candidate Profile" onClose={() => setSelected(null)} footer={null}>
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="ID No" value={selected.idNo || "-"} />
              <Info label="Full Name" value={selected.userId?.fullName || "-"} />
              <Info label="Contact" value={selected.contact || selected.userId?.email || selected.userId?.phone || "-"} />
              <Info label="District" value={selected.district || "-"} />
              <Info label="Education Level" value={selected.educationLevel || selected.education || "-"} />
              <Info label="Faculty" value={selected.faculty || "-"} />
              <Info label="Selected Program" value={selected.selectedProgram || "-"} />
              <Info label="Hospitality Type" value={selected.hospitalityType || "-"} />
              <Info label="Training Status" value={selected.trainingStatus || "-"} />
              <Info label="Candidate Status" value={selected.candidateStatus || "-"} />
              <Info label="Training Fee" value={`$${selected.trainingFee || 0}`} />
              <Info label="Program Fee" value={`$${selected.programFee || 0}`} />
              <Info label="Created" value={formatDate(selected.createdAt)} />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.skills?.length ? (
                  selected.skills.map((s) => (
                    <span key={s._id} className="rounded bg-slate-100 px-2 py-1 text-sm">
                      {s.name} ({s.level})
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No skills</span>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="font-medium text-slate-800">{value}</p>
  </div>
);

export default CandidateProfiles;
>>>>>>> 9129225 (Start real project changes)
