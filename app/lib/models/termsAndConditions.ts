import mongoose, { Schema, Model, Document } from "mongoose";

export interface TermsPolicy extends Document {
    metaTitle?: string;
    metaDescription?: string;
    title?: string;
    subTitle?: string;
    content: Record<string, any>;
    privacyPolicyContent: Record<string, any>;
}

const TermsPolicySchema = new Schema<TermsPolicy>(
    {
        metaTitle: { type: String },
        metaDescription: { type: String },
        title: { type: String },
        subTitle: { type: String },
        content: { type: Schema.Types.Mixed, default: {} },
        privacyPolicyContent: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

const TermsPolicyModel: Model<TermsPolicy> =
    mongoose.models.TermsPolicy ||
    mongoose.model<TermsPolicy>("TermsPolicy", TermsPolicySchema);

export default TermsPolicyModel;
