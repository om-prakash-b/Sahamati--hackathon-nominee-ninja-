"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setShowOTP(true);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === "1234") {
      router.push("/home");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Mobile Number</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Send OTP
          </Button>
        </form>

        <Dialog open={showOTP} onOpenChange={setShowOTP}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter OTP</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value)}
                  maxLength={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Verify OTP
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
