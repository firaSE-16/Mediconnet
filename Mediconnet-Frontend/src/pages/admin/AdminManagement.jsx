"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Badge } from "../../components/ui/badge"
import { Plus, MoreVertical, Search } from "lucide-react"

// Sample admin data
const sampleAdmins = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    hospitalName: "General Hospital",
    hospitalId: "1",
    lastLogin: "2023-04-10T14:30:00Z",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    hospitalName: "Community Medical Center",
    hospitalId: "2",
    lastLogin: "2023-04-09T10:15:00Z",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael@example.com",
    hospitalName: "Regional Health Center",
    hospitalId: "3",
    lastLogin: "2023-03-28T08:45:00Z",
    status: "inactive",
  },
]

const AdminManagement = () => {
  const [admins, setAdmins] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  // Simulate fetching data
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setAdmins(sampleAdmins)
  }, [])

  // Filter admins based on search term
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hospital Admin Management</h1>
        <Link to="/system-admin/admin-management/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </Link>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search admins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>


      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.hospitalName}</TableCell>
                  <TableCell>{formatDate(admin.lastLogin)}</TableCell>
                  <TableCell>
                    <Badge variant={admin.status === "active" ? "success" : "destructive"}>
                      {admin.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link to={`/system-admin/admin-management/edit/${admin.id}`} className="w-full">
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className={admin.status === "active" ? "text-destructive" : "text-green-600"}>
                          {admin.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No admins found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AdminManagement
