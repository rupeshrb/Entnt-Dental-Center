// src/App.js
import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/DentalAdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import { initializeMockData } from "./data/mockData";

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to={user.role === "Admin" ? "/admin" : "/patient"} />} />
      <Route path="/admin" element={user?.role === "Admin" ? <AdminDashboard /> : <Navigate to="/" />} />
      <Route path="/patient" element={user?.role === "Patient" ? <PatientDashboard /> : <Navigate to="/" />} />

    </Routes>
  );
}

function App() {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
