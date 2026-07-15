import mongoose, { Schema, Model, Document } from "mongoose";
import { AboutHero, HeroSchema } from "./aboutSchema/hero";
import { AboutSection, AboutSectionSchema } from "./aboutSchema/about";
import { ApproachSchema, ApproachSection } from "./aboutSchema/approach";
import { TeamSchema, TeamSection } from "./aboutSchema/team";
import { FoundersNoteSchema, FoundersNoteSection } from "./aboutSchema/foundersNote";

export interface AboutPage extends Document {
  metaTitle?: string;
  metaDescription?: string;
  heroSection?: AboutHero;
  aboutSection?: AboutSection;
  approachSection?: ApproachSection;
  teamSection?: TeamSection;
  foundersNoteSection?: FoundersNoteSection;
}

const AboutPageSchema: Schema<AboutPage> = new Schema(
  {
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    heroSection: {
      type: HeroSchema,
    },
    aboutSection: {
      type: AboutSectionSchema,
    },
    approachSection: {
      type: ApproachSchema,
    },
    teamSection: {
      type: TeamSchema,
    },
    foundersNoteSection: {
      type: FoundersNoteSchema,
    },
  },
  { timestamps: true }
);

if (mongoose.models.AboutPage) {
  delete (mongoose.models as Record<string, unknown>).AboutPage;
}

const AboutPageModel: Model<AboutPage> =
  mongoose.model<AboutPage>("AboutPage", AboutPageSchema);

export default AboutPageModel;
