"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
}

const initialFamilyMembers: FamilyMember[] = [
  { id: "1", name: "John Doe", relation: "Self" },
  { id: "2", name: "Jane Doe", relation: "Spouse" },
  { id: "3", name: "James Doe", relation: "Father" },
  { id: "4", name: "Mary Doe", relation: "Mother" },
];

export default function FamilyTreePage() {
  const [familyMembers, setFamilyMembers] = useState(initialFamilyMembers);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", relation: "" });

  const handleAddMember = () => {
    if (newMember.name && newMember.relation) {
      setFamilyMembers([
        ...familyMembers,
        {
          id: Date.now().toString(),
          name: newMember.name,
          relation: newMember.relation,
        },
      ]);
      setNewMember({ name: "", relation: "" });
      setShowAddMember(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Family Tree</h1>
          <Button onClick={() => setShowAddMember(true)}>
            Add Family Member
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {familyMembers.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-600">{member.relation}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="relation">Relation</Label>
                <Select
                  onValueChange={(value) =>
                    setNewMember({ ...newMember, relation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grandfather">Grandfather</SelectItem>
                    <SelectItem value="Grandmother">Grandmother</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddMember} className="w-full">
                Add Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
