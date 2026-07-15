import mongoose, { Model, Schema, Document } from "mongoose";

export interface PriceVariant {
  region: string;
  currency: string;
  price: number; // Price in smallest currency unit
  displayPrice: string; // Formatted price like "₹700.00"
}

export interface ServicePackage extends Document {
  serviceName: string;
  packageName: string;
  packageTier: "free" | "basic" | "pro" | "enterprise";
  priceVariants: PriceVariant[];
  description?: string;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  displayOrder: number;
  billingCycle: "one-time" | "monthly" | "yearly";
  createdAt: Date;
  updatedAt: Date;
}

const priceVariantSchema = new Schema(
  {
    region: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    displayPrice: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const packageSchema: Schema<ServicePackage> = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
      index: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    packageTier: {
      type: String,
      enum: ["free", "basic", "pro", "enterprise"],
      required: true,
    },
    priceVariants: {
      type: [priceVariantSchema],
      required: true,
      validate: {
        validator: function (v: PriceVariant[]) {
          return v.length > 0;
        },
        message: "At least one price variant is required",
      },
    },
    description: {
      type: String,
    },
    features: {
      type: [String],
      required: true,
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["one-time", "monthly", "yearly"],
      default: "one-time",
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique package per service
packageSchema.index({ serviceName: 1, packageName: 1 }, { unique: true });

const ServicePackage: Model<ServicePackage> =
  mongoose.models.ServicePackage ||
  mongoose.model<ServicePackage>("ServicePackage", packageSchema);

export default ServicePackage;