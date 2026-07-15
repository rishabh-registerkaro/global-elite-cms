// lib/models/Category.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Palette that matches MagDee frontend design system
export const CATEGORY_PALETTE = [
  "#1e40af", // brand blue  (Engineering-style)
  "#6d28d9", // purple      (Studio-style)
  "#0f766e", // teal
  "#b45309", // amber
  "#be123c", // rose
  "#15803d", // green
  "#c2410c", // orange
  "#7c3aed", // violet
];

export function generateCategoryColor(name: string): string {
  const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  color: string;
  parentCategory?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: "",
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentCategory: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;