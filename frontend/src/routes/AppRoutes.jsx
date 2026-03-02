import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";

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

/* ========= ICT_OFFICER ========= */
import ICTDashboard from "../pages/ict_officer/Dashboard";

/* ========= CANDIDATE ========= */
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
import EmployerOpportunities from "../pages/employer/Opportunities";
import EmployerApplications from "../pages/employer/Applications";
import EmployerInternships from "../pages/employer/Internships";
import Register from "../pages/auth/Register";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
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

        {/* ===== CANDIDATE ===== */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <CandidateDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <CandidateProfile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/programs"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <CandidatePrograms />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/enrollments"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <MyEnrollments />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/opportunities"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <CandidateOpportunities />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <MyApplications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/internships"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <CandidateInternships />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/go-to-work"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
              <MainLayout>
                <CandidateGoToWork />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/certificates"
          element={
            <ProtectedRoute roles={["CANDIDATE"]}>
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
          path="/employer/opportunities"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <EmployerOpportunities />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/applications"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <EmployerApplications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/internships"
          element={
            <ProtectedRoute roles={["EMPLOYER"]}>
              <MainLayout>
                <EmployerInternships />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ===== DEFAULT ===== */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;