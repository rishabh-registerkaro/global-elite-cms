import { connectDB } from "@/app/lib/config/db";
import Category from "@/app/lib/models/category";
import mongoose from "mongoose";

const OTHERS_CATEGORY_SLUG = "others";

/**
 * Ensures the "Others" default category exists in the database
 * This category cannot be a parent or child category
 * @returns The ObjectId of the "Others" category
 */
export async function ensureDefaultCategory(): Promise<mongoose.Types.ObjectId> {
  await connectDB();
  
  // Try to find existing "Others" category
  let othersCategory = await Category.findOne({ slug: OTHERS_CATEGORY_SLUG });
  
  if (!othersCategory) {
    // Create "Others" category if it doesn't exist
    othersCategory = await Category.create({
      name: "Others",
      slug: OTHERS_CATEGORY_SLUG,
      parentCategory: null, // Cannot be a child
    });
  }
  
  return othersCategory._id;
}