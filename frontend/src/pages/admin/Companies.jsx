import { useEffect, useMemo, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  createCompanyRequest,
  getCompaniesRequest,
  getCompanyByIdRequest,
  updateCompanyRequest,
  deleteCompanyRequest,
  updateCompanyStatusRequest,
} from "../../api/companies.api";

/* ================= DEFAULT FORM ================= */
const emptyForm = {
  name: "",
  industry: "",
  location: "",
  description: "",
  position: [],
  status: "PENDING",
};

const positionOptions = ["IT Manager", "Accounting", "Sales", "Marketing"];

const Companies = () => {
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ================= LOAD ================= */
  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getCompaniesRequest();
      setCompanies(res?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  /* ================= MODAL OPEN ================= */
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (company) => {
    setEditing(company);
    setForm({
      name: company?.name || "",
      industry: company?.industry || "",
      location: company?.location || "",
      description: company?.description || "",
      position: company?.position || [],
      status: company?.status || "PENDING",
    });
    setOpenForm(true);
  };

  const openView = async (company) => {
    try {
      const res = await getCompanyByIdRequest(company._id);
      setViewing(res?.data || company);
    } catch {
      setViewing(company);
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (item) => {
    setForm((prev) => {
      const exists = prev.position.includes(item);

      return {
        ...prev,
        position: exists
          ? prev.position.filter((p) => p !== item)
          : [...prev.position, item],
      };
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      industry: form.industry,
      location: form.location,
      description: form.description,
      position: form.position,
      status: form.status,
    };

    try {
      if (editing) {
        await updateCompanyRequest(editing._id, payload);
      } else {
        await createCompanyRequest(payload);
      }

      setOpenForm(false);
      setForm(emptyForm);
      setEditing(null);
      await loadCompanies();
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    try {
      await deleteCompanyRequest(selected._id);
      setConfirmOpen(false);
      setSelected(null);
      await loadCompanies();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  /* ================= STATUS UPDATE ================= */
  const handleStatusChange = async (id, status) => {
    try {
      await updateCompanyStatusRequest(id, status);
      await loadCompanies();
    } catch (err) {
      alert(err?.response?.data?.message || "Status update failed");
    }
  };

  /* ================= UI HELPERS ================= */
  const statusBadge = (status) => {
    const map = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };

    return map[status] || "bg-slate-100 text-slate-700";
  };

  const tableRows = useMemo(() => companies || [], [companies]);

  return (
    <div>
      <PageTitle title="Companies" subtitle="Manage all companies">
        <Button onClick={openCreate}>Add Company</Button>
      </PageTitle>

      {loading && <Loader />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Company Name</th>
                <th className="p-3 text-left">Industry</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Positions</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((company) => (
                <tr key={company._id} className="border-t">
                  <td className="p-3 font-semibold">{company.name}</td>
                  <td className="p-3">{company.industry}</td>
                  <td className="p-3">{company.location}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {company.position?.length > 0 ? (
                        company.position.map((pos, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs"
                          >
                            {pos}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400">No positions</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge(
                        company.status
                      )}`}
                    >
                      {company.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="secondary" onClick={() => openView(company)}>
                      View
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => openEdit(company)}
                    >
                      Edit
                    </Button>

                    {company.status !== "APPROVED" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleStatusChange(company._id, "APPROVED")
                        }
                      >
                        Approve
                      </Button>
                    )}

                    {company.status !== "REJECTED" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleStatusChange(company._id, "REJECTED")
                        }
                      >
                        Reject
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      onClick={() => {
                        setSelected(company);
                        setConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}

              {tableRows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={6}>
                    No companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= CREATE / EDIT MODAL ================= */}
      <Modal
        open={openForm}
        title={editing ? "Edit Company" : "Add Company"}
        onClose={() => setOpenForm(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Company Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Industry"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
            <Input
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows="4"
              className="w-full border p-2 rounded"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter company description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Positions</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {positionOptions.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 border rounded p-2"
                >
                  <input
                    type="checkbox"
                    checked={form.position.includes(item)}
                    onChange={() => handlePositionChange(item)}
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {editing && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border p-2 rounded"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          )}

          <Button type="submit">{editing ? "Update" : "Create"}</Button>
        </form>
      </Modal>

      {/* ================= VIEW MODAL ================= */}
      <Modal
        open={!!viewing}
        title="Company Details"
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-3 text-sm">
            <p>
              <b>Name:</b> {viewing.name}
            </p>
            <p>
              <b>Industry:</b> {viewing.industry}
            </p>
            <p>
              <b>Location:</b> {viewing.location}
            </p>
            <p>
              <b>Description:</b> {viewing.description || "-"}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge(
                  viewing.status
                )}`}
              >
                {viewing.status}
              </span>
            </p>

            <div className="pt-2 border-t">
              <p className="font-semibold mb-2">Positions</p>
              <div className="flex flex-wrap gap-2">
                {viewing.position?.length > 0 ? (
                  viewing.position.map((pos, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs"
                    >
                      {pos}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No positions</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t text-slate-500">
              <p>
                <b>Created At:</b>{" "}
                {viewing.createdAt
                  ? new Date(viewing.createdAt).toLocaleDateString()
                  : "-"}
              </p>
              <p>
                <b>Updated At:</b>{" "}
                {viewing.updatedAt
                  ? new Date(viewing.updatedAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= DELETE ================= */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Company"
        message={`Delete "${selected?.name}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Companies;
