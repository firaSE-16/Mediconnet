// src/pages/Login.jsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BASE_URL } from "@/lib/utils";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import getUser from "@/lib/getUser";
import { roleRedirects } from "@/lib/role";
import { useUser } from "@/context/UserContext";
import hospitalImage from "@/images/hospital.jpg";

const roles = [
  "Admin",
  "HospitalAdministrator",
  "Receptionist",
  "Doctor",
  "Triage",
  "LabTechnician",
  "Pharmacist",
];

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(roles, { required_error: "Role is required" }),
});

const Login = () => {
  const navigate = useNavigate();
  const { setUserRole } = useUser(); 

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: undefined,
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: data.username,
          password: data.password,
          role: data.role,
        }),
      });
  
      const responseData = await res.json();
      console.log(responseData)
   
      if (!res.ok) {
        throw new Error(responseData.msg || "Login failed");
      }
      const user = await getUser();
      
 

      if (user) {
        setUserRole(responseData.role);
      console.log(roleRedirects[responseData.role])
        
        navigate(roleRedirects[responseData.role] || "/not-authorized");
        toast.success("Login successful");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hospital Image Section */}
      <div className="md:w-1/2 h-64 md:h-auto relative">
        <img 
          src={hospitalImage} 
          alt="Modern Hospital Facility" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Hospital Management System</h1>
            <p className="text-white/90">Secure access to medical records and services</p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-gray-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold">Staff Login Portal</h2>
            <p className="mt-2 text-gray-600">Please enter your credentials</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role} className="py-3">
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button type="submit" className="w-full h-12 text-md">
                  Sign In
                </Button>
              </div>
            </form>
          </Form>

          <div className="text-center text-sm">
            <a href="#" className="font-medium text-gray-600 hover:underline">Forgot password?</a>
            <p className="mt-4 text-gray-500">Contact IT Support for assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;