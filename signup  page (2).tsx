"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [maritalStatus, setMaritalStatus] = useState("");
  const [childrenCount, setChildrenCount] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">PAN Number</Label>
                <Input id="pan" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhar">Aadhaar Number</Label>
                <Input id="aadhar" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollno">Class X Roll Number</Label>
                <Input id="rollno" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marital-status">Marital Status</Label>
                <Select onValueChange={setMaritalStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {maritalStatus === "married" && (
                <div className="space-y-2">
                  <Label htmlFor="marriage-cert">Marriage Certificate Number</Label>
                  <Input id="marriage-cert" />
                </div>
              )}

              {maritalStatus === "married" && (
                <div className="space-y-2">
                  <Label htmlFor="children">Number of Children</Label>
                  <Select onValueChange={setChildrenCount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {maritalStatus === "married" && parseInt(childrenCount) > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Children's Details</h3>
                {Array.from({ length: parseInt(childrenCount) }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`child-cert-${index}`}>
                      Child {index + 1} Birth Certificate Number
                    </Label>
                    <Input id={`child-cert-${index}`} />
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
