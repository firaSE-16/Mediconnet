"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, BookOpenText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { BASE_URL } from "@/lib/utils"
import moment from "moment"

const PatientRegistration = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState(null)
  const searchTimeout = useRef(null)

  useEffect(() => {
    if (searchQuery.length >= 3) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
      
      searchTimeout.current = setTimeout(() => {
        handleSearch()
      }, 500)
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [searchQuery, dateFilter])

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      setPatients([])
      return
    }

    setLoading(true)
    try {
      const params = {
        query: searchQuery,
        ...(dateFilter && { date: dateFilter.format('YYYY-MM-DD') })
      }

      const response = await axios.get(`${BASE_URL}/reception/search-patients`, {
        params,
        withCredentials: true
      })

      if (response.data.success) {
        setPatients(response.data.patients)
      } else {
        console.error(response.data.message || 'Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (faydaID) => {
    navigate(`/receptionist/registered/${faydaID}`)
  }

  const handleNewRegistration = () => {
    navigate("/receptionist/newRegistration")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpenText className="h-6 w-6" />
          Patient Registry
        </h1>
        <Button onClick={handleNewRegistration}>
          <UserPlus className="mr-2 h-4 w-4" />
          New Registration
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by ID, name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          type="date"
          placeholder="Filter by date"
          onChange={(e) => setDateFilter(e.target.value ? moment(e.target.value) : null)}
          className="w-[200px]"
        />
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[30%]">Patient</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-[60px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : patients.length > 0 ? (
              patients.map((patient) => (
                <TableRow key={patient.faydaID}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-medium">
                        {patient.firstName.charAt(0).toUpperCase()}{patient.lastName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                        <p className="text-sm text-muted-foreground">ID: {patient.faydaID}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {moment(patient.dateOfBirth).format('DD MMM YYYY')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={patient.gender === 'Female' ? 'default' : 'outline'}
                      className="capitalize px-2 py-1 text-xs"
                    >
                      {patient.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.contactNumber}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePatientSelect(patient.faydaID)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Search className="h-10 w-10 text-gray-400" />
                    <p className="text-gray-500">
                      {searchQuery.length >= 3 ? 
                        'No matching patients found' : 
                        'Search for patients to begin'}
                    </p>
                    {searchQuery.length >= 3 && (
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        Clear search
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
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientRegistration