import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import Home from "./pages/Home.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

