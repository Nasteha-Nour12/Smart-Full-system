import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import FileUploadField from "../../components/common/FileUploadField";
import {
  getAllCandidateProfilesRequest,
  upsertCandidateProfileByAdminRequest,
} from "../../api/candidateProfiles.api";
import { getErrorMessage } from "../../utils/formatters";

const docState = (url, status) => {
  if (status) return status;
  return url ? "UPLOADED" : "MISSING";
};

const statusOptions = ["MISSING", "UPLOADED", "PENDING_VERIFICATION", "VERIFIED"];

const toPayload = (profile, form) => ({
  userId: profile.userId?._id || profile.userId,
  idNo: profile.idNo || "",
  fullName: profile.userId?.fullName || "",
  contact: profile.contact || profile.userId?.phone || profile.userId?.email || "",
  district: profile.district || "",
  educationLevel: profile.educationLevel || profile.education || "",
  faculty: profile.faculty || "",
  otherSkills: (profile.skills || []).map((s) => s.name).join(", "),
  selectedProgram: profile.selectedProgram || "INTERNSHIP",
  hospitalityType: profile.hospitalityType || "",
  candidateStatus: profile.candidateStatus || "NEW",
  trainingStatus: profile.trainingStatus || "PENDING",
  trainingFee: profile.trainingFee || 0,
  programFee: profile.programFee || 0,
  notes: profile.notes || "",
  cvUrl: form.cvUrl,
  coverLetterUrl: form.coverLetterUrl,
  idUrl: form.idUrl,
  secondaryCertificateUrl: form.secondaryCertificateUrl,
  universityCertificateUrl: form.universityCertificateUrl,
  passportPhoto1Url: form.passportPhoto1Url,
  passportPhoto2Url: form.passportPhoto2Url,
  contractLetterUrl: form.contractLetterUrl,
  documents: {
    cv: { status: form.cvStatus },
    coverLetter: { status: form.coverLetterStatus },
    nationalId: { status: form.nationalIdStatus },
    secondaryCertificate: { status: form.secondaryCertificateStatus },
    universityCertificate: { status: form.universityCertificateStatus },
    passportPhoto1: { status: form.passportPhoto1Status },
    passportPhoto2: { status: form.passportPhoto2Status },
    contractLetter: { status: form.contractLetterStatus },
  },
});

const toForm = (profile) => ({
  cvUrl: profile.cvUrl || "",
  coverLetterUrl: profile.coverLetterUrl || "",
  idUrl: profile.idUrl || "",
  secondaryCertificateUrl: profile.secondaryCertificateUrl || "",
  universityCertificateUrl: profile.universityCertificateUrl || "",
  passportPhoto1Url: profile.passportPhoto1Url || "",
  passportPhoto2Url: profile.passportPhoto2Url || "",
  contractLetterUrl: profile.contractLetterUrl || "",
  cvStatus: docState(profile.cvUrl, profile.documents?.cv?.status),
  coverLetterStatus: docState(profile.coverLetterUrl, profile.documents?.coverLetter?.status),
  nationalIdStatus: docState(profile.idUrl, profile.documents?.nationalId?.status),
  secondaryCertificateStatus: docState(
    profile.secondaryCertificateUrl,
    profile.documents?.secondaryCertificate?.status
  ),
  universityCertificateStatus: docState(
    profile.universityCertificateUrl,
    profile.documents?.universityCertificate?.status
  ),
  passportPhoto1Status: docState(profile.passportPhoto1Url, profile.documents?.passportPhoto1?.status),
  passportPhoto2Status: docState(profile.passportPhoto2Url, profile.documents?.passportPhoto2?.status),
  contractLetterStatus: docState(profile.contractLetterUrl, profile.documents?.contractLetter?.status),
});

const Documents = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllCandidateProfilesRequest();
      setRows(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load candidate documents"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return rows;
    return rows.filter((r) => {
      const name = String(r.userId?.fullName || "").toLowerCase();
      const idNo = String(r.idNo || "").toLowerCase();
      const contact = String(r.contact || r.userId?.phone || r.userId?.email || "").toLowerCase();
      return name.includes(key) || idNo.includes(key) || contact.includes(key);
    });
  }, [rows, search]);

  const openManage = (row) => {
    setSelected(row);
    setForm(toForm(row));
  };

  const saveDocuments = async () => {
    if (!selected || !form) return;
    try {
      setSaving(true);
      await upsertCandidateProfileByAdminRequest(toPayload(selected, form));
      setSelected(null);
      setForm(null);
      await load();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to save documents"));
    } finally {
      setSaving(false);
    }
  };

  const exportExcel = () => {
    const dataset = filtered.map((r) => ({
      idNo: r.idNo || "",
      fullName: r.userId?.fullName || "",
      contact: r.contact || r.userId?.phone || r.userId?.email || "",
      cv: r.cvUrl || "",
      cvStatus: docState(r.cvUrl, r.documents?.cv?.status),
      coverLetter: r.coverLetterUrl || "",
      coverLetterStatus: docState(r.coverLetterUrl, r.documents?.coverLetter?.status),
      nationalId: r.idUrl || "",
      nationalIdStatus: docState(r.idUrl, r.documents?.nationalId?.status),
      secondaryCertificate: r.secondaryCertificateUrl || "",
      secondaryCertificateStatus: docState(r.secondaryCertificateUrl, r.documents?.secondaryCertificate?.status),
      universityCertificate: r.universityCertificateUrl || "",
      universityCertificateStatus: docState(r.universityCertificateUrl, r.documents?.universityCertificate?.status),
      passportPhoto1: r.passportPhoto1Url || "",
      passportPhoto1Status: docState(r.passportPhoto1Url, r.documents?.passportPhoto1?.status),
      passportPhoto2: r.passportPhoto2Url || "",
      passportPhoto2Status: docState(r.passportPhoto2Url, r.documents?.passportPhoto2?.status),
      contractLetter: r.contractLetterUrl || "",
      contractLetterStatus: docState(r.contractLetterUrl, r.documents?.contractLetter?.status),
    }));
    const ws = XLSX.utils.json_to_sheet(dataset);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Documents");
    XLSX.writeFile(wb, "documents-report.xlsx");
  };

  const printTable = () => {
    const rowsHtml = filtered
      .map(
        (r) =>
          `<tr>
            <td>${r.idNo || "-"}</td>
            <td>${r.userId?.fullName || "-"}</td>
            <td>${docState(r.cvUrl, r.documents?.cv?.status)}</td>
            <td>${docState(r.coverLetterUrl, r.documents?.coverLetter?.status)}</td>
            <td>${docState(r.idUrl, r.documents?.nationalId?.status)}</td>
            <td>${docState(r.secondaryCertificateUrl, r.documents?.secondaryCertificate?.status)}</td>
            <td>${docState(r.universityCertificateUrl, r.documents?.universityCertificate?.status)}</td>
            <td>${docState(r.contractLetterUrl, r.documents?.contractLetter?.status)}</td>
          </tr>`
      )
      .join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Documents Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2>Smart Employment System - Documents</h2>
          <table>
            <thead>
              <tr>
                <th>ID No</th><th>Candidate</th><th>CV</th><th>Cover</th><th>National ID</th><th>Secondary</th><th>University</th><th>Contract</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div>
      <PageTitle title="Documents" subtitle="Upload, store, download, print and export candidate documents">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportExcel}>
            Download Excel
          </Button>
          <Button variant="secondary" onClick={printTable}>
            Print
          </Button>
        </div>
      </PageTitle>
      <div className="mb-4 max-w-md">
        <Input
          label="Search (ID, Name, Contact)"
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
                <th className="p-3 text-left">ID No</th>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">CV</th>
                <th className="p-3 text-left">Cover Letter</th>
                <th className="p-3 text-left">National ID</th>
                <th className="p-3 text-left">Secondary Cert</th>
                <th className="p-3 text-left">University Cert</th>
                <th className="p-3 text-left">Passport Photos</th>
                <th className="p-3 text-left">Contract</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.idNo || "-"}</td>
                  <td className="p-3">{r.userId?.fullName || "-"}</td>
                  <td className="p-3">{docState(r.cvUrl, r.documents?.cv?.status)}</td>
                  <td className="p-3">{docState(r.coverLetterUrl, r.documents?.coverLetter?.status)}</td>
                  <td className="p-3">{docState(r.idUrl, r.documents?.nationalId?.status)}</td>
                  <td className="p-3">{docState(r.secondaryCertificateUrl, r.documents?.secondaryCertificate?.status)}</td>
                  <td className="p-3">{docState(r.universityCertificateUrl, r.documents?.universityCertificate?.status)}</td>
                  <td className="p-3">
                    {docState(r.passportPhoto1Url, r.documents?.passportPhoto1?.status)} /{" "}
                    {docState(r.passportPhoto2Url, r.documents?.passportPhoto2?.status)}
                  </td>
                  <td className="p-3">{docState(r.contractLetterUrl, r.documents?.contractLetter?.status)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openManage(r)}>
                        Upload/Manage
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const urls = [
                            r.cvUrl,
                            r.coverLetterUrl,
                            r.idUrl,
                            r.secondaryCertificateUrl,
                            r.universityCertificateUrl,
                            r.passportPhoto1Url,
                            r.passportPhoto2Url,
                            r.contractLetterUrl,
                          ].filter(Boolean);
                          if (!urls.length) {
                            alert("No document uploaded for this candidate.");
                            return;
                          }
                          urls.forEach((url) => window.open(url, "_blank"));
                        }}
                      >
                        Download/View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-4 text-center text-slate-500">
                    No candidates found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal open={!!selected && !!form} title="Manage Documents" onClose={() => setSelected(null)} footer={null} size="full">
        {selected && form ? (
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-semibold">{selected.userId?.fullName || "-"}</p>
              <p>ID: {selected.idNo || "-"}</p>
            </div>

            <DocumentRow
              label="CV"
              url={form.cvUrl}
              status={form.cvStatus}
              onUpload={(url) => setForm((p) => ({ ...p, cvUrl: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, cvStatus: value }))}
              onDelete={() => setForm((p) => ({ ...p, cvUrl: "", cvStatus: "MISSING" }))}
            />
            <DocumentRow
              label="Cover Letter"
              url={form.coverLetterUrl}
              status={form.coverLetterStatus}
              onUpload={(url) => setForm((p) => ({ ...p, coverLetterUrl: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, coverLetterStatus: value }))}
              onDelete={() => setForm((p) => ({ ...p, coverLetterUrl: "", coverLetterStatus: "MISSING" }))}
            />
            <DocumentRow
              label="National ID"
              url={form.idUrl}
              status={form.nationalIdStatus}
              onUpload={(url) => setForm((p) => ({ ...p, idUrl: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, nationalIdStatus: value }))}
              onDelete={() => setForm((p) => ({ ...p, idUrl: "", nationalIdStatus: "MISSING" }))}
            />
            <DocumentRow
              label="Secondary Certificate"
              url={form.secondaryCertificateUrl}
              status={form.secondaryCertificateStatus}
              onUpload={(url) => setForm((p) => ({ ...p, secondaryCertificateUrl: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, secondaryCertificateStatus: value }))}
              onDelete={() =>
                setForm((p) => ({ ...p, secondaryCertificateUrl: "", secondaryCertificateStatus: "MISSING" }))
              }
            />
            <DocumentRow
              label="University Certificate"
              url={form.universityCertificateUrl}
              status={form.universityCertificateStatus}
              onUpload={(url) => setForm((p) => ({ ...p, universityCertificateUrl: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, universityCertificateStatus: value }))}
              onDelete={() =>
                setForm((p) => ({ ...p, universityCertificateUrl: "", universityCertificateStatus: "MISSING" }))
              }
            />
            <DocumentRow
              label="Passport Photo 1"
              url={form.passportPhoto1Url}
              status={form.passportPhoto1Status}
              onUpload={(url) => setForm((p) => ({ ...p, passportPhoto1Url: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, passportPhoto1Status: value }))}
              onDelete={() => setForm((p) => ({ ...p, passportPhoto1Url: "", passportPhoto1Status: "MISSING" }))}
            />
            <DocumentRow
              label="Passport Photo 2"
              url={form.passportPhoto2Url}
              status={form.passportPhoto2Status}
              onUpload={(url) => setForm((p) => ({ ...p, passportPhoto2Url: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, passportPhoto2Status: value }))}
              onDelete={() => setForm((p) => ({ ...p, passportPhoto2Url: "", passportPhoto2Status: "MISSING" }))}
            />
            <DocumentRow
              label="Contract Letter"
              url={form.contractLetterUrl}
              status={form.contractLetterStatus}
              onUpload={(url) => setForm((p) => ({ ...p, contractLetterUrl: url }))}
              onStatus={(value) => setForm((p) => ({ ...p, contractLetterStatus: value }))}
              onDelete={() => setForm((p) => ({ ...p, contractLetterUrl: "", contractLetterStatus: "MISSING" }))}
            />

            <div className="flex justify-end">
              <Button onClick={saveDocuments} loading={saving}>
                Save Documents
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

const DocumentRow = ({ label, url, status, onUpload, onStatus, onDelete }) => (
  <div className="grid gap-4 rounded-xl border border-slate-200 p-4 lg:grid-cols-[1fr_260px]">
    <FileUploadField label={label} value={url} onUploaded={onUpload} onDelete={onDelete} />
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
      <select
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
        value={status}
        onChange={(e) => onStatus(e.target.value)}
      >
        {statusOptions.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default Documents;
