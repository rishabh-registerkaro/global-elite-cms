import { Schema } from "mongoose";

export interface PantryScannerSection {
  tagText: string;
  heading: string;
  subHeading: string;
  bullets: string[];
  ctaText: string;
  ctaHref: string;
  imageUrl?: string;
}

export const PantryScannerSchema = new Schema<PantryScannerSection>(
  {
    tagText:    { type: String },
    heading:    { type: String, required: true },
    subHeading: { type: String },
    bullets:    { type: [String], default: [] },
    ctaText:    { type: String },
    ctaHref:    { type: String },
    imageUrl:   { type: String },
  },
  { _id: false }
);
