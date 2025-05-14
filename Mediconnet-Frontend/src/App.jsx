import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import getUser from "./lib/getUser";
import AppRoutes from "./routes";
import Sidebar from "./components/layoutComponents/Sidebar";
import Login from "./pages/Login";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "./context/UserContext";
import { ToastProvider } from "./components/ui/toast";

function App() {
  const { userRole, setUserRole } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        setUserRole(user.role);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <BrowserRouter>
      {/* Choose EITHER react-toastify OR your custom ToastProvider */}
      
      {/* Option 1: Using react-toastify (remove ToastProvider) */}
      <ToastContainer autoClose={2000} position="top-center" />
      
      {/* Option 2: Using your custom ToastProvider (remove react-toastify) */}
      <ToastProvider>
        {!userRole ? (
          <Login />
        ) : (
          <div className="flex h-screen">
            <div className="fixed top-0 left-0 h-full w-80 z-50 overflow-hidden">
              <Sidebar />
            </div>
            <div className="flex-1 ml-80 overflow-y-auto">
              <div className="p-4 border min-h-screen rounded-md">
                <AppRoutes userRole={userRole} />
              </div>
            </div>
          </div>
        )}
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;