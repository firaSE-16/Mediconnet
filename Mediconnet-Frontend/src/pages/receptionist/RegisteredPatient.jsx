"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ClipboardList } from "lucide-react"
import axios from "axios"
import { BASE_URL } from "@/lib/utils"
import moment from "moment"

const RegisteredPatient = () => {
  const { faydaID } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [hospitalID, setHospitalID] = useState(null)
  const [medicalHistory, setMedicalHistory] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get hospital ID from user info
        const userRes = await axios.get(`${BASE_URL}/auth/me`, {
          withCredentials: true
        })
        
        if (!userRes.data.hospitalId) {
          throw new Error("Hospital ID not found in user data")
        }
        
        setHospitalID(userRes.data.hospitalId)

        // Then fetch patient data
        const patientRes = await axios.get(`${BASE_URL}/reception/patient/${faydaID}`, {
          withCredentials: true
        })

        if (patientRes.data.success) {
          setPatient(patientRes.data.patient)
          setMedicalHistory(patientRes.data.patient.medicalHistory || "")
        } else {
          throw new Error(patientRes.data.message || "Failed to fetch patient")
        }
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
        navigate('/receptionist/registration')
      } finally {
        setLoading(false)
      }
    }

    if (faydaID) {
      fetchData()
    } else {
      setError("No patient ID provided")
      navigate('/receptionist/registration')
    }
  }, [faydaID, navigate])

  const handleSubmit = async () => {
    if (!hospitalID || !patient) return

    setSubmitting(true)
    try {
      const response = await axios.post(
        `${BASE_URL}/reception/register-patient`,
        {
          ...patient,
          faydaID,
          hospitalID,
          medicalHistory,
          dateOfBirth: moment(patient.dateOfBirth).format('YYYY-MM-DD')
        },
        { withCredentials: true }
      )

      if (response.data.success) {
        navigate('/receptionist/registration')
      } else {
        throw new Error(response.data.message || "Registration failed")
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error.response?.data?.message || error.message || "Failed to initiate record")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading patient details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => navigate('/receptionist/registration')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Patient Search
          </Button>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p>Patient not found</p>
          <Button onClick={() => navigate('/receptionist/registration')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Patient Search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Patient Details
        </h1>
        <Button variant="outline" onClick={() => navigate('/receptionist/registration')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              {patient.firstName} {patient.lastName}
              <Badge variant="secondary" className="ml-4">
                {patient.faydaID}
              </Badge>
            </div>
            {hospitalID && (
              <Badge variant="outline">
                Hospital ID: {hospitalID}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input 
                value={moment(patient.dateOfBirth).format('DD MMM YYYY')} 
                readOnly 
              />
            </div>
            <div>
              <Label>Gender</Label>
              <Input value={patient.gender} readOnly />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input value={patient.contactNumber} readOnly />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={patient.address} readOnly />
            </div>
          </div>

          <div className="pt-4">
            <Label>Emergency Contact</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <Input 
                  value={patient.emergencyContact?.name || 'Not provided'} 
                  readOnly 
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Relationship</Label>
                <Input 
                  value={patient.emergencyContact?.relation || 'Not provided'} 
                  readOnly 
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <Input 
                  value={patient.emergencyContact?.phone || 'Not provided'} 
                  readOnly 
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Label>Medical History</Label>
            <Textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="Update medical history if needed"
              className="mt-2"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Processing...' : 'Initiate Medical Record'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RegisteredPatient