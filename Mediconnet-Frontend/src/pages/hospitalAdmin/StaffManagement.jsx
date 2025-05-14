"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
   const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(`${BASE_URL}/hospital-admin/staff`, {
          credentials: "include",
        });
        const data = await response.json();
        setStaff(data);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch = `${member.firstName} ${member.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roles = [
    "all",
    "Doctor",
    "Nurse",
    "LabTechnician",
    "Pharmacist",
    "Receptionist",
    "Triage",
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Doctor":
        return "bg-blue-100 text-blue-800";
      case "Nurse":
        return "bg-green-100 text-green-800";
      case "LabTechnician":
        return "bg-purple-100 text-purple-800";
      case "Pharmacist":
        return "bg-yellow-100 text-yellow-800";
      case "Receptionist":
        return "bg-pink-100 text-pink-800";
      case "Triage":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Management</h1>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role === "all" ? "All Roles" : role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for Role Filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Doctor">Doctors</TabsTrigger>
          <TabsTrigger value="Nurse">Nurses</TabsTrigger>
          <TabsTrigger value="LabTechnician">Lab Techs</TabsTrigger>
          <TabsTrigger value="Pharmacist">Pharmacists</TabsTrigger>
          <TabsTrigger value="Receptionist">Reception</TabsTrigger>
          <TabsTrigger value="Triage">Triage</TabsTrigger>
        </TabsList>

        {roles.map((role) => (
          <TabsContent key={role} value={role}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {role === "all" ? "All Staff" : `${role}s`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <p>Loading staff...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStaff
                      .filter((member) => role === "all" || member.role === role)
                      .map((member) => (
                        <Card key={member._id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <Avatar>
                              <AvatarImage src={member.profilePhoto} />
                              <AvatarFallback>
                                {member.firstName.charAt(0)}
                                {member.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="text-lg font-medium">
                                {member.firstName} {member.lastName}
                              </h3>
                              <Badge className={getRoleBadgeColor(member.role)}>
                                {member.role}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <span className="mr-2">Email:</span>
                              <span>{member.email}</span>
                            </div>
                            {member.specialization && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <span className="mr-2">Specialization:</span>
                                <span>{member.specialization}</span>
                              </div>
                            )}
                            <div className="flex justify-end pt-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
                {!loading && filteredStaff.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No staff members found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default StaffManagement;