import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import AuthLayout from "../components/AuthLayout";
import Login from "../pages/Login";
import SignupSelectRole from "../pages/SignupSelectRole";
import SignupForm from "../pages/SignupForm";
import Dashboard from "../pages/Dashboard";
import BugsAll from "../pages/BugsAll";
import ProjectPage from "../pages/dashboard/ProjectPage";
import ProfileSettings from '../pages/ProfileSettings';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupSelectRole />} />
          <Route path="/signup/:role" element={<SignupForm />} />
        </Route>

        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects/:projectId" element={<ProjectPage />} />
          <Route path="bugs" element={<BugsAll />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

