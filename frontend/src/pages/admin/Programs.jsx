import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  createProgramRequest,
  deleteProgramRequest,
  getProgramsRequest,
  updateProgramRequest,
  updateProgramStatusRequest,
} from "../../api/programs.api";
import { formatCurrency, formatDate, getErrorMessage } from "../../utils/formatters";

const emptyForm = {
  title: "",
  type: "HOSPITALITY",
  description: "",
  startDate: "",
  endDate: "",
  seats: 1,
  fee: 0,
  status: "DRAFT",
};

const Programs = () => {
  const { user } = useSelector((state) => state.auth);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getProgramsRequest();
      setPrograms(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load programs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (program) => {
    setEditing(program);
    setForm({
      title: program.title || "",
      type: program.type || "HOSPITALITY",
      description: program.description || "",
      startDate: program.startDate?.slice(0, 10) || "",
      endDate: program.endDate?.slice(0, 10) || "",
      seats: program.seats || 1,
      fee: program.fee || 0,
      status: program.status || "DRAFT",
    });
    setOpenForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        seats: Number(form.seats),
        fee: Number(form.fee),
      };
      if (editing) {
        await updateProgramRequest(editing._id, payload);
      } else {
        await createProgramRequest(payload);
      }
      setOpenForm(false);
      setForm(emptyForm);
      setEditing(null);
      await loadPrograms();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to save program"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await deleteProgramRequest(selected._id);
      setConfirmOpen(false);
      setSelected(null);
      await loadPrograms();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete program"));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateProgramStatusRequest(id, status);
      await loadPrograms();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update program status"));
    }
  };

  return (
    <div>
      <PageTitle title="Programs" subtitle="Create and manage learning programs">
        <Button onClick={openCreate}>Add Program</Button>
      </PageTitle>

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Dates</th>
                <th className="p-3 text-left">Seats</th>
                <th className="p-3 text-left">Fee</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium text-slate-900">{program.title}</p>
                    <p className="text-xs text-slate-500">{program.description || "No description"}</p>
                  </td>
                  <td className="p-3">{program.type}</td>
                  <td className="p-3">
                    {formatDate(program.startDate)} - {formatDate(program.endDate)}
                  </td>
                  <td className="p-3">{program.seats}</td>
                  <td className="p-3">{formatCurrency(program.fee)}</td>
                  <td className="p-3">{program.status}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="secondary" onClick={() => openEdit(program)}>
                        Edit
                      </Button>
                      {["OPEN", "CLOSED", "DRAFT"].map((status) => (
                        <Button
                          key={status}
                          variant="secondary"
                          onClick={() => handleStatusChange(program._id, status)}
                          disabled={program.status === status}
                        >
                          {status}
                        </Button>
                      ))}
                      {user?.role === "ADMIN" ? (
                        <Button
                          variant="danger"
                          onClick={() => {
                            setSelected(program);
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
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">
                    No programs found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        open={openForm}
        title={editing ? "Edit Program" : "Add Program"}
        onClose={() => setOpenForm(false)}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              >
                <option value="HOSPITALITY">HOSPITALITY</option>
                <option value="SMART_SKILLS">SMART_SKILLS</option>
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
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2"
              rows="4"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
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
            <Input
              label="Seats"
              type="number"
              min="1"
              value={form.seats}
              onChange={(event) => setForm((prev) => ({ ...prev, seats: event.target.value }))}
              required
            />
            <Input
              label="Fee"
              type="number"
              min="0"
              value={form.fee}
              onChange={(event) => setForm((prev) => ({ ...prev, fee: event.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              {editing ? "Update Program" : "Create Program"}
            </Button>
          </div>
        </form>
      </Modal>

      {user?.role === "ADMIN" ? (
        <ConfirmDialog
          open={confirmOpen}
          title="Delete Program"
          message={`Delete "${selected?.title}"?`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          loading={saving}
        />
      ) : null}
    </div>
  );
};

export default Programs;
