import { Schema } from "mongoose";

export interface FeatureCard {
  iconName: string;
  title: string;
  body: string;
  href: string;
}

export interface FeaturesSection {
  features: FeatureCard[];
}

const FeatureCardSchema = new Schema<FeatureCard>(
  {
    iconName: { type: String },
    title:    { type: String, required: true },
    body:     { type: String, required: true },
    href:     { type: String },
  },
  { _id: false }
);

export const FeaturesSectionSchema = new Schema<FeaturesSection>(
  {
    features: { type: [FeatureCardSchema], default: [] },
  },
  { _id: false }
);
