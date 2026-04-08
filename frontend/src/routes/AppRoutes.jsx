import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import AuthLayout from "../components/layout/AuthLayout";
import MainLayout from "../components/layout/MainLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import Companies from "../pages/admin/Companies";
import Internships from "../pages/admin/Internships";
import GoToWork from "../pages/admin/GoToWork";
import CandidateProfiles from "../pages/admin/CandidateProfiles";
import TrainingPrograms from "../pages/admin/TrainingPrograms";
import Hospitality from "../pages/admin/Hospitality";
import Documents from "../pages/admin/Documents";
import Settings from "../pages/admin/Settings";
import Reports from "../pages/ceo/Reports";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />

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
          path="/admin/candidate-profiles"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <CandidateProfiles />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/training-programs"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <TrainingPrograms />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hospitality"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Hospitality />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Documents />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Reports />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
