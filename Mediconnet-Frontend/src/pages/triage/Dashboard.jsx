"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Plus, ClipboardList, Stethoscope, Activity } from "lucide-react"
import axios from "axios"
import { BASE_URL } from "@/lib/utils"

const TriageDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    unassigned: 0,
    doctors: 0,
    inTreatment: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/triage/stats`, {
          withCredentials: true
        })
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Triage Dashboard</h1>
        <Button onClick={() => navigate('/triage/unassigned')}>
          <Plus className="mr-2 h-4 w-4" />
          View Patients
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Patients</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats.unassigned}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Awaiting assessment
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/triage/unassigned')}
            >
              View All
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats.doctors}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ready for assignment
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/triage/doctors')}
            >
              View Doctors
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Treatment</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '--' : stats.inTreatment}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Currently being treated
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => navigate('/triage/assigned')}
            >
              View Patients
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default TriageDashboard