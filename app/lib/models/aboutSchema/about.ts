import mongoose, { Model, Schema, Document } from "mongoose";

interface AboutSectionStats {
  statTitle: string;
  statValue: string;
}
export interface AboutSection extends Document {
  aboutBadgeTitle: string;
  aboutHeading: string;
  aboutDescription: string;
  aboutImgUrl?: string;
  aboutStats: AboutSectionStats[];
}

export const AboutSectionSchema: Schema<AboutSection> = new Schema({
  aboutBadgeTitle: {
    type: String,
    required: true,
  },
  aboutHeading: {
    type: String,
    required: true,
  },
  aboutDescription: {
    type: String,
    required: true,
  },
  aboutImgUrl: {
    type: String,
  },
  aboutStats: {
    type: [
      {
        statTitle: {
          type: String,
          required: true,
          trim: true,
        },
        statValue: {
          type: String,
          required: true,
        },
      },
    ],
    required: true,
  },
},{_id:false});
// const AboutModel: Model<AboutSection> =
//   mongoose.models.AboutSection ||
//   mongoose.model<AboutSection>("About", AboutSectionSchema);
// export default AboutModel;
