export interface Lead {
  _id: string;
  name: string;
  email: string;
  phoneNo: string;
  companyName?: string;
  serviceSelected?: string;
  message?: string;
  status: "new" | "contacted" | "converted" | "lost";
  leadSource: string;
  createdAt: string;
  updatedAt: string;
}