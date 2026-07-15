// import mongoose, { Model, Schema } from "mongoose";

// export interface Lead extends Document {
//   name: string;
//   email: string;
//   phoneNo: string;
//   companyName?: string;
//   serviceSelected?: string;
//   message?: string;
//   status: "new" | "contacted" | "converted" | "lost";
//   leadSource:string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const leadSchema: Schema<Lead> = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     phoneNo: {
//       type: String,
//       required: true,
//     },
//     serviceSelected: {
//       type: String,
//     },
//     companyName:{
//         type:String,
//     },
//     message: {
//       type: String,
//     },
//     status: {
//       type: String,
//       enum: ["new", "contacted", "converted", "lost"],
//       default: "new",
//     },
//     leadSource:{
//         type:String,
//         default: "Website",
//     }
//   },
//   { timestamps: true }
// );
// const Lead: Model<Lead> =
//   mongoose.models.Lead || mongoose.model<Lead>("Lead", leadSchema);
// export default Lead;


import mongoose, { Model, Schema, Document } from "mongoose";

export interface Lead extends Document {
  // Basic Information
  name: string;
  email: string;
  phoneNo: string;
  companyName?: string;
  region: string; // REQUIRED - Country/Region
  serviceSelected: string; // REQUIRED - Service name
  message?: string;
  
  // Lead Management
  status: "new" | "contacted" | "converted" | "lost";
  leadSource: string;
  
  // Payment Information (all optional, filled only if user pays)
  hasPayment: boolean;
  packageId?: mongoose.Types.ObjectId;
  packageName?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus?: "pending" | "success" | "failed";
  amount?: number; // Amount in smallest currency unit (paise/cents)
  currency?: string; // "INR", "USD", "GBP", etc.
  paymentMethod?: string; // "card", "upi", "netbanking", etc.
  paidAt?: Date;
  
  // Admin Fields
  adminNotes?: string;
  lastContactedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema: Schema<Lead> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    region: {
      type: String,
      required: true,
    },
    serviceSelected: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "lost"],
      default: "new",
    },
    leadSource: {
      type: String,
      default: "Website",
    },
    // Payment fields
    hasPayment: {
      type: Boolean,
      default: false,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "ServicePackage",
    },
    packageName: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    // Admin fields
    adminNotes: {
      type: String,
    },
    lastContactedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Lead: Model<Lead> =
  mongoose.models.Lead || mongoose.model<Lead>("Lead", leadSchema);
export default Lead;
