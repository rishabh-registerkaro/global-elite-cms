
import mongoose, { Model, Schema, Document } from "mongoose";

export interface MediaAssetDoc extends Document {
  key: string;
  filename: string;
  format: string;
  resource_type: string;
  bytes: number;
  url: string;
  createdAt: Date;
}

const mediaAssetSchema = new Schema<MediaAssetDoc>(
  {
    key: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    format: { type: String, required: true },
    resource_type: { type: String, required: true },
    bytes: { type: Number, required: true },
    url: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const MediaAsset: Model<MediaAssetDoc> =
  mongoose.models.MediaAsset ||
  mongoose.model<MediaAssetDoc>("MediaAsset", mediaAssetSchema);

export default MediaAsset;