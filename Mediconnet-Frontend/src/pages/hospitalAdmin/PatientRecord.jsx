"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Search, Filter, User } from "lucide-react"

const PatientRecords = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState("list") // list or consultancy
  const [department, setDepartment] = useState("")
  const [doctor, setDoctor] = useState("")

  // Sample patients data
  const patients = [
    { id: 1, name: "Patient name" },
    { id: 2, name: "Patient name" },
    { id: 3, name: "Patient name" },
    { id: 4, name: "Patient name" },
    { id: 5, name: "Patient name" },
    { id: 6, name: "Patient name" },
    { id: 7, name: "Patient name" },
    { id: 8, name: "Patient name" },
    { id: 9, name: "Patient name" },
  ]

  // Sample departments
  const departments = [
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Neurology" },
    { id: 3, name: "Pediatrics" },
    { id: 4, name: "Orthopedics" },
  ]

  // Sample doctors
  const doctors = [
    { id: 1, name: "Dr. John Smith" },
    { id: 2, name: "Dr. Sarah Johnson" },
    { id: 3, name: "Dr. Michael Brown" },
    { id: 4, name: "Dr. Emily Davis" },
  ]

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleViewPatient = (patientId) => {
    navigate(`/receptionist/patient-records/${patientId}`)
  }

  const handleAddToQueue = () => {
    // In a real app, this would add the patient to the queue
    alert("Patient added to queue successfully!")
    setView("list")
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="relative w-full mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search for anything here..."
          className="pl-10 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h1 className="text-2xl font-bold mb-6">Patient Records</h1>

      {view === "list" ? (
        <div>
          <div className="relative w-full mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Enter fayda number"
              className="pl-10 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <span>{patient.name}</span>
                </div>
                <Button
                  onClick={() => handleViewPatient(patient.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-medium mb-4">Consultancy Information</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="department" className="block mb-2">
                Department
              </label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department" className="w-full text-black">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="doctor" className="block mb-2">
                Doctor
              </label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger id="doctor" className="w-full text-black">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id.toString()}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddToQueue} className="bg-blue-600 hover:bg-blue-700 text-white">
                Add to queue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientRecords

