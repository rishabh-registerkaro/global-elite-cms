

import mongoose, { Model, Schema, Document } from "mongoose";

export interface SectionCard {
  cardHeading: string;
  cardDescription:string;
}

export interface WhyChoose {
  sectionHeading: string;
  sectionDescription: string;
  sectionCards: SectionCard[];
}

export const WhyChooseSchema: Schema<WhyChoose> = new Schema(
  {
    sectionHeading: {
      type: String,
      required: true,
    },
    sectionDescription: {
      type: String,
      required: true,
    },
    sectionCards: {
      type: [
        {
          cardHeading: {
            type: String,
            required: true,
          },
          cardDescription:{
            type:String,
            required:true
          }
        },
      ],
    },
  },
  { _id: false }
);
