"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, User, Mail, Phone, Calendar, ShieldCheck, 
  Clock, MapPin, Activity, Stethoscope, ClipboardList, 
  FlaskConical, Pill, Edit, Key, AlertCircle, CheckCircle2
} from "lucide-react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BASE_URL, formatDate, getTimeSince } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

const StaffDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/system-admin/hospitals/staff/${id}`, {
          withCredentials: true
        })
        setStaff(response.data)
      } catch (err) {
        console.error("Error fetching staff details:", err)
        setError(err.response?.data?.msg || "Failed to load staff details")
      } finally {
        setLoading(false)
      }
    }

    fetchStaffDetails()
  }, [id])

  const getRoleIcon = (role) => {
    const roleIcons = {
      "Doctor": <Stethoscope className="h-5 w-5 text-blue-500" />,
      "Nurse": <Activity className="h-5 w-5 text-green-500" />,
      "HospitalAdministrator": <ShieldCheck className="h-5 w-5 text-purple-500" />,
      "Receptionist": <User className="h-5 w-5 text-yellow-500" />,
      "Triage": <ClipboardList className="h-5 w-5 text-orange-500" />,
      "LabTechnician": <FlaskConical className="h-5 w-5 text-red-500" />,
      "Pharmacist": <Pill className="h-5 w-5 text-indigo-500" />
    }
    return roleIcons[role] || <User className="h-5 w-5" />
  }

  const getStatusBadge = (status) => (
    <Badge 
      variant={status === "active" ? "default" : "destructive"} 
      className="flex items-center gap-1"
    >
      {status === "active" ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {status}
    </Badge>
  )

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay error={error} navigate={navigate} />
  if (!staff) return <NotFound navigate={navigate} />

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Staff Management</h1>
            <p className="text-sm text-muted-foreground">
              Detailed view of staff member information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" className="gap-2">
            <Key className="h-4 w-4" />
            Reset Password
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-32 w-32">
                    {staff.profilePicture && (
                      <AvatarImage src={staff.profilePicture} />
                    )}
                    <AvatarFallback className="text-3xl">
                      {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">{staff.firstName} {staff.lastName}</h2>
                    <div className="flex items-center justify-center gap-2">
                      {getRoleIcon(staff.role)}
                      <Badge variant="outline" className="capitalize">
                        {staff.role}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge(staff.status)}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <InfoItem icon={<Mail className="text-blue-500" />} title="Email" value={staff.email} />
                  <InfoItem icon={<Phone className="text-green-500" />} title="Phone" value={staff.phone || "Not provided"} />
                  <InfoItem icon={<Calendar className="text-purple-500" />} title="Date of Birth" value={formatDate(staff.dateOfBirth)} />
                  <InfoItem icon={<Clock className="text-yellow-500" />} title="Member Since" value={formatDate(staff.createdAt)} />
                  <InfoItem 
                    icon={<Clock className="text-orange-500" />} 
                    title="Last Login" 
                    value={staff.lastLogin ? getTimeSince(staff.lastLogin) : "Never logged in"} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Detailed professional information and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Personal Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="First Name" value={staff.firstName} />
                    <DetailItem label="Last Name" value={staff.lastName} />
                    <DetailItem label="Gender" value={staff.gender} />
                    <DetailItem label="Date of Birth" value={formatDate(staff.dateOfBirth)} />
                  </div>
                </Section>

                <Separator />

                <Section title="Hospital Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Hospital" value={staff.hospitalId?.name || "Not assigned"} />
                    <DetailItem label="Department" value={staff.department || "Not specified"} />
                    <DetailItem label="Position" value={staff.position || "Not specified"} />
                    <DetailItem label="Role" value={staff.role} />
                  </div>
                </Section>

                <Separator />

                <Section title="Account Status">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Status" value={getStatusBadge(staff.status)} />
                    <DetailItem label="Account Created" value={formatDate(staff.createdAt)} />
                    <DetailItem label="Last Updated" value={formatDate(staff.updatedAt)} />
                    <DetailItem 
                      label="Last Login" 
                      value={staff.lastLogin ? getTimeSince(staff.lastLogin) : "Never logged in"} 
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <Button variant={staff.status === "active" ? "destructive" : "default"}>
                      {staff.status === "active" ? "Deactivate Account" : "Activate Account"}
                    </Button>
                    <Button variant="outline">Send Welcome Email</Button>
                  </div>
                </Section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent activities and access history for this staff member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium">Coming Soon</h4>
                  <p className="text-sm text-muted-foreground">
                    Activity tracking will be available in the next update
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage account permissions and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Section title="Security">
                  <div className="space-y-4">
                    <DetailItem label="Two-Factor Authentication" value="Not enabled" />
                    <DetailItem label="Password Last Changed" value="3 months ago" />
                    <div className="flex gap-4">
                      <Button>Reset Password</Button>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </div>
                </Section>

                <Separator />

                <Section title="Permissions">
                  <div className="space-y-4">
                    <DetailItem label="Role" value={staff.role} />
                    <DetailItem label="Access Level" value="Standard" />
                    <Button variant="outline">Edit Permissions</Button>
                  </div>
                </Section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="p-6 max-w-6xl mx-auto space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-md" />
      <Skeleton className="h-8 w-48" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-[600px] rounded-xl" />
      <Skeleton className="h-[600px] rounded-xl lg:col-span-2" />
    </div>
  </div>
)

// Error Display
const ErrorDisplay = ({ error, navigate }) => (
  <div className="p-6 max-w-6xl mx-auto">
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Error Loading Staff</h1>
    </div>
    <div className="text-red-500 p-4 border rounded-md bg-red-50">
      {error}
    </div>
  </div>
)

// Not Found
const NotFound = ({ navigate }) => (
  <div className="p-6 max-w-6xl mx-auto">
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Staff Not Found</h1>
    </div>
    <p>The requested staff member could not be found.</p>
  </div>
)

// Info Item Component
const InfoItem = ({ icon, title, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 rounded-lg bg-secondary">
      {React.cloneElement(icon, { className: "h-4 w-4" })}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
)

// Section Component
const Section = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
)

// Detail Item Component
const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value}</p>
  </div>
)

export default StaffDetail