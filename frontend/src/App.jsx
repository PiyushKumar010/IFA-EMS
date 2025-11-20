import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import AdminPage from "./pages/AdminPage";
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
import AdminEmployeesPage from "./pages/AdminEmployeesPage";
import AdminEmployeeDetailsPage from "./pages/AdminEmployeeDetailsPage";
import ClientMessagesPage from "./pages/ClientMessagesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import EmployeeRoute from "./components/EmployeeRoute";
import ClientRoute from "./components/ClientRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        
        {/* Admin Routes - Admin only */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <AdminRoute>
              <AdminRequestsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <AdminRoute>
              <AdminMessagesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <AdminRoute>
              <AdminEmployeesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/employee/:id"
          element={
            <AdminRoute>
              <AdminEmployeeDetailsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/project/:id"
          element={
            <AdminRoute>
              <AdminProjectEdit />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/leaderboard"
          element={
            <AdminRoute>
              <LeaderboardPage />
            </AdminRoute>
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
      </Routes>
    </BrowserRouter>
  );
}
