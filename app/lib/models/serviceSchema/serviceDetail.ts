import mongoose, { Model, Schema, Document } from "mongoose";

export interface ServiceCard {
  serviceCardTitle: string;
  serviceCardDescription: string;
}

export interface ServiceDetail {
  serviceDetailHeading: string;
  serviceDetailDescription: string;
  serviceCards: ServiceCard[];
}

export const ServiceDetailSchema: Schema<ServiceDetail> = new Schema(
  {
    serviceDetailHeading: {
      type: String,
      required: true,
    },
    serviceDetailDescription: {
      type: String,
      required: true,
    },
    serviceCards: {
      type: [
        {
          serviceCardTitle: {
            type: String,
            required: true,
          },
          serviceCardDescription: {
            type: String,
            required: true,
          },
        },
      ],
    },
  },
  { _id: false }
);

// export const HeroModel: Model<AboutHero> =
//   mongoose.models.AboutHero || mongoose.model<AboutHero>("AboutHero", HeroSchema);
