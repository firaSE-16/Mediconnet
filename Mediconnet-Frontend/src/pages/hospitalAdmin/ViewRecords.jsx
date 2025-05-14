import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Eye, FileText } from "lucide-react"

const ViewRecords = () => {
  // Sample patient data
  const patientData = [
    {
      id: "P097777",
      name: "Abdi Abdi",
      age: 45,
      gender: "Male",
      lastVisit: "2024-12-31",
      doctor: "Dr. John Smith",
    },
    {
      id: "P097778",
      name: "Sarah Johnson",
      age: 32,
      gender: "Female",
      lastVisit: "2024-12-30",
      doctor: "Dr. Mary Williams",
    },
    {
      id: "P097779",
      name: "James Wilson",
      age: 28,
      gender: "Male",
      lastVisit: "2024-12-29",
      doctor: "Dr. Robert Brown",
    },
    {
      id: "P097780",
      name: "Emily Davis",
      age: 56,
      gender: "Female",
      lastVisit: "2024-12-28",
      doctor: "Dr. Sarah Williams",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">View Records</h1>
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientData.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>{patient.doctor}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        History
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

export default ViewRecords

