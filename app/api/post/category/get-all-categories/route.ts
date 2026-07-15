import { connectDB } from "@/app/lib/config/db";
import Category from "@/app/lib/models/category";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userResult = await getCurrentUser(req);
    if (userResult instanceof NextResponse) {
      return userResult;
    }

    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to perform changes" },
        { status: 401 }
      );
    }
    
    // Fetch all categories
    const categories = await Category.find()
      .select('_id name slug color createdAt updatedAt parentCategory')
      .sort({ createdAt: -1 })
      .lean();

    // Format the response
    const formattedCategories = categories.map((category) => ({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      color: (category as any).color || "",
      parentCategory: category.parentCategory ? category.parentCategory.toString() : null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: "Categories fetched successfully",
        categories: formattedCategories,
        count: formattedCategories.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching categories:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Failed to fetch categories.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}