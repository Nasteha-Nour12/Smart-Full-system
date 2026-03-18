import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import {
  createCompanyRequest,
  getCompaniesRequest,
  updateCompanyRequest,
} from "../../api/companies.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const emptyForm = {
  name: "",
  industry: "",
  location: "",
  description: "",
  position: [],
};

const positions = ["IT Manager", "Accounting", "Sales", "Marketing"];

const CompanyProfile = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getCompaniesRequest();
      setCompanies(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load companies"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (company) => {
    setEditing(company);
    setForm({
      name: company.name || "",
      industry: company.industry || "",
      location: company.location || "",
      description: company.description || "",
      position: company.position || [],
    });
    setOpenForm(true);
  };

  const handlePosition = (position) => {
    setForm((prev) => ({
      ...prev,
      position: prev.position.includes(position)
        ? prev.position.filter((item) => item !== position)
        : [...prev.position, position],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await updateCompanyRequest(editing._id, form);
      } else {
        await createCompanyRequest(form);
      }
      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      await loadCompanies();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to save company"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Company Profile" subtitle="Create or update company records">
        <Button onClick={openCreate}>Add Company</Button>
      </PageTitle>
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {companies.map((company) => (
          <div key={company._id} className="rounded-xl bg-white p-5 shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{company.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {company.industry} • {company.location}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{company.status}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{company.description || "No description"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {company.position?.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Updated: {formatDate(company.updatedAt)}</p>
            <Button variant="secondary" className="mt-4" onClick={() => openEdit(company)}>
              Edit Company
            </Button>
          </div>
        ))}
      </div>

      {!loading && companies.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow">
          No company profile created yet
        </div>
      ) : null}

      <Modal
        open={openForm}
        title={editing ? "Edit Company" : "Add Company"}
        onClose={() => setOpenForm(false)}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <Input
              label="Industry"
              value={form.industry}
              onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))}
              required
            />
          </div>
          <Input
            label="Location"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2"
              rows="4"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Positions</label>
            <div className="grid gap-2 md:grid-cols-2">
              {positions.map((position) => (
                <label key={position} className="flex items-center gap-2 rounded border border-slate-200 p-2">
                  <input
                    type="checkbox"
                    checked={form.position.includes(position)}
                    onChange={() => handlePosition(position)}
                  />
                  <span>{position}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              {editing ? "Update Company" : "Create Company"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CompanyProfile;
