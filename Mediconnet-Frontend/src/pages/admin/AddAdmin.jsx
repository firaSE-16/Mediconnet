"use client"

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "@/lib/utils";

const AddAdmin = () => {
  const { id: hospitalId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admins, setAdmins] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dateOfBirth: "",
    }
  ]);

  const handleAdminChange = (index, e) => {
    const { name, value } = e.target;
    setAdmins(prev => {
      const updatedAdmins = [...prev];
      updatedAdmins[index] = {
        ...updatedAdmins[index],
        [name]: value
      };
      return updatedAdmins;
    });
  };

  const handleSelectChange = (index, value) => {
    setAdmins(prev => {
      const updatedAdmins = [...prev];
      updatedAdmins[index] = {
        ...updatedAdmins[index],
        gender: value
      };
      return updatedAdmins;
    });
  };

  const addAdminForm = () => {
    setAdmins(prev => [
      ...prev,
      {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "",
        dateOfBirth: "",
      }
    ]);
  };

  const removeAdminForm = (index) => {
    if (admins.length > 1) {
      setAdmins(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all admins
    for (const admin of admins) {
      if (admin.password !== admin.confirmPassword) {
        toast.error("Passwords do not match for one or more admins");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const adminPromises = admins.map(admin => {
        console.log("Admin data:", hospitalId);
        return axios.post(
          `${BASE_URL}/system-admin/hospital-admins`,
          {
            ...admin,
            hospitalId
          },
          { withCredentials: true }
        );
      });

      await Promise.all(adminPromises);
      toast.success(`${admins.length} administrator(s) added successfully!`);
      navigate(`/admin/hospital-detail/${hospitalId}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.msg || "Failed to register administrators");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/admin/hospital-detail/${hospitalId}`)}
        className="mb-6"
      >
        Back to Hospital Details
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Register Hospital Administrators</CardTitle>
          <CardDescription>
            Add one or more administrators for this hospital
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {admins.map((admin, index) => (
              <div key={index} className="border rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Administrator #{index + 1}</h3>
                  {admins.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdminForm(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        name="firstName"
                        value={admin.firstName}
                        onChange={(e) => handleAdminChange(index, e)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        name="lastName"
                        value={admin.lastName}
                        onChange={(e) => handleAdminChange(index, e)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      name="email"
                      type="email"
                      value={admin.email}
                      onChange={(e) => handleAdminChange(index, e)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input
                        name="password"
                        type="password"
                        value={admin.password}
                        onChange={(e) => handleAdminChange(index, e)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm Password *</Label>
                      <Input
                        name="confirmPassword"
                        type="password"
                        value={admin.confirmPassword}
                        onChange={(e) => handleAdminChange(index, e)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input
                        name="dateOfBirth"
                        type="date"
                        value={admin.dateOfBirth}
                        onChange={(e) => handleAdminChange(index, e)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Select
                        value={admin.gender}
                        onValueChange={(value) => handleSelectChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addAdminForm}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Administrator
            </Button>
          </CardContent>

          <CardFooter className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/hospital-detail/${hospitalId}`)}
            >
              Cancel
            </Button>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={addAdminForm}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add More
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save All Administrators"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddAdmin;