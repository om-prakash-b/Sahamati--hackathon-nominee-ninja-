"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface Consent {
  id: string;
  institution: string;
  purpose: string;
  status: "active" | "expired";
  expiryDate: string;
}

const initialConsents: Consent[] = [
  {
    id: "1",
    institution: "HDFC Bank",
    purpose: "Account Information",
    status: "active",
    expiryDate: "2024-12-31",
  },
  {
    id: "2",
    institution: "ICICI Bank",
    purpose: "Account Information",
    status: "expired",
    expiryDate: "2023-12-31",
  },
];

export default function ConsentsPage() {
  const [consents] = useState(initialConsents);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Active Consents</h1>

        <div className="space-y-6">
          {consents.map((consent) => (
            <Card key={consent.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {consent.institution}
                  </h3>
                  <p className="text-gray-600">Purpose: {consent.purpose}</p>
                  <p className="text-gray-600">
                    Expiry Date: {consent.expiryDate}
                  </p>
                </div>
                <div className="flex items-center">
                  {consent.status === "active" ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <XCircle className="w-5 h-5 mr-2" />
                      Expired
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
