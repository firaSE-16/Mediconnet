"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, ArrowRight, User, Calendar, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { BASE_URL } from "@/lib/utils"

const UnassignedPatients = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })
  const [error, setError] = useState(null)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${BASE_URL}/triage/unassigned`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        },
        withCredentials: true
      })
      
      setPatients(response.data.patients || [])
      setPagination({
        ...pagination,
        total: response.data.total || 0,
        pages: response.data.pages || 1
      })
    } catch (err) {
      console.error("Failed to fetch patients:", err)
      setError("Failed to load patients. Please try again.")
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPatients()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, pagination.page])

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage })
    }
  }

  const handleViewPatient = (patientId) => {
    navigate(`/triage/process/${patientId}`)
  }

  const getUrgencyBadgeVariant = (urgency) => {
    switch (urgency) {
      case 'High': return 'destructive'
      case 'Medium': return 'warning'
      case 'Low': return 'secondary'
      default: return 'outline'
    }
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto max-w-md bg-background rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-destructive mb-4">{error}</h2>
          <Button 
            variant="outline" 
            onClick={fetchPatients}
            className="mt-2"
          >
            Retry Loading Patients
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unassigned Patients</h1>
          <p className="text-sm text-muted-foreground">
            Manage patients awaiting assignment to healthcare providers
          </p>
        </div>
        <Button 
          onClick={() => navigate('/triage/dashboard')}
          className="shrink-0"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-background rounded-lg border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name, Fayda ID, or contact..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPagination({ ...pagination, page: 1 })
              }}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground ml-auto">
            {!loading && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {pagination.total} patients
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="w-[30%]">Patient Information</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-3 w-[80px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <TableRow key={patient._id} className="hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-medium">
                          {patient.patientID?.firstName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {patient.patientID?.firstName || 'Unknown'} {patient.patientID?.lastName || ''}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                              {patient.faydaID}
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                              <User className="h-3 w-3" />
                              {patient.patientID?.gender || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUrgencyBadgeVariant(patient.triageData?.urgency)} className="capitalize">
                        {patient.triageData?.urgency || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(patient.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewPatient(patient._id)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="h-10 w-10 text-gray-400" />
                      <p className="text-gray-500">No unassigned patients found</p>
                      {searchTerm && (
                        <Button variant="outline" onClick={() => setSearchTerm("")}>
                          Clear search filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {patients.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> patients
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UnassignedPatients