"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, Search, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { BASE_URL } from "@/lib/utils"

const HospitalManagement = () => {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  })

  // Fetch hospitals with pagination and search
  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BASE_URL}/system-admin/hospitals`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        },
        withCredentials: true
      })
      
      setHospitals(response.data.hospitals)
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages
      })
    } catch (error) {
      console.error("Failed to fetch hospitals:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchHospitals()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, pagination.page])

  const handleAddHospital = () => {
    navigate("/admin/hospital-management/add-hospital")
  }

  const handleViewDetails = (hospitalId) => {
    navigate(`/admin/hospital-detail/${hospitalId}`)
  }

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hospital Management</h1>
        <Button onClick={handleAddHospital}>
          <Plus className="mr-2 h-4 w-4" />
          Add Hospital
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location or license..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPagination({ ...pagination, page: 1 })
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[30%]">Hospital</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
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
            ) : hospitals.length > 0 ? (
              hospitals.map((hospital) => (
                <TableRow 
                  key={hospital._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(hospital._id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-medium">
                        {hospital.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{hospital.name}</p>
                        <p className="text-sm text-muted-foreground">{hospital.licenseNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{hospital.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={hospital.status === "active" ? "default" : "destructive"}
                      className="capitalize px-2 py-1 text-xs"
                    >
                      {hospital.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(hospital.updatedAt || hospital.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(hospital._id)
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(hospital._id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {hospital.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/admin-management/${hospital._id}/add-admin`)}>
                            Add Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Search className="h-10 w-10 text-gray-400" />
                    <p className="text-gray-500">No hospitals found</p>
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
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

      {hospitals.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} hospitals
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
  )
}

export default HospitalManagement