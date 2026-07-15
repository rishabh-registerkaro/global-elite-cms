import { Schema } from "mongoose";

export interface FoundersNoteSection {
  founderName: string;
  founderDesignation: string;
  founderLocation: string;
  founderEmail: string;
  founderCoordinates: string;
  quote: string;
  documentNote: string;
  documentNo: string;
}

export const FoundersNoteSchema = new Schema<FoundersNoteSection>(
  {
    founderName:       { type: String },
    founderDesignation:{ type: String },
    founderLocation:   { type: String },
    founderEmail:      { type: String },
    founderCoordinates:{ type: String },
    quote:             { type: String },
    documentNote:      { type: String },
    documentNo:        { type: String },
  },
  { _id: false }
);
