import { useEffect, useState } from "react";
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
  updateInternshipStatusRequest,
} from "../../api/internships.api";
import { getCompaniesRequest } from "../../api/companies.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    companyId: "",
    position: "",
    startDate: "",
    endDate: "",
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
      const [internshipRes, companiesRes] = await Promise.all([
        getInternshipsRequest(),
        getCompaniesRequest(),
      ]);
      setInternships(internshipRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load internships"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

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
        companyId: "",
        position: "",
        startDate: "",
        endDate: "",
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

  return (
    <div>
      <PageTitle title="Internships" subtitle="Manage candidate internship requests and outcomes">
        <Button onClick={() => setOpenCreate(true)}>Add Internship</Button>
      </PageTitle>
      <ExcelImportPanel
        title="Excel Import - Internship Program"
        description="Required columns: candidateId OR (contact/phone/email), companyId, position, startDate, endDate, ID No, Full Name, Gender, Contact, District, Education Level, Faculty, Other Skills, Internship Status, Internship Fee, and file URL columns."
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
              {internships
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
                  <td className="p-3">{internship.position}</td>
                  <td className="p-3">
                    {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                  </td>
                  <td className="p-3">{internship.status}</td>
                  <td className="p-3">${internship.internshipFee || 0}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2 md:justify-end">
                      {["PENDING", "ACTIVE", "COMPLETED"].map((status) => (
                        <Button
                          key={status}
                          variant="secondary"
                          onClick={() => handleStatus(internship._id, status)}
                          disabled={internship.status === status}
                        >
                          {status}
                        </Button>
                      ))}
                      <Button variant="danger" onClick={() => handleDelete(internship._id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {internships.length === 0 ? (
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

      <Modal open={openCreate} title="Add Internship" onClose={() => setOpenCreate(false)} footer={null} size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-1">
            <Input label="ID No" value="" placeholder="Auto generated (IN001...)" disabled />
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
            <Input
              label="Education Level"
              value={createForm.educationLevel}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, educationLevel: event.target.value }))}
              required
            />
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
