import { Schema } from "mongoose";

export interface HowItWorksStep {
  label: string;
  title: string;
  body: string;
}

export interface HowItWorksSection {
  heading: string;
  subHeading: string;
  steps: HowItWorksStep[];
}

const StepSchema = new Schema<HowItWorksStep>(
  {
    label: { type: String },
    title: { type: String, required: true },
    body:  { type: String, required: true },
  },
  { _id: false }
);

export const HowItWorksSchema = new Schema<HowItWorksSection>(
  {
    heading:    { type: String, required: true },
    subHeading: { type: String },
    steps:      { type: [StepSchema], default: [] },
  },
  { _id: false }
);
