"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Wallet, FileCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">Welcome to Family Finance Hub</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/accounts">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-4">
                <Wallet className="w-12 h-12 text-primary" />
                <h2 className="text-xl font-semibold">Check Financial Accounts</h2>
                <p className="text-gray-600">
                  View and manage your linked financial accounts
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/consents">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-4">
                <FileCheck className="w-12 h-12 text-primary" />
                <h2 className="text-xl font-semibold">Check Active Consents</h2>
                <p className="text-gray-600">
                  Review and manage your account access consents
                </p>
              </div>
            </Card>
          </Link>

          <Link href="/family-tree">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-4">
                <Users className="w-12 h-12 text-primary" />
                <h2 className="text-xl font-semibold">Check Family Tree</h2>
                <p className="text-gray-600">
                  View and manage your family connections
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
