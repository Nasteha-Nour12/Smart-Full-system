import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";

/* ========= PUBLIC ========= */
import PublicHome from "../pages/public/Home";
import PublicPrograms from "../pages/public/Programs";
import PublicOpportunities from "../pages/public/Opportunities";

/* ========= AUTH ========= */
import Login from "../pages/auth/Login";

/* ========= ADMIN ========= */
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Companies from "../pages/admin/Companies";
import Programs from "../pages/admin/Programs";
import Opportunities from "../pages/admin/Opportunities";
import Applications from "../pages/admin/Applications";
import Enrollments from "../pages/admin/Enrollments";
import Internships from "../pages/admin/Internships";
import GoToWork from "../pages/admin/GoToWork";
import Certificates from "../pages/admin/Certificates";

/* ========= CEO ========= */
import CEODashboard from "../pages/ceo/Dashboard";
import CEOReports from "../pages/ceo/Reports";

/* ========= ICT_OFFICER ========= */
import ICTDashboard from "../pages/ict_officer/Dashboard";
import ICTOperations from "../pages/ict_officer/Operations";

/* ========= JOB_SEEKER ========= */
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import CandidateProfile from "../pages/candidate/Profile";
import CandidatePrograms from "../pages/candidate/Programs";
import MyEnrollments from "../pages/candidate/MyEnrollments";
import CandidateOpportunities from "../pages/candidate/Opportunities";
import MyApplications from "../pages/candidate/MyApplications";
import CandidateInternships from "../pages/candidate/Internships";
import CandidateGoToWork from "../pages/candidate/GoToWork";
import CandidateCertificates from "../pages/candidate/Certificates";

/* ========= EMPLOYER ========= */
import EmployerDashboard from "../pages/employer/EmployerDashboard";
import EmployerCompanyProfile from "../pages/employer/CompanyProfile";
import Register from "../pages/auth/Register";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== PUBLIC ===== */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/programs" element={<PublicPrograms />} />
        <Route path="/opportunities" element={<PublicOpportunities />} />

        {/* ===== AUTH ===== */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/Register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />

        {/* ===== ADMIN ===== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Companies />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Programs />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/opportunities"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Opportunities />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Applications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enrollments"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Enrollments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/internships"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Internships />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/go-to-work"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <GoToWork />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Certificates />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== CEO ===== */}
        <Route
          path="/ceo"
          element={
            <ProtectedRoute roles={["CEO"]}>
              <MainLayout>
                <CEODashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ceo/reports"
          element={
            <ProtectedRoute roles={["CEO"]}>
              <MainLayout>
                <CEOReports />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== ICT_OFFICER ===== */}
        <Route
          path="/ict"
          element={
            <ProtectedRoute roles={["ICT_OFFICER"]}>
              <MainLayout>
                <ICTDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ict/operations"
          element={
            <ProtectedRoute roles={["ICT_OFFICER"]}>
              <MainLayout>
                <ICTOperations />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== JOB_SEEKER ===== */}
        <Route
          path="/job-seeker"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <CandidateDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/profile"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <CandidateProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/programs"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <CandidatePrograms />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/enrollments"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <MyEnrollments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/opportunities"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <CandidateOpportunities />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/applications"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <MyApplications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/internships"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <CandidateInternships />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/go-to-work"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <CandidateGoToWork />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker/certificates"
          element={
            <ProtectedRoute roles={["JOB_SEEKER"]}>
              <MainLayout>
                <CandidateCertificates />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== EMPLOYER ===== */}
        <Route
          path="/employer"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <EmployerDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/company"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <EmployerCompanyProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/programs"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <Programs />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/enrollments"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <Enrollments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/opportunities"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <Opportunities />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applications"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <Applications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/internships"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <Internships />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/go-to-work"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <GoToWork />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/certificates"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <Certificates />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== DEFAULT ===== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
