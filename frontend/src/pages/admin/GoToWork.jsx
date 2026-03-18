import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { getCompaniesRequest } from "../../api/companies.api";
import {
  getGoToWorkRequests,
  updateGoToWorkRequest,
  updateGoToWorkStatusRequest,
} from "../../api/goToWork.api";
import { formatDateTime, getErrorMessage } from "../../utils/formatters";

const GoToWork = () => {
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    status: "SUBMITTED",
    matchedCompanyId: "",
    interviewDate: "",
    contractUrl: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [requestRes, companiesRes] = await Promise.all([
        getGoToWorkRequests(),
        getCompaniesRequest(),
      ]);
      setRequests(requestRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load Go To Work requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openManage = (request) => {
    setSelected(request);
    setForm({
      status: request.status || "SUBMITTED",
      matchedCompanyId: request.matchedCompanyId?._id || "",
      interviewDate: request.interviewDate?.slice(0, 16) || "",
      contractUrl: request.contractUrl || "",
      notes: request.notes || "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGoToWorkRequest(selected._id, {
        ...form,
        matchedCompanyId: form.matchedCompanyId || null,
        interviewDate: form.interviewDate || null,
      });
      setSelected(null);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update request"));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (id, status) => {
    try {
      await updateGoToWorkStatusRequest(id, status);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update status"));
    }
  };

  return (
    <div>
      <PageTitle title="Go To Work" subtitle="Handle job-placement requests and company matching" />

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Matched Company</th>
                <th className="p-3 text-left">Interview</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">
                      {request.candidateId?.username || request.candidateId?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{request.candidateId?.email || "-"}</p>
                  </td>
                  <td className="p-3">{request.status}</td>
                  <td className="p-3">{request.matchedCompanyId?.name || "-"}</td>
                  <td className="p-3">{formatDateTime(request.interviewDate)}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="secondary" onClick={() => openManage(request)}>
                        Manage
                      </Button>
                      {["SCREENING", "MATCHING", "INTERVIEW", "PLACED", "REJECTED"].map((status) => (
                        <Button
                          key={status}
                          variant="secondary"
                          onClick={() => handleQuickStatus(request._id, status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    No requests found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={!!selected} title="Manage Go To Work" onClose={() => setSelected(null)} footer={null}>
        {selected ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="SCREENING">SCREENING</option>
                <option value="MATCHING">MATCHING</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="CONTRACT">CONTRACT</option>
                <option value="PLACED">PLACED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Matched Company</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={form.matchedCompanyId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, matchedCompanyId: event.target.value }))
                }
              >
                <option value="">No company selected</option>
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Interview Date"
              type="datetime-local"
              value={form.interviewDate}
              onChange={(event) => setForm((prev) => ({ ...prev, interviewDate: event.target.value }))}
            />
            <Input
              label="Contract URL"
              value={form.contractUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, contractUrl: event.target.value }))}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                className="w-full rounded border border-slate-300 px-3 py-2"
                rows="4"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default GoToWork;
