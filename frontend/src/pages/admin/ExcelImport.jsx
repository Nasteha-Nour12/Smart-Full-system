import { Link } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";

const modules = [
  {
    title: "Candidate Profiles",
    route: "/admin/candidate-profiles",
    description: "Bulk import candidate registration records.",
    headers: [
      "idNo",
      "fullName",
      "gender",
      "contact",
      "district",
      "educationLevel",
      "faculty",
      "otherSkills",
      "selectedProgram",
      "hospitalityType",
      "candidateStatus",
      "trainingFee",
      "programFee",
    ],
  },
  {
    title: "Training Programs",
    route: "/admin/training-programs",
    description: "Bulk import training registrations and status data.",
    headers: [
      "candidateId",
      "idNo",
      "fullName",
      "gender",
      "contact",
      "district",
      "educationLevel",
      "faculty",
      "otherSkills",
      "trainingStatus",
      "trainingFee",
    ],
  },
  {
    title: "Internships",
    route: "/admin/internships",
    description: "Bulk import internship placements for eligible candidates.",
    headers: [
      "candidateId",
      "companyId",
      "position",
      "startDate",
      "endDate",
      "idNo",
      "fullName",
      "gender",
      "contact",
      "district",
      "educationLevel",
      "faculty",
      "otherSkills",
      "internshipStatus",
      "internshipFee",
    ],
  },
  {
    title: "Shaqo Tag",
    route: "/admin/go-to-work",
    description: "Bulk import job placement requests and progress.",
    headers: [
      "candidateId",
      "status",
      "matchedCompanyId",
      "interviewDate",
      "readinessStatus",
      "interviewStatus",
      "placementStatus",
      "jobTitle",
      "workLocation",
      "notes",
    ],
  },
];

const downloadTemplate = (title, headers) => {
  const csv = `${headers.join(",")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-template.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const ExcelImport = () => {
  return (
    <div>
      <PageTitle
        title="Excel Import"
        subtitle="Open any module import, download template, then upload your Excel/CSV."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((item) => (
          <div key={item.title} className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>

            <p className="mt-3 text-xs uppercase text-slate-500">Template Columns</p>
            <p className="mt-1 text-sm text-slate-700">{item.headers.join(", ")}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={item.route}>
                <Button>Open Import</Button>
              </Link>
              <Button variant="secondary" onClick={() => downloadTemplate(item.title, item.headers)}>
                Download Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExcelImport;
