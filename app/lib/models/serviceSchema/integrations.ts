import { Schema } from "mongoose";

export interface IntegrationsSection {
  heading: string;
  subHeading: string;
  integrations: unknown;
}

export const IntegrationsSchema = new Schema<IntegrationsSection>(
  {
    heading:      { type: String },
    subHeading:   { type: String },
    integrations: { type: Schema.Types.Mixed, default: [] },
  },
  { _id: false }
);
