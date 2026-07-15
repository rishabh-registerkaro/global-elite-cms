import mongoose, { Model, Schema, Document } from "mongoose";

export interface IRegistration extends Document {
  email: string;
  pageSource: "home" | "contact" | "about" | "blog";
  pageUrl: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    email:      { type: String, required: true, trim: true, lowercase: true },
    pageSource: { type: String, enum: ["home", "contact", "blog", 'about'], required: true },
    pageUrl:    { type: String, required: true },
    metadata:   { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", registrationSchema);

export default Registration;
