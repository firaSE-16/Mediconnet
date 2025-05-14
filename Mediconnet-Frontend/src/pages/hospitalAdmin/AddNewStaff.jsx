"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BASE_URL } from "@/lib/utils";
import { toast } from "react-toastify";
import ImageUpload from "@/components/ImageUpload";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import getUser from "@/lib/getUser";

// Unified schema that includes all optional fields
const staffSchema = z
  .object({
    role: z.enum(["Doctor", "LabTechnician", "Pharmacist", "Receptionist", "Triage"], {
      required_error: "Please select a role",
    }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    profilePhoto: z.string().min(1, "Profile Photo is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["Male", "Female", "Other"], {
      required_error: "Gender is required",
    }),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    specialization: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Fields required for all roles except base
    if (["Doctor", "LabTechnician", "Pharmacist", "Receptionist", "Triage"].includes(data.role)) {
      if (!data.contactNumber || data.contactNumber.length < 10) {
        ctx.addIssue({
          path: ["contactNumber"],
          code: z.ZodIssueCode.custom,
          message: "Contact number must be at least 10 digits",
        });
      }
      if (!data.address) {
        ctx.addIssue({
          path: ["address"],
          code: z.ZodIssueCode.custom,
          message: "Address is required",
        });
      }
    }
    if (data.role === "Doctor" && !data.specialization) {
      ctx.addIssue({
        path: ["specialization"],
        code: z.ZodIssueCode.custom,
        message: "Specialization is required",
      });
    }
  });

export default function AddStaffForm() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: "",
      firstName: "",
      lastName: "",
      email: "",
      profilePhoto: "",
      password: "",
      dateOfBirth: "",
      gender: "",
      contactNumber: "",
      address: "",
      specialization: "",
    },
  });

  const selectedRole = useWatch({
    control: form.control,
    name: "role",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user && user.role === "HospitalAdministrator") {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, []);

  const onSubmit = async (data) => {
    if (!currentUser?.hospitalId) {
      toast.error("Hospital information not found");
      return;
    }

    setLoading(true);
    try {
      const staffData = {
        ...data,
        hospitalID: currentUser.hospitalId,
        ...(data.role !== "Doctor" && { specialization: undefined }),
      };
      console.log("🚀 ~ onSubmit ~ staffData:", staffData)

      const response = await fetch(`${BASE_URL}/hospital-admin/add-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(staffData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add staff");
      }

      toast.success(`${data.role} added successfully!`);
      form.reset();
    } catch (error) {
      console.error("Error adding staff:", error);
      toast.error(error.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (!selectedRole) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="+251912345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedRole === "Doctor" && (
          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialization</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Cardiology" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Staff Member</h1>
      <Card>
        <CardHeader>
          <CardTitle>Staff Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Doctor">Doctor</SelectItem>
                        <SelectItem value="LabTechnician">Lab Technician</SelectItem>
                        <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                        <SelectItem value="Receptionist">Receptionist</SelectItem>
                        <SelectItem value="Triage">Triage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["firstName", "lastName", "email", "password", "dateOfBirth"].map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldName.replace(/([A-Z])/g, " $1")}</FormLabel>
                        <FormControl>
                          <Input
                            type={fieldName === "password" ? "password" : fieldName === "email" ? "email" : fieldName === "dateOfBirth" ? "date" : "text"}
                            placeholder={fieldName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* Gender Select */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                  control={form.control}
                  name="profilePhoto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <ImageUpload 
                          onChange={field.onChange} 
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              {/* Conditional Fields */}
              {renderRoleSpecificFields()}

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding Staff..." : "Add Staff Member"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
