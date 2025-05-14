"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, User, Stethoscope, Activity, UserCog } from "lucide-react"
import axios from "axios"
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    userCounts: {
      Patient: 0,
      HospitalAdministrator: 0,
      Admin: 0,
      Doctor: 0
    },
    loading: true,
    error: null
  })

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await axios.get("http://localhost:5500/api/system-admin/summaryHospitals", {
          withCredentials: true,
        });
        
        console.log("API Response:", data); // Log the full response
        
        if (data && data.success && data.data) {
          setStats({
            totalHospitals: data.data.totalHospitals,
            userCounts: data.data.userCounts,
            loading: false,
            error: null
          });
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to load dashboard data"
        }));
      }
    }

    fetchDashboardData();
  }, []);

  // Prepare data for charts
  const userTypeData = [
    { name: 'Patients', value: stats.userCounts.Patient, icon: <User className="h-4 w-4" /> },
    { name: 'Hospital Admins', value: stats.userCounts.HospitalAdministrator, icon: <UserCog className="h-4 w-4" /> },
    { name: 'System Admins', value: stats.userCounts.Admin, icon: <Users className="h-4 w-4" /> },
    { name: 'Doctors', value: stats.userCounts.Doctor, icon: <Stethoscope className="h-4 w-4" /> },
  ].filter(item => item.value > 0);

  const barChartData = [
    { name: 'Patients', count: stats.userCounts.Patient },
    { name: 'Hospital Admins', count: stats.userCounts.HospitalAdministrator },
    { name: 'System Admins', count: stats.userCounts.Admin },
    { name: 'Doctors', count: stats.userCounts.Doctor },
  ];

  if (stats.loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">System Administration Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">System Administration Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{stats.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Administration Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Hospitals" 
          value={stats.totalHospitals} 
          description="Registered in the system"
          icon={<Building className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard 
          title="Patients" 
          value={stats.userCounts.Patient} 
          description="Registered patients"
          icon={<User className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard 
          title="Hospital Admins" 
          value={stats.userCounts.HospitalAdministrator} 
          description="Hospital administrators"
          icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard 
          title="System Admins" 
          value={stats.userCounts.Admin} 
          description="Platform administrators"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard 
          title="Doctors" 
          value={stats.userCounts.Doctor} 
          description="Registered doctors"
          icon={<Stethoscope className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of user types in the system</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Counts</CardTitle>
            <CardDescription>Number of users by type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Type Details</CardTitle>
            <CardDescription>Detailed breakdown of user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userTypeData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted mr-4">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full" 
                        style={{
                          width: `${(item.value / Math.max(1, Object.values(stats.userCounts).reduce((a, b) => a + b, 0))) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, description, icon }) => (
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

export default Dashboard;