import { Schema } from "mongoose";

export interface PricingPlan {
  planLabel: string;
  planName: string;
  price: string;
  currency: string;
  billingNote: string;
  badge: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  launchDate: string;
  refundNote: string;
}

export interface PricingSection {
  tagText: string;
  heading: string;
  subHeading: string;
  plans: PricingPlan[];
}

const PricingPlanSchema = new Schema<PricingPlan>(
  {
    planLabel:   { type: String },
    planName:    { type: String },
    price:       { type: String },
    currency:    { type: String, default: "₹" },
    billingNote: { type: String },
    badge:       { type: String },
    features:    { type: [String], default: [] },
    ctaText:     { type: String },
    ctaUrl:      { type: String },
    launchDate:  { type: String },
    refundNote:  { type: String },
  },
  { _id: false }
);

export const PricingSchema = new Schema<PricingSection>(
  {
    tagText:    { type: String },
    heading:    { type: String },
    subHeading: { type: String },
    plans:      { type: [PricingPlanSchema], default: [] },
  },
  { _id: false }
);
