



import mongoose, { Model, Schema, Document } from "mongoose";

export interface SectionCard {
  cardHeading: string;
  cardDescription:string;
}

export interface WhyInvest {
  sectionHeading: string;
  sectionDescription: string;
  sectionCards: SectionCard[];
}

export const WhyInvestSchema: Schema<WhyInvest> = new Schema(
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
