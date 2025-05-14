import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  ClipboardList,
  FileText,
  Stethoscope,
  Activity,
  HeartPulse,
  Thermometer,
  Loader2,
  Play,
  Plus,
  X,
  Pill,
  FlaskConical,
  FileWarning,
  ClipboardCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Home,
} from "lucide-react";import { format, isValid } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify"
import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = "http://localhost:5500/api/doctors";

// Helper function to safely format dates
const safeFormat = (date, formatStr) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isValid(d) ? format(d, formatStr) : "Invalid date";
};

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [recordForm, setRecordForm] = useState({
    diagnosis: "",
    treatmentPlan: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      oxygenSaturation: ""
    }
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicineList: [{ name: "", dosage: "", frequency: "", duration: "" }],
    instructions: ""
  });

  const [labForm, setLabForm] = useState({
    testType: "",
    instructions: "",
    urgency: "Normal"
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch patient profile
        const patientRes = await fetch(`${BASE_URL}/patients/${patientId}/profile`, { 
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(patientRes)
       
        
        if (!patientRes.ok) throw new Error("Failed to fetch patient profile");
        const patientData = await patientRes.json();

        console.log("Patient Data:", patientData);
        
        setPatient(patientData.data.patient);
        setCurrentRecord(patientData.data.currentVisit);

        // Fetch patient's medical history
        const historyRes = await fetch(`${BASE_URL}/patients/${patientId}/records`, { 
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!historyRes.ok) throw new Error("Failed to fetch medical history");
        const historyData = await historyRes.json();
        setMedicalHistory(historyData.data.medicalHistory || []);

        // If there's a current record, fetch its prescriptions and lab requests
        if (patientData.data.currentVisit) {
          const prescriptionsRes = await fetch(
            `${BASE_URL}/records/${patientData.data.currentVisit.recordId}/prescriptions`, 
            { 
              credentials: "include",
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          if (!prescriptionsRes.ok) throw new Error("Failed to fetch prescriptions");
          const prescriptionsData = await prescriptionsRes.json();
          setPrescriptions(prescriptionsData.data || []);

          const labsRes = await fetch(
            `${BASE_URL}/records/${patientData.data.currentVisit.recordId}/lab-requests`, 
            { 
              credentials: "include",
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          if (!labsRes.ok) throw new Error("Failed to fetch lab requests");
          const labsData = await labsRes.json();
          setLabRequests(labsData.data || []);
        }

        // Initialize form with existing record data if in treatment
        if (patientData.data.currentVisit?.status === "InTreatment") {
          setRecordForm({
            diagnosis: patientData.data.currentVisit.doctorNotes?.diagnosis || "",
            treatmentPlan: patientData.data.currentVisit.doctorNotes?.treatmentPlan || "",
            vitals: patientData.data.currentVisit.triageData?.vitals || {
              bloodPressure: "",
              heartRate: "",
              oxygenSaturation: ""
            }
          });
        }

      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  const handleBack = () => navigate(-1);

  const startTreatment = async () => {
    try {
      if (!currentRecord) return;
      
      setIsSubmitting(true);
      const response = await fetch(
        `${BASE_URL}/records/${currentRecord.recordId}/start-treatment`, 
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start treatment");
      }

      const data = await response.json();
      setCurrentRecord(data.data);
      toast.success("Treatment started successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!currentRecord) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `${BASE_URL}/records/${currentRecord.recordId}`, 
        {
          method: "PUT",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            diagnosis: recordForm.diagnosis,
            treatmentPlan: recordForm.treatmentPlan,
            vitals: recordForm.vitals
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update record");
      }

      const data = await response.json();
      setCurrentRecord(data.data);
      toast.success("Medical record updated successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicineList: [...prev.medicineList, { name: "", dosage: "", frequency: "", duration: "" }]
    }));
  };

  const handleRemoveMedicine = (index) => {
    if (prescriptionForm.medicineList.length > 1) {
      setPrescriptionForm(prev => ({
        ...prev,
        medicineList: prev.medicineList.filter((_, i) => i !== index)
      }));
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...prescriptionForm.medicineList];
    newMedicines[index][field] = value;
    setPrescriptionForm(prev => ({ ...prev, medicineList: newMedicines }));
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!currentRecord) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `${BASE_URL}/records/${currentRecord.recordId}/prescriptions`, 
        {
          method: "POST",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            medicines: prescriptionForm.medicineList.filter(
              med => med.name && med.dosage && med.frequency && med.duration
            ),
            instructions: prescriptionForm.instructions
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create prescription");
      }

      const data = await response.json();
      setPrescriptions([data.data, ...prescriptions]);
      setPrescriptionForm({
        medicineList: [{ name: "", dosage: "", frequency: "", duration: "" }],
        instructions: ""
      });
      
      toast.success("Prescription created successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLabRequestSubmit = async (e) => {
    e.preventDefault();
    if (!currentRecord) return;
    
    setIsSubmitting(true);
    
    try {
      console.log(currentRecord.recordId)
      const response = await fetch(
        
        `${BASE_URL}/records/${currentRecord.recordId}/lab-requests`, 
        {
          method: "POST",
          credentials: "include",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            testType: labForm.testType,
            instructions: labForm.instructions,
            urgency: labForm.urgency
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create lab request");
      }

      const data = await response.json();
      setLabRequests([data.data, ...labRequests]);
      setLabForm({
        testType: "",
        instructions: "",
        urgency: "Normal"
      });
      
      toast.success("Lab request created successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-[200px]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </TabsList>
          
          <div className="mt-6 space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </Tabs>
      </div>
    );
  }

  if (!patient) {
    return (
      navigate("/doctor/assigned-records")
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Patient Profile</h1>
          <p className="text-sm text-muted-foreground">
            {patient.basicInfo.firstName} {patient.basicInfo.lastName}'s medical profile
          </p>
        </div>
      </div>
  
      {/* Patient Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{patient.basicInfo.firstName} {patient.basicInfo.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fayda ID</p>
                <p className="font-medium">{patient.basicInfo.faydaID}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium capitalize">{patient.basicInfo.gender?.toLowerCase()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {safeFormat(patient.basicInfo.dateOfBirth, "PPP")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">
                  {patient.basicInfo.age || "N/A"} years
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{patient.basicInfo.bloodGroup || "Not specified"}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge 
                  variant={
                    patient.basicInfo.status === "Active" ? "default" :
                    patient.basicInfo.status === "InTreatment" ? "secondary" :
                    "destructive"
                  }
                >
                  {patient.basicInfo.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">{patient.basicInfo.contactNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{patient.basicInfo.address || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  
      {/* Emergency Contact */}
      {patient.emergencyContact && (
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patient.emergencyContact.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium capitalize">{patient.emergencyContact.relation.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{patient.emergencyContact.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
  
      {/* Medical Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 bg-gray-50 p-1 h-12">
        <TabsTrigger
          value="profile"
          className="data-[state=active]:shadow-sm data-[state=active]:bg-white py-1"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="font-medium">Patient Profile</span>
        </TabsTrigger>
        <TabsTrigger
          value="records"
          className="data-[state=active]:shadow-sm data-[state=active]:bg-white py-1"
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          <span className="font-medium">Current Record</span>
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="data-[state=active]:shadow-sm data-[state=active]:bg-white py-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          <span className="font-medium">Medical History</span>
        </TabsTrigger>
      </TabsList>

      {/* Patient Profile Tab */}
      <TabsContent value="profile" className="pt-6 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Patient Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </h3>
                <p className="font-medium">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                <p className="font-medium">
                  {safeFormat(patient.dateOfBirth, "PPP")}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Contact Information
                </h3>
                <p className="font-medium">{patient.phoneNumber}</p>
                <p className="font-medium text-sm text-gray-600 mt-1">
                  {patient.email}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Emergency Contact
                </h3>
                <p className="font-medium">
                  {patient.emergencyContact?.name || "Not specified"}
                </p>
                <p className="font-medium text-sm text-gray-600 mt-1">
                  {patient.emergencyContact?.phone || ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <span>Medical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Medical History
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                  <p className="font-medium">
                    {patient.medicalInfo.medicalHistory ||
                      "No significant medical history"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Allergies
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                  {patient.medicalInfo.allergies.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {patient.medicalInfo.allergies.map((allergy, index) => (
                        <li key={index} className="font-medium">
                          {allergy}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-medium">No known allergies</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Current Medications
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[80px]">
                {patient.medicalInfo.currentMedications?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {patient.medicalInfo.currentMedications.map(
                      (med, index) => (
                        <li key={index} className="font-medium">
                          {med.name} - {med.dosage}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="font-medium">No current medications</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              <span>Hospital Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Registered Hospitals
              </h3>
              <div className="space-y-3">
                {patient.hospitalInfo.registeredHospitals?.length > 0 ? (
                  patient.hospitalInfo.registeredHospitals.map((hospital) => (
                    <div
                      key={hospital._id}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      <p className="font-medium">{hospital.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {hospital.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        {hospital.registrationDate &&
                          `Registered on ${safeFormat(
                            hospital.registrationDate,
                            "PPP"
                          )}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">No registered hospitals</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Primary Care Physician
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {patient.hospitalInfo.assignedDoctor ? (
                    <>
                      <p className="font-medium">
                        Dr. {patient.hospitalInfo.assignedDoctor.firstName}{" "}
                        {patient.hospitalInfo.assignedDoctor.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {patient.hospitalInfo.assignedDoctor.specialization}
                      </p>
                      <p className="text-sm text-gray-600">
                        {patient.hospitalInfo.assignedDoctor.department}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium">No assigned doctor</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Insurance Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {patient.hospitalInfo.insurance ? (
                    <>
                      <p className="font-medium">
                        {patient.hospitalInfo.insurance.provider}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Policy #: {patient.hospitalInfo.insurance.policyNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires:{" "}
                        {safeFormat(
                          patient.hospitalInfo.insurance.expirationDate,
                          "PPP"
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium">No insurance information</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Current Record Tab */}
      <TabsContent value="records" className="pt-6 space-y-6">
        {currentRecord ? (
          <>
            {/* Current Record Status Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    <span>Current Medical Record</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge
                      variant={
                        currentRecord.status === "Assigned"
                          ? "secondary"
                          : currentRecord.status === "InTreatment"
                          ? "default"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {currentRecord.status === "InTreatment" ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>In Treatment</span>
                        </div>
                      ) : currentRecord.status === "Completed" ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Completed</span>
                        </div>
                      ) : (
                        currentRecord.status
                      )}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Created on {safeFormat(currentRecord.createdAt, "PPPp")}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Triage Information */}
            {currentRecord.triageData && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <span>Triage Assessment</span>
                  </CardTitle>
                  <CardDescription>
                    Completed by {currentRecord.triageData.triageOfficer?.name ||
                      "Triage Officer"} on{" "}
                    {safeFormat(currentRecord.triageData.completedAt, "PPPp")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Urgency Level
                      </h3>
                      <Badge
                        variant={
                          currentRecord.triageData.urgency === "High"
                            ? "destructive"
                            : currentRecord.triageData.urgency === "Medium"
                            ? "secondary"
                            : "default"
                        }
                        className="capitalize"
                      >
                        {currentRecord.triageData.urgency}
                      </Badge>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Chief Complaint
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p>
                          {currentRecord.triageData.chiefComplaint ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      Initial Vitals
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Activity className="h-4 w-4" />
                          <span className="text-xs">Blood Pressure</span>
                        </div>
                        <p className="font-medium mt-1">
                          {currentRecord.triageData.vitals?.bloodPressure ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          <HeartPulse className="h-4 w-4" />
                          <span className="text-xs">Heart Rate</span>
                        </div>
                        <p className="font-medium mt-1">
                          {currentRecord.triageData.vitals?.heartRate
                            ? `${currentRecord.triageData.vitals.heartRate} bpm`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Thermometer className="h-4 w-4" />
                          <span className="text-xs">Temperature</span>
                        </div>
                        <p className="font-medium mt-1">
                          {currentRecord.triageData.vitals?.temperature
                            ? `${currentRecord.triageData.vitals.temperature}°C`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Activity className="h-4 w-4" />
                          <span className="text-xs">Oxygen Sat.</span>
                        </div>
                        <p className="font-medium mt-1">
                          {currentRecord.triageData.vitals?.oxygenSaturation
                            ? `${currentRecord.triageData.vitals.oxygenSaturation}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentRecord.triageData.notes && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Triage Notes
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p>{currentRecord.triageData.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Doctor's Notes and Treatment */}
            {currentRecord.status === "InTreatment" && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Doctor's Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleRecordSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Diagnosis *
                      </h3>
                      <Textarea
                        placeholder="Enter primary diagnosis..."
                        value={recordForm.diagnosis}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            diagnosis: e.target.value,
                          })
                        }
                        required
                        className="min-h-[120px]"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        Treatment Plan *
                      </h3>
                      <Textarea
                        placeholder="Describe the treatment plan..."
                        value={recordForm.treatmentPlan}
                        onChange={(e) =>
                          setRecordForm({
                            ...recordForm,
                            treatmentPlan: e.target.value,
                          })
                        }
                        required
                        className="min-h-[120px]"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        Current Vitals
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Blood Pressure
                          </label>
                          <Input
                            placeholder="e.g., 120/80"
                            value={recordForm.vitals.bloodPressure}
                            onChange={(e) =>
                              setRecordForm({
                                ...recordForm,
                                vitals: {
                                  ...recordForm.vitals,
                                  bloodPressure: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Heart Rate (bpm)
                          </label>
                          <Input
                            type="number"
                            placeholder="e.g., 72"
                            value={recordForm.vitals.heartRate}
                            onChange={(e) =>
                              setRecordForm({
                                ...recordForm,
                                vitals: {
                                  ...recordForm.vitals,
                                  heartRate: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Oxygen Saturation (%)
                          </label>
                          <Input
                            type="number"
                            placeholder="e.g., 98"
                            value={recordForm.vitals.oxygenSaturation}
                            onChange={(e) =>
                              setRecordForm({
                                ...recordForm,
                                vitals: {
                                  ...recordForm.vitals,
                                  oxygenSaturation: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full md:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating Record...
                          </>
                        ) : (
                          "Save Assessment"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Start Treatment Card */}
            {currentRecord.status === "Assigned" && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span>Ready for Treatment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                    <ClipboardCheck className="h-12 w-12 text-blue-600" />
                    <h3 className="text-xl font-medium">
                      Patient Ready for Consultation
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Please review the triage information and begin treatment
                      when ready. This will mark the patient as "In Treatment"
                      in the system.
                    </p>
                    <Button
                      onClick={startTreatment}
                      disabled={isSubmitting}
                      className="mt-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Begin Treatment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prescriptions Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  <span>Prescriptions</span>
                </CardTitle>
                <CardDescription>
                  {prescriptions.length} prescription(s) for this visit
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* New Prescription Form */}
                {currentRecord.status === "InTreatment" && (
                  <div className="mb-8">
                    <form
                      onSubmit={handlePrescriptionSubmit}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        {prescriptionForm.medicineList.map((medicine, index) => (
                          <div
                            key={`medicine-${index}`}
                            className="border rounded-lg p-4 relative bg-gray-50"
                          >
                            {prescriptionForm.medicineList.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => handleRemoveMedicine(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">
                                  Medicine Name *
                                </label>
                                <Input
                                  placeholder="e.g., Amoxicillin"
                                  value={medicine.name}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">
                                  Dosage *
                                </label>
                                <Input
                                  placeholder="e.g., 500mg"
                                  value={medicine.dosage}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "dosage",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">
                                  Frequency *
                                </label>
                                <Input
                                  placeholder="e.g., Twice daily"
                                  value={medicine.frequency}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "frequency",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">
                                  Duration *
                                </label>
                                <Input
                                  placeholder="e.g., 7 days"
                                  value={medicine.duration}
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleAddMedicine}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Medication
                        </Button>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Additional Instructions
                        </label>
                        <Textarea
                          placeholder="Special instructions for the patient..."
                          value={prescriptionForm.instructions}
                          onChange={(e) =>
                            setPrescriptionForm({
                              ...prescriptionForm,
                              instructions: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          className="w-full md:w-auto"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Prescription"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Prescriptions List */}
                <div className="space-y-4">
                  {prescriptions.length > 0 ? (
                    prescriptions.map((prescription) => (
                      <Card
                        key={prescription._id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                          <div>
                            <p className="text-sm font-medium">
                              {safeFormat(prescription.datePrescribed, "PPPp")}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Prescribed by Dr.{" "}
                              {prescription.doctorID?.firstName}{" "}
                              {prescription.doctorID?.lastName}
                            </p>
                          </div>
                          <Badge
                            variant={
                              prescription.isFilled ? "default" : "secondary"
                            }
                          >
                            {prescription.isFilled ? "Filled" : "Pending"}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {prescription.medicineList?.map((medicine, idx) => (
                              <div
                                key={`med-${prescription._id}-${idx}`}
                                className="border rounded-lg p-3 bg-gray-50"
                              >
                                <div className="flex justify-between items-start">
                                  <p className="font-medium">{medicine.name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                      {medicine.dosage}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-1 text-sm">
                                  <span className="text-gray-600">Take</span>{" "}
                                  {medicine.frequency}{" "}
                                  <span className="text-gray-600">for</span>{" "}
                                  {medicine.duration}
                                </div>
                              </div>
                            ))}
                          </div>

                          {prescription.instructions && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-1">
                                Additional Instructions
                              </p>
                              <p className="text-sm text-gray-600">
                                {prescription.instructions}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <Pill className="h-12 w-12 text-gray-400" />
                      <p className="text-lg font-medium text-gray-500">
                        No prescriptions for this visit
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lab Requests Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-blue-600" />
                  <span>Lab Requests</span>
                </CardTitle>
                <CardDescription>
                  {labRequests.length} request(s) for this visit
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* New Lab Request Form */}
                {currentRecord?.status === "InTreatment" && (
                  <div className="mb-8">
                    <form onSubmit={handleLabRequestSubmit} className="space-y-6">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Test Type *
                        </label>
                        <Input
                          placeholder="e.g., Complete Blood Count"
                          value={labForm.testType}
                          onChange={(e) =>
                            setLabForm({ ...labForm, testType: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Priority
                          </label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={labForm.urgency}
                            onChange={(e) =>
                              setLabForm({ ...labForm, urgency: e.target.value })
                            }
                          >
                            <option value="Normal">Normal</option>
                            <option value="Urgent">Urgent</option>
                            <option value="STAT">STAT (Immediate)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Instructions
                        </label>
                        <Textarea
                          placeholder="Special instructions for the lab..."
                          value={labForm.instructions}
                          onChange={(e) =>
                            setLabForm({
                              ...labForm,
                              instructions: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          className="w-full md:w-auto"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Create Lab Request"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Lab Requests List */}
                <div className="space-y-4">
                  {labRequests.length > 0 ? (
                    labRequests.map((request) => (
                      <Card
                        key={request._id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                          <div>
                            <p className="text-sm font-medium">
                              {request.testType}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Requested on {safeFormat(request.requestDate, "PPP")}
                              {request.completionDate && (
                                <span className="ml-2">
                                  • Completed on{" "}
                                  {safeFormat(request.completionDate, "PPP")}
                                </span>
                              )}
                            </p>
                          </div>
                          <Badge
                            variant={
                              request.status === "Completed"
                                ? "default"
                                : request.status === "In Progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {request.status}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Priority
                              </p>
                              <Badge
                                variant={
                                  request.urgency === "Urgent"
                                    ? "secondary"
                                    : request.urgency === "STAT"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {request.urgency}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Requested By
                              </p>
                              <p className="text-sm">
                                Dr. {request.doctorID?.firstName}{" "}
                                {request.doctorID?.lastName}
                              </p>
                            </div>
                          </div>

                          {request.instructions && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Instructions
                              </p>
                              <p className="text-sm text-gray-600">
                                {request.instructions}
                              </p>
                            </div>
                          )}

                          {request.results && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Results
                              </p>
                              {typeof request.results === "string" ? (
                                <p className="text-sm text-gray-600">
                                  {request.results}
                                </p>
                              ) : (
                                <div className="text-sm text-gray-600 space-y-2">
                                  {Object.entries(request.results).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex justify-between"
                                      >
                                        <span>{key}:</span>
                                        <span className="font-medium">
                                          {value}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <FlaskConical className="h-12 w-12 text-gray-400" />
                      <p className="text-lg font-medium text-gray-500">
                        No lab requests for this visit
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-12 pb-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <FileWarning className="h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium text-gray-500">
                  No active medical record found
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/doctor/assigned-records")}
                >
                  View Assigned Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Medical History Tab */}
      <TabsContent value="history" className="pt-6 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Medical History</span>
            </CardTitle>
            <CardDescription>
              Previous medical records and visits
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {medicalHistory.length > 0 ? (
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <Card
                    key={record._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {safeFormat(record.createdAt, "PPP")}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {record.diagnosis || "No diagnosis recorded"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          record.status === "Completed"
                            ? "default"
                            : record.status === "InTreatment"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {record.status}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {record.treatmentPlan && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Treatment Plan
                          </p>
                          <p className="text-sm text-gray-600">
                            {record.treatmentPlan}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <FileText className="h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium text-gray-500">
                  No medical history found
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
      
    </div>
  );
};

export default PatientDetail;