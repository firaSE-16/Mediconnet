import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Hospital, MapPin, Phone, Mail, Calendar, Stethoscope, ClipboardList } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function StaffDashboard() {
  const [userData, setUserData] = useState(null)
  const [hospitalData, setHospitalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Fetch user info to get userId
        const userRes = await fetch(`http://localhost:5500/api/auth/me`, {
          credentials: "include",
        })
        if (!userRes.ok) throw new Error("Failed to fetch user info")
        const userInfo = await userRes.json()

        // 2. Fetch user details with hospital info
        const detailsRes = await fetch(
          `http://localhost:5500/api/hospital-admin/getStaffAccount/${userInfo.userId}`,
          { credentials: "include" }
        )
        if (!detailsRes.ok) throw new Error("Failed to fetch user details")
        const { user, hospital } = await detailsRes.json()

        setUserData(user)
        setHospitalData(hospital)

      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleBadge = (role) => {
    const roleColors = {
      HospitalAdministrator: "bg-purple-100 text-purple-800",
      Doctor: "bg-blue-100 text-blue-800",
      Nurse: "bg-pink-100 text-pink-800",
      Staff: "bg-green-100 text-green-800"
    }
    
    const roleNames = {
      HospitalAdministrator: "Hospital Admin",
      Doctor: "Doctor",
      Nurse: "Nurse",
      Staff: "Staff Member"
    }
    
    return (
      <Badge className={`capitalize ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
        {roleNames[role] || role}
      </Badge>
    )
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay error={error} />
  if (!userData) return <NoDataDisplay />

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {userData.role === 'HospitalAdministrator' ? 'Admin' : 'Staff'} Dashboard
        </h1>
        <div className="text-sm text-muted-foreground">
          Member since {formatDate(userData.createdAt)}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* User Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Avatar className="h-28 w-28 border-2 border-primary/20">
                  <AvatarFallback className="text-2xl font-medium">
                    {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left space-y-2">
                  <h3 className="text-2xl font-semibold">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  {getRoleBadge(userData.role)}
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={<Mail className="h-5 w-5" />}
                  title="Email"
                  value={userData.email}
                />
                <InfoItem 
                  icon={<Calendar className="h-5 w-5" />}
                  title="Date of Birth"
                  value={formatDate(userData.dateOfBirth)}
                />
                <InfoItem 
                  icon={<User className="h-5 w-5" />}
                  title="Gender"
                  value={userData.gender || "N/A"}
                />
                <InfoItem 
                  icon={<Phone className="h-5 w-5" />}
                  title="Contact Number"
                  value={userData.contactNumber || "N/A"}
                />
                <InfoItem 
                  icon={<MapPin className="h-5 w-5" />}
                  title="Address"
                  value={userData.address || "N/A"}
                  colSpan="md:col-span-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hospital Information Card */}
        {(hospitalData || userData.hospitalID) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Hospital className="h-5 w-5 text-primary" />
                </div>
                <span>Hospital Information</span>
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <InfoItem 
                icon={<ClipboardList className="h-5 w-5" />}
                title="Hospital Name"
                value={hospitalData?.name || userData.hospitalID?.name || "N/A"}
              />
              <InfoItem 
                icon={<MapPin className="h-5 w-5" />}
                title="Location"
                value={hospitalData?.location || userData.hospitalID?.location || "N/A"}
              />
              <InfoItem 
                icon={<Phone className="h-5 w-5" />}
                title="Contact Number"
                value={hospitalData?.contactNumber || userData.hospitalID?.contactNumber || "N/A"}
              />
              {hospitalData?.licenseNumber && (
                <InfoItem 
                  icon={<Stethoscope className="h-5 w-5" />}
                  title="License Number"
                  value={hospitalData.licenseNumber}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Reusable InfoItem component
function InfoItem({ icon, title, value, colSpan = "" }) {
  return (
    <div className={`flex items-start gap-3 ${colSpan}`}>
      <div className="mt-0.5 p-2 bg-primary/10 rounded-md">
        {React.cloneElement(icon, { className: "h-4 w-4 text-primary" })}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-[250px]" />
        <Skeleton className="h-5 w-[180px]" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-12 rounded-lg" />
          <div className="flex gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-12 rounded-lg" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorDisplay({ error }) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Error Loading Dashboard</h1>
      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">{error}</p>
        <p className="text-sm mt-2">Please try again later or contact support if the problem persists.</p>
      </div>
    </div>
  )
}

function NoDataDisplay() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">No Data Available</h1>
      <div className="p-4 border rounded-lg bg-muted/50">
        <p>Could not load staff information.</p>
        <p className="text-sm mt-2">Please check your permissions or try refreshing the page.</p>
      </div>
    </div>
  )
}