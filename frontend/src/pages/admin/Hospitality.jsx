import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import PageTitle from "../../components/common/PageTitle";
import {
  createHospitalityProgramRequest,
  getHospitalityProgramByIdRequest,
  getHospitalityProgramsRequest,
  updateHospitalityProgramRequest,
} from "../../api/hospitalityPrograms.api";
import { getErrorMessage } from "../../utils/formatters";

const hospitalityTypes = ["NO_SKILL", "HAVE_SKILL_NO_EXPERIENCE", "HAVE_SKILL_AND_EXPERIENCE"];

const emptyForm = {
  idNo: "",
  fullName: "",
  gender: "MALE",
  contact: "",
  district: "",
  educationLevel: "",
  faculty: "",
  otherSkills: "",
  hospitalityType: "NO_SKILL",
  assignedResult: "TRAINING",
  duration: "2 Months",
  fee: 60,
  status: "PENDING",
  notes: "",
};

const computeByType = (type) => {
  if (type === "NO_SKILL") {
    return { assignedResult: "TRAINING", duration: "2 Months", fee: 60 };
  }
  if (type === "HAVE_SKILL_NO_EXPERIENCE") {
    return { assignedResult: "INTERNSHIP_RECOMMENDATION", duration: "", fee: 0 };
  }
  return { assignedResult: "GO_TO_WORK_RECOMMENDATION", duration: "", fee: 0 };
};

const Hospitality = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    q: "",
    district: "",
    educationLevel: "",
    faculty: "",
    hospitalityType: "",
    status: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getHospitalityProgramsRequest({
        q: filters.q || undefined,
        district: filters.district || undefined,
        educationLevel: filters.educationLevel || undefined,
        faculty: filters.faculty || undefined,
        hospitalityType: filters.hospitalityType || undefined,
        status: filters.status || undefined,
      });
      setRows(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load hospitality records"));
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.district, filters.educationLevel, filters.faculty, filters.hospitalityType, filters.status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingId("");
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = async (id) => {
    try {
      const res = await getHospitalityProgramByIdRequest(id);
      const row = res.data;
      setEditingId(id);
      setForm({
        idNo: row.idNo || "",
        fullName: row.fullName || "",
        gender: row.gender || "MALE",
        contact: row.contact || "",
        district: row.district || "",
        educationLevel: row.educationLevel || "",
        faculty: row.faculty || "",
        otherSkills: (row.otherSkills || []).join(", "),
        hospitalityType: row.hospitalityType || "NO_SKILL",
        assignedResult: row.assignedResult || "",
        duration: row.duration || "",
        fee: row.fee || 0,
        status: row.status || "PENDING",
        notes: row.notes || "",
      });
      setOpenForm(true);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load hospitality record"));
    }
  };

  const openDetail = async (id) => {
    try {
      const res = await getHospitalityProgramByIdRequest(id);
      setSelected(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load detail"));
    }
  };

  const onTypeChange = (type) => {
    setForm((prev) => ({ ...prev, hospitalityType: type, ...computeByType(type) }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        otherSkills: form.otherSkills,
      };
      if (editingId) {
        await updateHospitalityProgramRequest(editingId, payload);
        toast.success("Hospitality record updated");
      } else {
        await createHospitalityProgramRequest(payload);
        toast.success("Hospitality record created");
      }
      setOpenForm(false);
      setForm(emptyForm);
      setEditingId("");
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save hospitality record"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Hospitality Program" subtitle="Create, edit, filter and review hospitality registrations">
        <Button onClick={openCreate}>Add Hospitality</Button>
      </PageTitle>

      <div className="mb-4 grid gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-6">
        <Input label="Search (ID/Name/Contact)" value={filters.q} onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))} />
        <Input label="District" value={filters.district} onChange={(e) => setFilters((p) => ({ ...p, district: e.target.value }))} />
        <Input
          label="Education Level"
          value={filters.educationLevel}
          onChange={(e) => setFilters((p) => ({ ...p, educationLevel: e.target.value }))}
        />
        <Input label="Faculty" value={filters.faculty} onChange={(e) => setFilters((p) => ({ ...p, faculty: e.target.value }))} />
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Hospitality Type</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={filters.hospitalityType}
            onChange={(e) => setFilters((p) => ({ ...p, hospitalityType: e.target.value }))}
          >
            <option value="">All</option>
            {hospitalityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <Input label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} />
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
                <th className="p-3 text-left">Hospitality Type</th>
                <th className="p-3 text-left">Assigned Result</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="p-3">{row.idNo}</td>
                  <td className="p-3">{row.fullName}</td>
                  <td className="p-3">{row.hospitalityType}</td>
                  <td className="p-3">{row.assignedResult}</td>
                  <td className="p-3">${row.fee}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openDetail(row._id)}>
                        Detail
                      </Button>
                      <Button variant="secondary" onClick={() => openEdit(row._id)}>
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">
                    No hospitality records found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={openForm} title={editingId ? "Edit Hospitality" : "Create Hospitality"} onClose={() => setOpenForm(false)} footer={null} size="xl">
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="ID No" value={form.idNo} onChange={(e) => setForm((p) => ({ ...p, idNo: e.target.value }))} required />
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Gender</label>
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input label="Contact" value={form.contact} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} required />
            <Input label="District" value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} required />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Education Level"
              value={form.educationLevel}
              onChange={(e) => setForm((p) => ({ ...p, educationLevel: e.target.value }))}
              required
            />
            <Input label="Faculty" value={form.faculty} onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))} required />
            <Input
              label="Other Skills"
              value={form.otherSkills}
              onChange={(e) => setForm((p) => ({ ...p, otherSkills: e.target.value }))}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Hospitality Type</label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                value={form.hospitalityType}
                onChange={(e) => onTypeChange(e.target.value)}
              >
                {hospitalityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Assigned Result" value={form.assignedResult} disabled />
            <Input label="Duration" value={form.duration} disabled />
            <Input label="Fee (USD)" type="number" value={form.fee} disabled />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} />
            <Input label="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              {editingId ? "Update Hospitality" : "Create Hospitality"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!selected} title="Hospitality Detail" onClose={() => setSelected(null)} footer={null}>
        {selected ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Detail label="ID No" value={selected.idNo} />
            <Detail label="Full Name" value={selected.fullName} />
            <Detail label="Gender" value={selected.gender} />
            <Detail label="Contact" value={selected.contact} />
            <Detail label="District" value={selected.district} />
            <Detail label="Education Level" value={selected.educationLevel} />
            <Detail label="Faculty" value={selected.faculty} />
            <Detail label="Other Skills" value={(selected.otherSkills || []).join(", ") || "-"} />
            <Detail label="Hospitality Type" value={selected.hospitalityType} />
            <Detail label="Assigned Result" value={selected.assignedResult} />
            <Detail label="Duration" value={selected.duration || "-"} />
            <Detail label="Fee" value={`$${selected.fee || 0}`} />
            <Detail label="Status" value={selected.status} />
            <Detail label="Notes" value={selected.notes || "-"} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="font-medium text-slate-800">{value}</p>
  </div>
);

export default Hospitality;
