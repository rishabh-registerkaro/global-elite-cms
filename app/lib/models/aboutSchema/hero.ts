import mongoose, { Model, Schema, Document } from "mongoose";

export interface AboutHero {
  heroBadgeTitle: string;
  heroHeading: string;
  heroDescription: string;
  heroImgUrl: string;
}

export const HeroSchema: Schema<AboutHero> = new Schema({
  heroBadgeTitle: {
    type: String,
    required: true,
  },
  heroHeading: {
    type: String,
    required: true,
  },
  heroDescription: {
    type: String,
  },
  heroImgUrl: {
    type: String,
  },
},{_id:false});

// export const HeroModel: Model<AboutHero> =
//   mongoose.models.AboutHero || mongoose.model<AboutHero>("AboutHero", HeroSchema);

