// src/pages/Unauthorized.jsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm text-center space-y-6">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Main Message */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h1>
          <p className="text-gray-600">
            Your account doesn't have permission to view this page.
          </p>
        </div>

        {/* Hospital Context */}
        <div className="py-4 border-t border-b border-gray-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8 mx-auto text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            Hospital staff accounts have different access levels. Please contact your administrator if you need access.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)} 
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-xs text-black-800">
            <strong>Security Notice:</strong> Unauthorized access attempts are logged for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;