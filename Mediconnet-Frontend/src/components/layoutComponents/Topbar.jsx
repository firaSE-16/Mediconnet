// src/components/layoutComponents/Topbar.jsx
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="bg-white p-4 border-b flex justify-between items-center">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Logged in as: <span className="font-medium capitalize">{userRole}</span>
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-600 hover:text-red-800"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default Topbar;