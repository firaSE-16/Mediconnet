import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Edit, Trash2 } from "lucide-react"

const EditViewStaff = () => {
  // Sample staff data
  const staffData = [
    {
      id: 1,
      name: "Dr. John Smith",
      email: "john.smith@mediconet.com",
      role: "Doctor",
      department: "Cardiology",
      status: "Active",
    },
    {
      id: 2,
      name: "Nurse Mary Johnson",
      email: "mary.johnson@mediconet.com",
      role: "Nurse",
      department: "Pediatrics",
      status: "Active",
    },
    {
      id: 3,
      name: "Dr. Sarah Williams",
      email: "sarah.williams@mediconet.com",
      role: "Doctor",
      department: "Neurology",
      status: "Active",
    },
    {
      id: 4,
      name: "James Brown",
      email: "james.brown@mediconet.com",
      role: "Receptionist",
      department: "Front Desk",
      status: "Inactive",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit View Staff</h1>
      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${staff.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {staff.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditViewStaff

