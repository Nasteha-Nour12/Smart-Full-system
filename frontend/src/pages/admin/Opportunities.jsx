import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  createOpportunityRequest,
  deleteOpportunityRequest,
  getOpportunitiesRequest,
  updateOpportunityRequest,
  updateOpportunityStatusRequest,
} from "../../api/opportunities.api";
import { getCompaniesRequest } from "../../api/companies.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const emptyForm = {
  companyId: "",
  type: "JOB",
  title: "",
  description: "",
  requirements: "",
  location: "",
  deadline: "",
  status: "DRAFT",
};

const Opportunities = () => {
  const { user } = useSelector((state) => state.auth);
  const [opportunities, setOpportunities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [opRes, companyRes] = await Promise.all([
        getOpportunitiesRequest(),
        getCompaniesRequest(),
      ]);
      setOpportunities(opRes.data || []);
      setCompanies((companyRes.data || []).filter((company) => company.status === "APPROVED"));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load opportunities"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (opportunity) => {
    setEditing(opportunity);
    setForm({
      companyId: opportunity.companyId?._id || opportunity.companyId || "",
      type: opportunity.type || "JOB",
      title: opportunity.title || "",
      description: opportunity.description || "",
      requirements: opportunity.requirements || "",
      location: opportunity.location || "",
      deadline: opportunity.deadline?.slice(0, 10) || "",
      status: opportunity.status || "DRAFT",
    });
    setOpenForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await updateOpportunityRequest(editing._id, form);
      } else {
        await createOpportunityRequest(form);
      }
      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to save opportunity"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await deleteOpportunityRequest(selected._id);
      setConfirmOpen(false);
      setSelected(null);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete opportunity"));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateOpportunityStatusRequest(id, status);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update status"));
    }
  };

  return (
    <div>
      <PageTitle title="Opportunities" subtitle="Manage jobs and internships">
        <Button onClick={openCreate}>Add Opportunity</Button>
      </PageTitle>

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Deadline</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opportunity) => (
                <tr key={opportunity._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{opportunity.title}</p>
                    <p className="text-xs text-slate-500">{opportunity.location || "No location"}</p>
                  </td>
                  <td className="p-3">{opportunity.companyId?.name || "-"}</td>
                  <td className="p-3">{opportunity.type}</td>
                  <td className="p-3">{formatDate(opportunity.deadline)}</td>
                  <td className="p-3">{opportunity.status}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="secondary" onClick={() => openEdit(opportunity)}>
                        Edit
                      </Button>
                      {["DRAFT", "PUBLISHED", "CLOSED"].map((status) => (
                        <Button
                          key={status}
                          variant="secondary"
                          onClick={() => handleStatusChange(opportunity._id, status)}
                          disabled={opportunity.status === status}
                        >
                          {status}
                        </Button>
                      ))}
                      {user?.role === "ADMIN" ? (
                        <Button
                          variant="danger"
                          onClick={() => {
                            setSelected(opportunity);
                            setConfirmOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {opportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No opportunities found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        open={openForm}
        title={editing ? "Edit Opportunity" : "Add Opportunity"}
        onClose={() => setOpenForm(false)}
        footer={null}
      >
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
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="JOB">JOB</option>
                <option value="INTERNSHIP">INTERNSHIP</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          />
          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))}
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
            <label className="mb-1 block text-sm font-medium">Requirements</label>
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2"
              rows="4"
              value={form.requirements}
              onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              {editing ? "Update Opportunity" : "Create Opportunity"}
            </Button>
          </div>
        </form>
      </Modal>

      {user?.role === "ADMIN" ? (
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Opportunity"
          message={`Delete "${selected?.title}"?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          loading={saving}
        />
      ) : null}
    </div>
  );
};

export default Opportunities;
