import mongoose, { Schema, Model, Document } from "mongoose";
import { ServiceHero, HeroSchema } from "./serviceSchema/hero";
import { FeaturesSection, FeaturesSectionSchema } from "./serviceSchema/features";
import { PantryScannerSection, PantryScannerSchema } from "./serviceSchema/pantryScanner";
import { VoiceListeningSection, VoiceListeningSchema } from "./serviceSchema/voiceListening";
import { HowItWorksSection, HowItWorksSchema } from "./serviceSchema/howItWorks";
import { PricingSection, PricingSchema } from "./serviceSchema/pricing";
import { IntegrationsSection, IntegrationsSchema } from "./serviceSchema/integrations";

export interface ServicePage extends Document {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  heroSection: ServiceHero;
  featuresSection?: FeaturesSection;
  pantryScannerSection?: PantryScannerSection;
  voiceListeningSection?: VoiceListeningSection;
  howItWorksSection?: HowItWorksSection;
  pricingSection?: PricingSection;
  integrationsSection?: IntegrationsSection;
  status: "draft" | "published";
  author: mongoose.Types.ObjectId;
}

const ServicePageSchema: Schema<ServicePage> = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    metaTitle:       { type: String },
    metaDescription: { type: String },
    heroSection: {
      type: HeroSchema,
      required: true,
    },
    featuresSection:       { type: FeaturesSectionSchema },
    pantryScannerSection:  { type: PantryScannerSchema },
    voiceListeningSection: { type: VoiceListeningSchema },
    howItWorksSection:     { type: HowItWorksSchema },
    pricingSection:        { type: PricingSchema },
    integrationsSection:   { type: IntegrationsSchema },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Delete cached model so schema changes take effect after hot-reload
if (mongoose.models.ServicePage) {
  delete (mongoose.models as Record<string, unknown>).ServicePage;
}

const ServicePageModel: Model<ServicePage> =
  mongoose.model<ServicePage>("ServicePage", ServicePageSchema);

export default ServicePageModel;
