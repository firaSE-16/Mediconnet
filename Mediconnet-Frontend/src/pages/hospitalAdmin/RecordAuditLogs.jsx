"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"

const RecordAuditLogs = () => {
  // Sample audit logs data
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      timestamp: "2024-12-31 10:15:45",
      patientId: "P097777",
      patientName: "Abdi Abdi",
      role: "Doctor",
      roleName: "John John",
      status: "Success",
      action: "Viewed patient medical history",
    },
    {
      id: 2,
      timestamp: "2024-12-31 09:30:22",
      patientId: "P097778",
      patientName: "Sarah Johnson",
      role: "Nurse",
      roleName: "Mary Smith",
      status: "Success",
      action: "Updated patient vitals",
    },
    {
      id: 3,
      timestamp: "2024-12-31 08:45:10",
      patientId: "P097779",
      patientName: "James Wilson",
      role: "Admin",
      roleName: "Abel Admin",
      status: "Success",
      action: "Created new patient record",
    },
  ])

  // Form state for the action input
  const [actionText, setActionText] = useState("")

  // Sample form data
  const [formData, setFormData] = useState({
    timestamp: "2024-12-31 10:15:45",
    patientId: "P097777",
    patientName: "Abdi Abdi",
    role: "Doctor",
    roleName: "John John",
    status: "Success",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleActionChange = (e) => {
    setActionText(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would send data to an API
    console.log("Form submitted:", { ...formData, action: actionText })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Record audit logs</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="timestamp" className="text-sm font-medium">
                  Timestamp
                </label>
                <Input
                  id="timestamp"
                  name="timestamp"
                  value={formData.timestamp}
                  onChange={handleInputChange}
                  placeholder="YYYY-MM-DD HH:MM:SS"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="patientId" className="text-sm font-medium">
                  Patient ID
                </label>
                <Input
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  placeholder="Patient ID"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="patientName" className="text-sm font-medium">
                  Patient Name
                </label>
                <Input
                  id="patientName"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  placeholder="Patient Name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <Input id="role" name="role" value={formData.role} onChange={handleInputChange} placeholder="Role" />
              </div>

              <div className="space-y-2">
                <label htmlFor="roleName" className="text-sm font-medium">
                  Role name
                </label>
                <Input
                  id="roleName"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  placeholder="Role name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Input
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  placeholder="Status"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="action" className="text-sm font-medium">
                Action
              </label>
              <Textarea
                id="action"
                value={actionText}
                onChange={handleActionChange}
                placeholder="Describe the action taken"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Record</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Role Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.patientId}</TableCell>
                  <TableCell>{log.patientName}</TableCell>
                  <TableCell>{log.role}</TableCell>
                  <TableCell>{log.roleName}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default RecordAuditLogs

