import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import { getCompaniesRequest } from "../../api/companies.api";
import {
  cancelMyInternshipRequest,
  getMyInternshipsRequest,
  requestInternshipRequest,
} from "../../api/internships.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const emptyForm = {
  companyId: "",
  position: "",
  startDate: "",
  endDate: "",
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
      await requestInternshipRequest(form);
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
              <p>
                Period: {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
              </p>
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
