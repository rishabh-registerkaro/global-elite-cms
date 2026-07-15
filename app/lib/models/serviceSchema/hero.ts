import { Schema } from "mongoose";

export interface ServiceHero {
  versionTag: string;
  title: string;
  heading: string;
  subHeading: string;
  description: string;
  ctaPrimaryText: string;
  ctaPrimaryUrl: string;
  ctaSecondaryText: string;
  ctaSecondaryUrl: string;
  ratingScore: string;
  ratingCount: string;
  phoneMockupImageUrl: string;
}

export const HeroSchema: Schema<ServiceHero> = new Schema(
  {
    versionTag:          { type: String },
    title:               { type: String },
    heading:             { type: String, required: true },
    subHeading:          { type: String },
    description:         { type: String },
    ctaPrimaryText:      { type: String },
    ctaPrimaryUrl:       { type: String },
    ctaSecondaryText:    { type: String },
    ctaSecondaryUrl:     { type: String },
    ratingScore:         { type: String },
    ratingCount:         { type: String },
    phoneMockupImageUrl: { type: String },
  },
  { _id: false }
);
