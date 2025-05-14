import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Code */}
        <div className="text-8xl font-bold text-gray-300">404</div>
        
        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-800">Page Not Found</h1>
        
        <p className="text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Hospital-specific message */}
        <div className="py-4 border-y border-gray-200">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 mx-auto text-gray-400" 
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
          <p className="mt-2 text-gray-500">
            If you believe this is an error, please contact hospital IT support.
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
            Return to Home
          </Button>
        </div>
        
        {/* Emergency Notice */}
        <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-100">
          <p className="text-sm text-red-800">
            <strong>For medical emergencies:</strong> Please call your local emergency number or go to the nearest emergency department.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound