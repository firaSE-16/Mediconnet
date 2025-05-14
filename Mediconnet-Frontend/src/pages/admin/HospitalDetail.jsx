"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  ArrowLeft, MoreVertical, Building2, MapPin, Phone, Mail, 
  Calendar, ShieldCheck, FileText, Users, Activity, Clock, UserCog,
  PieChart as PieChartIcon, Stethoscope, ClipboardList, User2,
  ClipboardCheck, FlaskConical, Pill, Search
} from "lucide-react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BASE_URL, formatDate, getTimeSince } from "@/lib/utils"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6384', '#36A2EB'];

const roleIcons = {
  HospitalAdministrator: <UserCog className="h-4 w-4" />,
  Receptionist: <ClipboardList className="h-4 w-4" />,
  Doctor: <Stethoscope className="h-4 w-4" />,
  Triage: <ClipboardCheck className="h-4 w-4" />,
  LabTechnician: <FlaskConical className="h-4 w-4" />,
  Pharmacist: <Pill className="h-4 w-4" />
};

const roleColors = {
  HospitalAdministrator: "bg-purple-100 text-purple-800",
  Receptionist: "bg-blue-100 text-blue-800",
  Doctor: "bg-green-100 text-green-800",
  Triage: "bg-yellow-100 text-yellow-800",
  LabTechnician: "bg-red-100 text-red-800",
  Pharmacist: "bg-indigo-100 text-indigo-800"
};

const HospitalDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [hospital, setHospital] = useState(null)
  const [staffByRole, setStaffByRole] = useState({})
  const [roleCounts, setRoleCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/system-admin/hospitals/${id}`, {
          withCredentials: true
        })
        
        const { hospital, staffByRole, roleCounts } = response.data
        
        setHospital(hospital)
        setStaffByRole(staffByRole)
        setRoleCounts(roleCounts)
        
      } catch (err) {
        console.error("Error fetching hospital details:", err)
        setError(err.response?.data?.msg || "Failed to load hospital details")
      } finally {
        setLoading(false)
      }
    }

    fetchHospitalDetails()
  }, [id])

  const filteredStaff = () => {
    let staff = Object.values(staffByRole).flat()
    
    // Apply role filter
    if (roleFilter !== "all") {
      staff = staff.filter(member => member.role === roleFilter)
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      staff = staff.filter(member => 
        member.firstName.toLowerCase().includes(term) || 
        member.lastName.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term))
    }
    
    return staff
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorDisplay error={error} navigate={navigate} />
  if (!hospital) return <NotFound navigate={navigate} />

  // Prepare data for role distribution chart
  const roleData = Object.keys(roleCounts).map(role => ({
    name: role,
    value: roleCounts[role]
  }))

  // Get active staff count
  const activeStaffCount = Object.values(staffByRole).flat().filter(s => s.status === "active").length
  const activeStaffPercentage = Math.round((activeStaffCount / (Object.values(roleCounts).reduce((a, b) => a + b, 0)) * 100))

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/hospital-management")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{hospital.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {hospital.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/admin/admin-management/${id}/add-admin`)}
            className="flex items-center gap-2"
          >
            <UserCog className="h-4 w-4" />
            Add Admin
          </Button>
          <Badge variant={hospital.status === "active" ? "default" : "destructive"}>
            {hospital.status || "active"}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Staff" 
          value={Object.values(roleCounts).reduce((a, b) => a + b, 0)} 
          icon={<Users className="h-5 w-5" />} 
          color="blue"
        />
        <StatCard 
          title="Doctors" 
          value={roleCounts.Doctor || 0} 
          icon={<Stethoscope className="h-5 w-5" />} 
          color="green"
        />
        <StatCard 
          title="Admins" 
          value={roleCounts.HospitalAdministrator || 0} 
          icon={<UserCog className="h-5 w-5" />} 
          color="purple"
        />
        <StatCard 
          title="Active Staff" 
          value={`${activeStaffPercentage}%`} 
          icon={<ShieldCheck className="h-5 w-5" />} 
          color="orange"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="roles">Roles Breakdown</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <HospitalInfoCard hospital={hospital} />
            <RecentActivityCard staff={Object.values(staffByRole).flat().slice(0, 5)} navigate={navigate} />
          </div>
          
          {/* Role Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Staff Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No staff data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.keys(roleCounts).map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <StaffTable 
            staff={filteredStaff()} 
            hospitalName={hospital.name}
            navigate={navigate}
          />
        </TabsContent>

        {/* Roles Breakdown Tab */}
        <TabsContent value="roles" className="space-y-4">
          {Object.entries(staffByRole).map(([role, staff]) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {roleIcons[role] || <User2 className="h-5 w-5" />}
                  {role} ({staff.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map(member => (
                    <div 
                      key={member._id} 
                      className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                      onClick={() => navigate(`/system-admin/staff-management/${member._id}`)}
                    >
                      <Avatar className="h-9 w-9">
                        {member.profilePicture && <AvatarImage src={member.profilePicture} />}
                        <AvatarFallback>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <Badge variant="outline" className={`capitalize ${roleColors[role]}`}>
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-8 w-48" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
    <Tabs defaultValue="overview">
      <TabsList className="mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </TabsList>
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </Tabs>
  </div>
)

const ErrorDisplay = ({ error, navigate }) => (
  <div className="p-6">
    <div className="flex items-center mb-6">
      <Button variant="outline" onClick={() => navigate("/admin/hospital-management")} className="mr-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Error Loading Hospital</h1>
    </div>
    <div className="text-red-500 p-4 border rounded-md bg-red-50">
      {error}
    </div>
  </div>
)

const NotFound = ({ navigate }) => (
  <div className="p-6">
    <div className="flex items-center mb-6">
      <Button variant="outline" onClick={() => navigate("/admin/hospital-management")} className="mr-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">Hospital Not Found</h1>
    </div>
    <p>The requested hospital could not be found.</p>
  </div>
)

const StatCard = ({ title, value, icon, progress, description, color = "blue", trend }) => {
  const colors = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" }
  }

  const trendIcons = {
    up: <span className="text-green-500">↑</span>,
    down: <span className="text-red-500">↓</span>,
    neutral: <span className="text-gray-500">→</span>
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && trendIcons[trend]}
            </div>
          </div>
          <div className={`p-3 rounded-full ${colors[color].bg} ${colors[color].text}`}>
            {icon}
          </div>
        </div>
        {progress !== undefined && (
          <>
            <Progress value={progress} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </>
        )}
        {progress === undefined && description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

const HospitalInfoCard = ({ hospital }) => (
  <Card className="lg:col-span-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        Hospital Information
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <InfoItem icon={<MapPin />} title="Location" value={hospital.location} />
        <InfoItem icon={<Phone />} title="Contact" value={hospital.contactNumber} />
        <InfoItem icon={<FileText />} title="License" value={hospital.licenseNumber} />
        <InfoItem icon={<Mail />} title="Email" value={hospital.email || "Not provided"} />
      </div>
    </CardContent>
  </Card>
)

const InfoItem = ({ icon, title, value }) => (
  <div className="flex items-start gap-4">
    <div className="p-3 rounded-lg bg-secondary">
      {React.cloneElement(icon, { className: "h-5 w-5 text-primary" })}
    </div>
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  </div>
)

const RecentActivityCard = ({ staff, navigate }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        Recent Activity
      </CardTitle>
      <CardDescription>Last 5 staff logins</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {staff.slice(0, 5).map(member => (
          <div 
            key={member._id} 
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
            onClick={() => navigate(`/admin/hospital-detail/staff/${member._id}`)}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>
                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {member.lastLogin ? getTimeSince(member.lastLogin) : "Never logged in"}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {member.role}
            </Badge>
          </div>
        ))}
        {staff.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No staff activity to display
          </p>
        )}
      </div>
    </CardContent>
  </Card>
)

const StaffTable = ({ staff, hospitalName, navigate }) => (
  <Card>
    <CardHeader>
      <CardTitle>Staff Members</CardTitle>
      <CardDescription>
        Showing {staff.length} staff member{staff.length !== 1 ? 's' : ''} at {hospitalName}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length > 0 ? (
              staff.map((member) => (
                <TableRow 
                  key={member._id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/hospital-detail/staff/${member._id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "active" ? "default" : "destructive"}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {member.lastLogin ? getTimeSince(member.lastLogin) : "Never"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/admin/hospital-detail/staff/${member._id}`)
                          }}
                        >
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => e.stopPropagation()}
                        >
                          {member.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="h-10 w-10 text-gray-400" />
                    <p className="text-gray-500">No staff members found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
)

const HospitalDetailsCard = ({ hospital }) => (
  <Card>
    <CardHeader>
      <CardTitle>Hospital Details</CardTitle>
      <CardDescription>Complete information about {hospital.name}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Section title="Basic Information" icon={<Building2 />}>
            <DetailItem label="Hospital Name" value={hospital.name} />
            <DetailItem label="Location" value={hospital.location} />
            <DetailItem label="License Number" value={hospital.licenseNumber} />
          </Section>
          <Section title="System Information" icon={<Calendar />}>
            <DetailItem label="Date Created" value={formatDate(hospital.createdAt)} />
            <DetailItem label="Last Updated" value={formatDate(hospital.updatedAt)} />
          </Section>
        </div>
        <div className="space-y-6">
          <Section title="Contact Information" icon={<Phone />}>
            <DetailItem label="Contact Number" value={hospital.contactNumber} />
            <DetailItem label="Email" value={hospital.email || "Not provided"} />
          </Section>
          <Section title="Status & Actions" icon={<ShieldCheck />}>
            <div className="border-b pb-4">
              <p className="text-sm font-medium text-muted-foreground">Current Status</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={hospital.status === "active" ? "default" : "destructive"}>
                  {hospital.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {hospital.status === "active" ? "Hospital is operational" : "Hospital is inactive"}
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1">Edit Hospital</Button>
              <Button variant={hospital.status === "active" ? "destructive" : "default"} className="flex-1">
                {hospital.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </CardContent>
  </Card>
)

const Section = ({ title, icon, children }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      {React.cloneElement(icon, { className: "h-5 w-5" })}
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
)

const DetailItem = ({ label, value }) => (
  <div className="border-b pb-4">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="mt-1">{value}</p>
  </div>
)

export default HospitalDetail