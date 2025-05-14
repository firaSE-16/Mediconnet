import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  FileText,
  CheckCircle,
  Loader2
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/stepper";
import { BASE_URL } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";

const hospitalSchema = z.object({
  name: z.string()
    .min(1, "Hospital name is required")
    .max(100, "Name must be less than 100 characters"),
  location: z.string()
    .min(1, "Location is required")
    .max(200, "Location must be less than 200 characters"),
  contactNumber: z.string()
    .min(10, "Contact number must be at least 10 digits")
    .regex(/^(\+251|0)(9|7)[0-9]{8}$/, "Invalid Ethiopian phone number"),
  licenseNumber: z.string()
    .min(1, "License number is required")
    .max(50, "License number must be less than 50 characters"),
  licenseImage: z.string().min(1, "License image is required")
});

export default function AddHospital() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: "",
      location: "",
      contactNumber: "",
      licenseNumber: "",
      licenseImage: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Register hospital
      const response = await axios.post(
        `${BASE_URL}/system-admin/hospitals`,
        {
          name: values.name,
          location: values.location,
          contactNumber: values.contactNumber,
          licenseNumber: values.licenseNumber,
          licenseImage: values.licenseImage
        },
        { 
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data?.hospital) {
        toast.success("Hospital registered successfully!", {
          position: "top-center",
          autoClose: 5000,
        });
        navigate(`/admin/admin-management/${response.data.hospital.id}/add-admin`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Hospital registration error:", error);
      toast.error(error.response?.data?.msg || "Failed to register hospital", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <Card className="w-full shadow-lg border-0">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Register New Hospital
            </CardTitle>
          </div>
          <Stepper 
            steps={[
              { id: 1, name: 'Hospital Information', status: 'current' },
              { id: 2, name: 'Add Administrators', status: 'upcoming' }
            ]} 
          />
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Hospital Name *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Saint Gabriel Hospital" 
                          {...field} 
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        License Number *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="AB1234567890" 
                          {...field} 
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Number *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+251912345678" 
                          {...field} 
                          className="focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormDescription>
                        Ethiopian phone number format required
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location *
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Full address including city, subcity, and landmark" 
                          {...field} 
                          className="focus-visible:ring-primary min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseImage"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>License Image *</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[180px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Register Hospital
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}