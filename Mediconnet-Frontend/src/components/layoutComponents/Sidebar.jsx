import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  BookOpenText,
  BarChart4,
  ChevronDown,
  ChevronUp,
  LogOut,
  Home,
  Users,
  ClipboardList,
  FlaskConical,
  Stethoscope,
  ClipboardCheck,
  UserPlus,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const roleBasedMenuItems = {
  Admin: [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Hospital Management",
      path: "/admin/hospital-management",
      icon: <Home className="w-5 h-5" />,
    },
  ],
  Doctor: [
    {
      name: "Dashboard",
      path: "/doctor/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Patient Records",
      path: "/doctor/assigned-records",
      icon: <ClipboardList className="w-5 h-5" />,
    },
  ],
  HospitalAdministrator: [
    {
      name: "Dashboard",
      path: "/hospital-admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
    name: "All Staff",
      path: "/hospital-admin/staff-management",
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: "Staff Management",
      path: "/hospital-admin/staff-management",
      icon: <Users className="w-5 h-5" />,
      subLinks: [
        { 
          name: "Add Staff", 
          path: "/hospital-admin/add-staff",
          icon: <UserPlus className="w-4 h-4" /> 
        },
        { 
          name: "View Staff", 
          path: "/hospital-admin/edit-staff",
          icon: <UserRound className="w-4 h-4" /> 
        },
      ],
    },
    {
      name: "Patient Records",
      path: "/hospital-admin/patient-records",
      icon: <ClipboardCheck className="w-5 h-5" />,
      subLinks: [
        { 
          name: "View Records", 
          path: "/hospital-admin/view-records",
          icon: <BookOpenText className="w-4 h-4" /> 
        },
      ],
    },
    {
      name: "Audit Logs",
      path: "/hospital-admin/audit-logs",
      icon: <BarChart4 className="w-5 h-5" />,
    },
  ],
  Receptionist: [
    {
      name: "Dashboard",
      path: "/receptionist/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Patient Registration",
      path: "/receptionist/registration",
      icon: <UserPlus className="w-5 h-5" />,
    },
  ],
  Triage: [
    {
      name: "Dashboard",
      path: "/triage/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Unassigned Patients",
      path: "/triage/unassigned",
      icon: <Stethoscope className="w-5 h-5" />,
    },
  ],
  LabTechnician: [
    {
      name: "Dashboard",
      path: "/laboratorist/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Lab Requests",
      path: "/laboratorist/patientList",
      icon: <FlaskConical className="w-5 h-5" />,
    },
  ],
};

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const { userRole, setUserRole } = useUser();

  const handleMenuClick = (item, event) => {
    if (item.subLinks) {
      event.preventDefault();
      setOpenMenus((prev) => ({
        ...prev,
        [item.name]: !prev[item.name],
      }));
    } else {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    // Remove JWT cookie
    Cookies.remove("jwt");
    
    // Clear user role from context
    setUserRole(null);
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Navigate to login page
    navigate("/login");
  };

  const menuItems = roleBasedMenuItems[userRole] || [];

  return (
    <div className="w-64 h-screen border-r p-5 flex flex-col bg-primary shadow-lg">
      {/* Logo Section */}
      <div className="h-20 mb-8 flex justify-center items-center border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-2 rounded-lg">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <p className="text-xl text-white font-bold tracking-wide">MediConnect</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <li key={item.name} className="relative">
              <NavLink
                to={item.path}
                onClick={(e) => handleMenuClick(item, e)}
                className={({ isActive }) =>
                  `py-3 px-4 flex gap-3 items-center w-full rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "bg-white/20 text-white font-medium shadow-md" 
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="[&>svg]:w-5 [&>svg]:h-5">
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                {item.subLinks && (
                  <span className="ml-2">
                    {openMenus[item.name] ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </span>
                )}
              </NavLink>

              {item.subLinks && (
                <ul
                  className={`ml-8 pl-4 border-l-2 border-white/10 overflow-hidden transition-all duration-300 ${
                    openMenus[item.name] 
                      ? "max-h-96 py-2 opacity-100" 
                      : "max-h-0 py-0 opacity-0"
                  }`}
                >
                  {item.subLinks.map((sub) => (
                    <li key={sub.name}>
                      <NavLink
                        to={sub.path}
                        className={({ isActive }) =>
                          `py-2 px-3 flex gap-3 items-center text-sm rounded-lg transition-all ${
                            isActive
                              ? "bg-white/20 text-white font-medium"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`
                        }
                      >
                        <span className="[&>svg]:w-4 [&>svg]:h-4">
                          {sub.icon}
                        </span>
                        {sub.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="text-sm text-white/80 mb-3 px-2">
          Logged in as:{" "}
          <span className="font-medium capitalize text-white">{userRole}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full py-2.5 px-4 flex items-center gap-3 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;