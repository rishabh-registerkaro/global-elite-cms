import mongoose, { Model, Schema, Document } from "mongoose";

export interface Technologies {
  heading: string;
  description: string;
  technologyImages: string[];
}

export const technologySchema: Schema<Technologies> = new Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    technologyImages: {
      type: [String],
    },
  },
  { _id: false }
);

// export const HeroModel: Model<AboutHero> =
//   mongoose.models.AboutHero || mongoose.model<AboutHero>("AboutHero", HeroSchema);
