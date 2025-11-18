import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import AdminPage from "./pages/AdminPage";
import AdminProjectEdit from './pages/AdminProjectEdit';
import EmployeePage from "./pages/EmployeePage";
import EmployeeProject from "./pages/EmployeeProject";
import ClientPage from "./pages/ClientPage";
import ApprovalPage from "./pages/Approval";
import AdminRequestsPage from "./pages/AdminRequestsPage";
import EmployeeMessagesPage from "./pages/EmployeeMessagesPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/requests" element={<AdminRequestsPage/>} />
        <Route path="/admin/messages" element={<AdminMessagesPage/>} />
        <Route path="/admin/project/:id" element={<AdminProjectEdit />} />
        <Route path="/employee" element={<EmployeePage />} />
         <Route path="/employee/project/:id" element={<EmployeeProject />} />
         <Route path="/employee/approval" element={<ApprovalPage />} />
         <Route path="/employee/messages" element={<EmployeeMessagesPage />} />
        <Route path="/client" element={<ClientPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}
