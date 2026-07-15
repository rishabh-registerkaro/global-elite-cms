import mongoose, { Model, Schema, Document } from "mongoose";

export interface ServiceCard {
  cardHeading: string;
  cardImg: string;
  cardUrl: string;
}

export interface Services {
  serviceHeading: string;
  serviceDescription: string;
  serviceCards: ServiceCard[];
}

export const ServicesSchema: Schema<Services> = new Schema(
  {
    serviceHeading: {
      type: String,
      required: true,
    },
    serviceDescription: {
      type: String,
      required: true,
    },

    serviceCards: {
      type: [
        {
          cardHeading: {
            type: String,
            required: true,
          },
          cardImg: {
            type: String,
          },
          cardUrl: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
  { _id: false }
);
