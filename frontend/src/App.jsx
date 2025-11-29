import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import AdminProjectsPage from "./pages/AdminPage";
import AdminLayout from "./pages/AdminLayout";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminProjectEdit from './pages/AdminProjectEdit';
import EmployeePage from "./pages/EmployeePage";
import EmployeeProject from "./pages/EmployeeProject";
import EmployeeDailyFormPage from "./pages/EmployeeDailyFormPage";
import EmployeeProfileCompletionPage from "./pages/EmployeeProfileCompletionPage";
import ClientPage from "./pages/ClientPage";
import ApprovalPage from "./pages/Approval";
import AdminRequestsPage from "./pages/AdminRequestsPage";
import EmployeeMessagesPage from "./pages/EmployeeMessagesPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import AdminDailyFormsPage from "./pages/AdminDailyFormsPage";
import AdminEmployeesPage from "./pages/AdminEmployeesPage";
import AdminEmployeeDetailsPage from "./pages/AdminEmployeeDetailsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminHackathonPage from "./pages/AdminHackathonPage";
import HackathonApplicantPage from "./pages/HackathonApplicantPage";
import HackathonApplicationPage from "./pages/HackathonApplicationPage";
import ClientMessagesPage from "./pages/ClientMessagesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminMeetingsPage from "./pages/AdminMeetingsPage";
import EmployeeMeetingsPage from "./pages/EmployeeMeetingsPage";
import ClientMeetingsPage from "./pages/ClientMeetingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import EmployeeRoute from "./components/EmployeeRoute";
import ClientRoute from "./components/ClientRoute";
import HackathonRoute from "./components/HackathonRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        
        {/* Admin Routes - Admin only */}
        {/* Admin Layout Wrapper for all admin pages */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminOverviewPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProjectsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminRequestsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminMessagesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/daily-forms"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDailyFormsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminEmployeesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/employee/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminEmployeeDetailsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/project/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminProjectEdit />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/leaderboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <LeaderboardPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/meetings"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminMeetingsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminReportsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/hackathon"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminHackathonPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* Hackathon Routes */}
        <Route
          path="/hackathon"
          element={
            <HackathonRoute>
              <HackathonApplicantPage />
            </HackathonRoute>
          }
        />
        <Route
          path="/hackathon/apply"
          element={
            <HackathonRoute>
              <HackathonApplicationPage />
            </HackathonRoute>
          }
        />

        {/* Employee Routes - Employee only */}
        <Route
          path="/employee"
          element={
            <EmployeeRoute>
              <EmployeePage />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/project/:id"
          element={
            <EmployeeRoute>
              <EmployeeProject />
            </EmployeeRoute>
          }
        />
        <Route path="/employee/approval" element={<ApprovalPage />} />
        <Route
          path="/employee/messages"
          element={
            <EmployeeRoute>
              <EmployeeMessagesPage />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/daily-form"
          element={
            <EmployeeRoute>
              <EmployeeDailyFormPage />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/complete-profile"
          element={
            <EmployeeRoute>
              <EmployeeProfileCompletionPage />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/leaderboard"
          element={
            <EmployeeRoute>
              <LeaderboardPage />
            </EmployeeRoute>
          }
        />
        <Route
          path="/employee/meetings"
          element={
            <EmployeeRoute>
              <EmployeeMeetingsPage />
            </EmployeeRoute>
          }
        />

        {/* Client Routes - Client only */}
        <Route
          path="/client"
          element={
            <ClientRoute>
              <ClientPage />
            </ClientRoute>
          }
        />
        <Route
          path="/client/messages"
          element={
            <ClientRoute>
              <ClientMessagesPage />
            </ClientRoute>
          }
        />
        <Route
          path="/client/meetings"
          element={
            <ClientRoute>
              <ClientMeetingsPage />
            </ClientRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
