import mongoose, { Document, Model, Schema } from "mongoose";

export interface OTP extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OTPModel extends Model<OTP> { }

const otpSchema = new Schema<OTP, OTPModel>({
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        index: true,
    },
    otp: {
        type: String,
        required: [true, 'OTP is required'],
        length: [6, 'OTP must be 6 digits'],
    },
    expiresAt: {
        type: Date,
        required: true,
        // Remove the incorrect index syntax from here
    },
    verified: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

// Regular indexes
otpSchema.index({ email: 1, verified: 1 });
otpSchema.index({ email: 1, otp: 1, verified: 1 });

// TTL Index - This will automatically delete documents when expiresAt date has passed
// expireAfterSeconds: 0 means delete immediately when expiresAt is in the past
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP: OTPModel =
  (mongoose.models.OTP as OTPModel) ||
  mongoose.model<OTP, OTPModel>("OTP", otpSchema, "otps");

export default OTP;