import mongoose, { Model, Schema, Document } from "mongoose";

export interface ServiceIntro {
  serviceHeading: string;
  serviceDescription: string[];
}

export const ServiceIntroSchema: Schema<ServiceIntro> = new Schema(
  {
    serviceHeading: {
      type: String,
      required: true,
    },
    serviceDescription: {
      type: [String],
      required: true,
      validate: {
        validator: function (val) {
          return val.length > 0;
        },
        message: "At least one description point is required",
      },
    },
  },
  { _id: false }
);

// export const HeroModel: Model<AboutHero> =
//   mongoose.models.AboutHero || mongoose.model<AboutHero>("AboutHero", HeroSchema);
