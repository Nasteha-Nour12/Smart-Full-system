import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  deleteCertificateRequest,
  getCertificatesRequest,
  issueCertificateRequest,
} from "../../api/certificates.api";
import { getUsersRequest } from "../../api/user.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const emptyForm = {
  candidateId: "",
  sourceType: "PROGRAM",
  sourceId: "",
  certificateUrl: "",
  issuedAt: "",
};

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [certificateRes, usersRes] = await Promise.all([
        getCertificatesRequest(),
        getUsersRequest(),
      ]);
      setCertificates(certificateRes.data || []);
      setUsers((usersRes.data || []).filter((user) => user.role === "CANDIDATE"));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load certificates"));
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
      await issueCertificateRequest({
        ...form,
        issuedAt: form.issuedAt || undefined,
      });
      setOpenForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to issue certificate"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await deleteCertificateRequest(selected._id);
      setConfirmOpen(false);
      setSelected(null);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete certificate"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Certificates" subtitle="Issue and manage program or internship certificates">
        <Button onClick={() => setOpenForm(true)}>Issue Certificate</Button>
      </PageTitle>

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Source Type</th>
                <th className="p-3 text-left">Source ID</th>
                <th className="p-3 text-left">Issued</th>
                <th className="p-3 text-left">Link</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((certificate) => (
                <tr key={certificate._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">
                      {certificate.candidateId?.username || certificate.candidateId?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{certificate.candidateId?.email || "-"}</p>
                  </td>
                  <td className="p-3">{certificate.sourceType}</td>
                  <td className="p-3">{certificate.sourceId}</td>
                  <td className="p-3">{formatDate(certificate.issuedAt)}</td>
                  <td className="p-3">
                    <a
                      href={certificate.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open
                    </a>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="danger"
                      onClick={() => {
                        setSelected(certificate);
                        setConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No certificates found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={openForm} title="Issue Certificate" onClose={() => setOpenForm(false)} footer={null}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Candidate</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={form.candidateId}
              onChange={(event) => setForm((prev) => ({ ...prev, candidateId: event.target.value }))}
              required
            >
              <option value="">Select candidate</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Source Type</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.sourceType}
                onChange={(event) => setForm((prev) => ({ ...prev, sourceType: event.target.value }))}
              >
                <option value="PROGRAM">PROGRAM</option>
                <option value="INTERNSHIP">INTERNSHIP</option>
              </select>
            </div>
            <Input
              label="Source ID"
              value={form.sourceId}
              onChange={(event) => setForm((prev) => ({ ...prev, sourceId: event.target.value }))}
              required
            />
          </div>
          <Input
            label="Certificate URL"
            value={form.certificateUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, certificateUrl: event.target.value }))}
            required
          />
          <Input
            label="Issued At"
            type="date"
            value={form.issuedAt}
            onChange={(event) => setForm((prev) => ({ ...prev, issuedAt: event.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Issue Certificate
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
};

export default Certificates;
