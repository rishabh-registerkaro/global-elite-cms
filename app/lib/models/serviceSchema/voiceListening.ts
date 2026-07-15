import { Schema } from "mongoose";

export interface VoiceStat {
  value: string;
  label: string;
}

export interface VoiceListeningSection {
  tagText: string;
  heading: string;
  subHeading: string;
  sampleQuote: string;
  languageTag: string;
  stats: VoiceStat[];
  ctaText: string;
  ctaHref: string;
  imageUrl?: string;
}

const VoiceStatSchema = new Schema<VoiceStat>(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

export const VoiceListeningSchema = new Schema<VoiceListeningSection>(
  {
    tagText:     { type: String },
    heading:     { type: String, required: true },
    subHeading:  { type: String },
    sampleQuote: { type: String },
    languageTag: { type: String },
    stats:       { type: [VoiceStatSchema], default: [] },
    ctaText:     { type: String },
    ctaHref:     { type: String },
    imageUrl:    { type: String },
  },
  { _id: false }
);
