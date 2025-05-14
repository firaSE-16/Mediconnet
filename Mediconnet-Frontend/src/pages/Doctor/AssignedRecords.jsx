import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "../../components/ui/card";
import { 
  Search,
  User,
  Stethoscope,
  Activity,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { toast } from "react-toastify";

const BASE_URL = "http://localhost:5500";

const AssignedRecords = () => {
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [assignedRecords, setAssignedRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's basic information
        const authRes = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!authRes.ok) throw new Error("Failed to fetch user info");
        const authData = await authRes.json();

        // Get doctor info
        const doctorRes = await fetch(`${BASE_URL}/api/doctors/getStaffAccount/${authData.userId}`, {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!doctorRes.ok) throw new Error("Failed to fetch doctor information");
        setDoctorInfo(await doctorRes.json());

        // Fetch assigned medical records
        const recordsRes = await fetch(`${BASE_URL}/api/doctors/patients`, { 
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!recordsRes.ok) throw new Error("Failed to load patient records");
        
        const recordsData = await recordsRes.json();
        setAssignedRecords(recordsData.data.map(record => ({
          ...record.patientID,
          patientId:record._id,
          medicalRecordId: record.medicalRecordId,
          recordStatus: record.status,
          firstName: record.firstName,
          lastName:record.lastName,
          faydaID: record.faydaID,
          gender: record.gender,
          age: record.age,
        })));
        console.log(recordsData.data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        toast.error(error.message);
        
        if (error.message.includes("Failed") || error.message.includes("Session")) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filteredRecords = assignedRecords.filter(record => 
    `${record.firstName} ${record.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.faydaID && record.faydaID.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewRecord = (patientId) => {
    navigate(`/doctor/records/${patientId}`);
  };

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-green-100 text-green-800",
      "In-Treatment": "bg-blue-100 text-blue-800",
      "InTreatment": "bg-blue-100 text-blue-800",
      Discharged: "bg-purple-100 text-purple-800",
      Emergency: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800"
    };
    return variants[status] || variants.default;
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const recordsRes = await fetch(`${BASE_URL}/api/doctors/patients`, { 
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!recordsRes.ok) throw new Error("Failed to refresh records");
      
      const recordsData = await recordsRes.json();
      setAssignedRecords(recordsData.data.map(record => ({
        ...record.patientID,
        medicalRecordId: record._id,
        recordStatus: record.status
      })));
    } catch (error) {
      console.error("Refresh error:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error Loading Data</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={refreshData}>
          <Loader2 className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[60px] w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patient Records</h1>
          <p className="text-sm text-muted-foreground">
            Manage your assigned patients and their medical records
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doctor Profile</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {doctorInfo?.specialization}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedRecords.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Patients under your care
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedRecords.filter(p => p.recordStatus === "InTreatment").length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Currently in treatment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>
                {filteredRecords.length} record(s) found
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fayda ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.medicalRecordId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.firstName} {record.lastName}
                            </div>
                            
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.faydaID}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{record.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadge(record.recordStatus)}>
                          {record.recordStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {record.medicalRecordId.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewRecord(record.patientId)}
                        >
                          View <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <User className="h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? "No matching records found" : "No records assigned yet"}
              </p>
              <Button variant="outline" onClick={refreshData}>
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedRecords;