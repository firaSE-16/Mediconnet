"use client"

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Hospital,
  Calendar,
  ClipboardList,
  MapPin,
  Phone,
  Mail,
  Cake,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isValid, parseISO } from "date-fns";

const ReceptionistDashboard = () => {
  const [receptionistData, setReceptionistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceptionistData = async () => {
      try {
        setLoading(true);
        
        // Fetch receptionist's basic information
        const userRes = await fetch(`http://localhost:5500/api/auth/me`, {
          credentials: "include",
        });
        if (!userRes.ok) throw new Error("Failed to fetch user info");
        const userData = await userRes.json();

        const receptionistRes = await fetch(
          `http://localhost:5500/api/reception/getStaffAccount/${userData.userId}`,
          { credentials: "include" }
        );
        if (!receptionistRes.ok) throw new Error("Failed to fetch receptionist info");
        const receptionistData = await receptionistRes.json();
        setReceptionistData(receptionistData);

      } catch (error) {
        console.error("Error fetching receptionist data:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceptionistData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!receptionistData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Failed to load receptionist data</p>
      </div>
    );
  }

  const formattedDOB = receptionistData.dateOfBirth && isValid(new Date(receptionistData.dateOfBirth))
    ? format(new Date(receptionistData.dateOfBirth), 'MMMM d, yyyy')
    : "N/A";

  const createdAtDate = receptionistData.createdAt && isValid(new Date(receptionistData.createdAt))
    ? new Date(receptionistData.createdAt)
    : null;

  const yearsOfService = createdAtDate
    ? new Date().getFullYear() - createdAtDate.getFullYear()
    : "N/A";

  const createdAtYear = createdAtDate ? format(createdAtDate, 'yyyy') : "N/A";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback>
              {receptionistData.firstName?.charAt(0)}
              {receptionistData.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {receptionistData.firstName} {receptionistData.lastName}
            </h1>
            <p className="text-muted-foreground">Receptionist</p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/receptionist/registration")}
          className="flex items-center gap-2"
        >
          <ClipboardList className="h-4 w-4" />
          Patient Registration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={<Mail />} label="Email" value={receptionistData.email} />
              <InfoRow icon={<Phone />} label="Contact" value={receptionistData.contactNumber} />
              <InfoRow icon={<Cake />} label="Date of Birth" value={formattedDOB} />
              <InfoRow icon={<User />} label="Gender" value={receptionistData.gender} />
              <InfoRow icon={<MapPin />} label="Address" value={receptionistData.address} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {receptionistData.hospital ? (
                <>
                  <InfoRow label="Hospital Name" value={receptionistData.hospital.name} />
                  <InfoRow label="Location" value={receptionistData.hospital.location} />
                  <InfoRow label="Contact" value={receptionistData.hospital.contactNumber} />
                </>
              ) : (
                <p className="text-muted-foreground">Not assigned to any hospital</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Years of Service"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              value={yearsOfService}
              description={`Since ${createdAtYear}`}
            />
            <StatCard
              title="Quick Actions"
              icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
              value="Manage Patients"
              description="Register or view patient records"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No recent activity</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your recent actions will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Common tasks you might need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-32"
                  onClick={() => navigate("/receptionist/registration")}
                >
                  <ClipboardList className="h-6 w-6 mb-2" />
                  <span>Patient Registration</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-32"
                  onClick={() => navigate("/receptionist/appointments")}
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Manage Appointments</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Reusable subcomponents
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p>{value || "N/A"}</p>
    </div>
  </div>
);

const StatCard = ({ title, icon, value, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default ReceptionistDashboard;