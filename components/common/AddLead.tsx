
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  onCreate: (lead: any) => Promise<void>;
}

export default function AddLeadForm({ onCreate }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNo: "",
    companyName: "",
    serviceSelected: "",
    status: "new",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 mt-2">
      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <Input
          className="bg-slate-800 border-slate-700 text-white"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Email</Label>
        <Input
          className="bg-slate-800 border-slate-700 text-white"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Phone</Label>
        <Input
          className="bg-slate-800 border-slate-700 text-white"
          value={form.phoneNo}
          onChange={(e) => updateField("phoneNo", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Company</Label>
        <Input
          className="bg-slate-800 border-slate-700 text-white"
          value={form.companyName}
          onChange={(e) => updateField("companyName", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Service</Label>
        <Input
          className="bg-slate-800 border-slate-700 text-white"
          value={form.serviceSelected}
          onChange={(e) => updateField("serviceSelected", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <Select
          value={form.status}
          onValueChange={(value) => updateField("status", value)}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 text-white border-slate-700">
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full bg-indigo-500 hover:bg-indigo-600 mt-3"
        onClick={() => onCreate(form)}
      >
        Save
      </Button>
    </div>
  );
}
