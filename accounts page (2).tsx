"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,a
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Account {
  id: string;
  bank: string;
  accountType: string;
  accountNumber: string;
  nominee: string | null;
  status: string;
}

const initialAccounts: Account[] = [
  {
    id: "1",
    bank: "HDFC Bank",
    accountType: "Savings",
    accountNumber: "XXXX1234",
    nominee: null,
    status: "No Nominee",
  },
  {
    id: "2",
    bank: "ICICI Bank",
    accountType: "Current",
    accountNumber: "XXXX5678",
    nominee: "Jane Doe",
    status: "Nominee Added",
  },
];

const familyMembers = [
  { id: "1", name: "Jane Doe" },
  { id: "2", name: "James Doe" },
  { id: "3", name: "Mary Doe" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [showAddNominee, setShowAddNominee] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedNominee, setSelectedNominee] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const handleFetchAccounts = () => {
    setConsentGiven(true);
  };

  const handleAddNominee = (account: Account) => {
    setSelectedAccount(account);
    setShowAddNominee(true);
  };

  const handleNomineeSubmit = () => {
    if (selectedAccount && selectedNominee) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === selectedAccount.id
            ? {
                ...acc,
                nominee: selectedNominee,
                status: "Updating Nominee with the Bank",
              }
            : acc
        )
      );
      setShowAddNominee(false);
      setSelectedNominee("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Financial Accounts</h1>
          {!consentGiven && (
            <Button onClick={handleFetchAccounts}>
              Fetch Accounts via AA
            </Button>
          )}
        </div>

        {consentGiven ? (
          <div className="space-y-6">
            {accounts.map((account) => (
              <Card key={account.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{account.bank}</h3>
                    <p className="text-gray-600">
                      {account.accountType} - {account.accountNumber}
                    </p>
                    <p className="text-gray-600">
                      Nominee: {account.nominee || "None"}
                    </p>
                    <p
                      className={`text-sm ${
                        account.status === "No Nominee"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      Status: {account.status}
                    </p>
                  </div>
                  {!account.nominee && (
                    <Button onClick={() => handleAddNominee(account)}>
                      Add Nominee
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">
              Please provide consent to fetch your accounts
            </p>
          </Card>
        )}

        <Dialog open={showAddNominee} onOpenChange={setShowAddNominee}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Nominee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={setSelectedNominee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleNomineeSubmit} className="w-full">
                Add Nominee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
