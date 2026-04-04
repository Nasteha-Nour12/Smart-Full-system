import { useEffect, useState } from "react";
import FileUploadField from "../../components/common/FileUploadField";
import ExcelImportPanel from "../../components/common/ExcelImportPanel";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { getCompaniesRequest } from "../../api/companies.api";
import {
  submitGoToWorkRequest,
  getGoToWorkRequests,
  importGoToWorkRequest,
  updateGoToWorkRequest,
  updateGoToWorkStatusRequest,
} from "../../api/goToWork.api";
import { formatDateTime, getErrorMessage } from "../../utils/formatters";

const GoToWork = () => {
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    status: "SUBMITTED",
    matchedCompanyId: "",
    interviewDate: "",
    contractUrl: "",
    readinessStatus: "READY",
    interviewStatus: "PENDING",
    placementStatus: "IN_QUEUE",
    jobTitle: "",
    workLocation: "",
    notes: "",
  });
  const [createForm, setCreateForm] = useState({
    candidateId: "",
    fullName: "",
    contact: "",
    notes: "",
    status: "SUBMITTED",
    matchedCompanyId: "",
    interviewDate: "",
    contractUrl: "",
    readinessStatus: "READY",
    interviewStatus: "PENDING",
    placementStatus: "IN_QUEUE",
    jobTitle: "",
    workLocation: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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
      readinessStatus: request.readinessStatus || "READY",
      interviewStatus: request.interviewStatus || "PENDING",
      placementStatus: request.placementStatus || "IN_QUEUE",
      jobTitle: request.jobTitle || "",
      workLocation: request.workLocation || "",
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

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await submitGoToWorkRequest({
        ...createForm,
        matchedCompanyId: createForm.matchedCompanyId || null,
        interviewDate: createForm.interviewDate || null,
      });
      setOpenCreate(false);
      setCreateForm({
        candidateId: "",
        fullName: "",
        contact: "",
        notes: "",
        status: "SUBMITTED",
        matchedCompanyId: "",
        interviewDate: "",
        contractUrl: "",
        readinessStatus: "READY",
        interviewStatus: "PENDING",
        placementStatus: "IN_QUEUE",
        jobTitle: "",
        workLocation: "",
      });
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to create Shaqo Tag request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Shaqo Tag" subtitle="Handle job-placement requests and company matching">
        <Button onClick={() => setOpenCreate(true)}>Add Shaqo Tag</Button>
      </PageTitle>
      <ExcelImportPanel
        title="Excel Import - Go To Work"
        description="Required columns: candidateId OR (contact/phone/email), status, matchedCompanyId, interviewDate, contractUrl/contract letter, notes."
        onImport={async (rows) => {
          const res = await importGoToWorkRequest(rows);
          await loadData();
          return res;
        }}
      />
      <div className="mb-4 max-w-md">
        <Input
          label="Search by Name or Contact"
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
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Placement</th>
                <th className="p-3 text-left">Matched Company</th>
                <th className="p-3 text-left">Interview</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests
                .filter((request) => {
                  const key = search.toLowerCase();
                  if (!key) return true;
                  return (
                    String(request.candidateId?.fullName || "").toLowerCase().includes(key) ||
                    String(request.candidateId?.phone || request.candidateId?.email || "").toLowerCase().includes(key)
                  );
                })
                .map((request) => (
                <tr key={request._id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">
                      {request.candidateId?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-500">{request.candidateId?.phone || request.candidateId?.email || "-"}</p>
                  </td>
                  <td className="p-3">{request.status}</td>
                  <td className="p-3">{request.placementStatus || "-"}</td>
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
                  <td colSpan={6} className="p-4 text-center text-slate-500">
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
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Readiness Status"
                value={form.readinessStatus}
                onChange={(event) => setForm((prev) => ({ ...prev, readinessStatus: event.target.value }))}
              />
              <Input
                label="Interview Status"
                value={form.interviewStatus}
                onChange={(event) => setForm((prev) => ({ ...prev, interviewStatus: event.target.value }))}
              />
              <Input
                label="Placement Status"
                value={form.placementStatus}
                onChange={(event) => setForm((prev) => ({ ...prev, placementStatus: event.target.value }))}
              />
              <Input
                label="Job Title"
                value={form.jobTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
              />
            </div>
            <Input
              label="Work Location"
              value={form.workLocation}
              onChange={(event) => setForm((prev) => ({ ...prev, workLocation: event.target.value }))}
            />
            <FileUploadField
              label="Contract File"
              value={form.contractUrl}
              accept=".pdf,.doc,.docx,image/*"
              buttonLabel="Upload Contract"
              helperText="Upload signed contract ama offer letter"
              onUploaded={(url) => setForm((prev) => ({ ...prev, contractUrl: url }))}
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

      <Modal open={openCreate} title="Add Shaqo Tag" onClose={() => setOpenCreate(false)} footer={null} size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Candidate User ID (optional)"
              value={createForm.candidateId}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, candidateId: event.target.value }))}
            />
            <Input
              label="Full Name"
              value={createForm.fullName}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <Input
              label="Contact"
              value={createForm.contact}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, contact: event.target.value }))}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={createForm.status}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, status: event.target.value }))}
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
                value={createForm.matchedCompanyId}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, matchedCompanyId: event.target.value }))
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
          </div>
          <Input
            label="Interview Date"
            type="datetime-local"
            value={createForm.interviewDate}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, interviewDate: event.target.value }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Readiness Status"
              value={createForm.readinessStatus}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, readinessStatus: event.target.value }))}
            />
            <Input
              label="Interview Status"
              value={createForm.interviewStatus}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, interviewStatus: event.target.value }))}
            />
            <Input
              label="Placement Status"
              value={createForm.placementStatus}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, placementStatus: event.target.value }))}
            />
            <Input
              label="Job Title"
              value={createForm.jobTitle}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, jobTitle: event.target.value }))}
            />
          </div>
          <Input
            label="Work Location"
            value={createForm.workLocation}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, workLocation: event.target.value }))}
          />
          <FileUploadField
            label="Contract File"
            value={createForm.contractUrl}
            accept=".pdf,.doc,.docx,image/*"
            buttonLabel="Upload Contract"
            helperText="Upload signed contract ama offer letter"
            onUploaded={(url) => setCreateForm((prev) => ({ ...prev, contractUrl: url }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2"
              rows="4"
              value={createForm.notes}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Create Shaqo Tag
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GoToWork;
