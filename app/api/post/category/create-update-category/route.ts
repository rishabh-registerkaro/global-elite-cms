import { connectDB } from "@/app/lib/config/db";
import Category, { generateCategoryColor } from "@/app/lib/models/category";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { requireRole } from "@/app/lib/utils/authorization";
import { CONTENT_ROLES } from "@/app/lib/constants/role";


export async function POST(req: NextRequest) {
  try {
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to create a category.",
        },
        { status: 401 }
      );
    }
    // Connect to database
    await connectDB();

    // Get request body
    const body = await req.json();
    const { name, slug, parentCategory, color } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and slug are required fields.",
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: slug.toLowerCase().trim() });
    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists. Please use a different slug.",
        },
        { status: 409 }
      );
    }

    // Validate parent category if provided
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent category not found.",
          },
          { status: 404 }
        );
      }
    }

    // Use provided color or auto-generate from name
    const resolvedColor = (color && color.trim()) ? color.trim() : generateCategoryColor(name.trim());

    // Prepare category data
    const categoryData: any = {
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      color: resolvedColor,
      parentCategory: parentCategory || null,
    };

    // Create the category
    const category = await Category.create(categoryData);

    const createdCategory = Array.isArray(category) ? category[0] : category;

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully!",
        category: {
          id: createdCategory._id.toString(),
          name: createdCategory.name,
          slug: createdCategory.slug,
          color: createdCategory.color,
          parentCategory: createdCategory.parentCategory,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating category:", error);

    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Failed to create category.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}


// PUT - Update category
export async function PUT(req: NextRequest) {
  try {
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to update a category.",
        },
        { status: 401 }
      );
    }
    // Connect to database
    await connectDB();

    // Get request body
    const body = await req.json();
    const { id, name, slug, parentCategory, color } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and slug are required fields.",
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // Check if slug already exists (excluding current category)
    const normalizedSlug = slug.toLowerCase().trim();
    const existingCategory = await Category.findOne({ 
      slug: normalizedSlug,
      _id: { $ne: id } // Exclude current category
    });
    
    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists. Please use a different slug.",
        },
        { status: 409 }
      );
    }

    // Validate parent category if provided
    if (parentCategory) {
      // Prevent setting itself as parent
      if (parentCategory === id) {
        return NextResponse.json(
          {
            success: false,
            message: "A category cannot be its own parent.",
          },
          { status: 400 }
        );
      }

      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return NextResponse.json(
          {
            success: false,
            message: "Parent category not found.",
          },
          { status: 404 }
        );
      }
    }

    // Update category data
    category.name = name.trim();
    category.slug = normalizedSlug;
    category.parentCategory = parentCategory || null;
    // Keep existing color if no new one provided; generate fresh if name changed and no color set
    category.color = (color && color.trim())
      ? color.trim()
      : (category.color || generateCategoryColor(name.trim()));

    // Save the updated category
    const updatedCategory = await category.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Category updated successfully!",
        category: {
          id: updatedCategory._id.toString(),
          name: updatedCategory.name,
          slug: updatedCategory.slug,
          color: updatedCategory.color,
          parentCategory: updatedCategory.parentCategory,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating category:", error);

    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Failed to update category.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get current user (authorization check)
    const userResult = await requireRole(req, CONTENT_ROLES);

    
    // Check if getCurrentUser returned an error response (NextResponse)
    if (userResult instanceof NextResponse) {
      return userResult; // Return the unauthorized response
    }
    
    // Extract user ID from decoded token
    const userId = userResult.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to delete a category.",
        },
        { status: 401 }
      );
    }

    // Get category ID from request body
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // Check if category has children
    const hasChildren = await Category.findOne({ parentCategory: id });
    if (hasChildren) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete category with child categories. Please delete or reassign child categories first.",
        },
        { status: 400 }
      );
    }

    // Check if category is used in any posts
    const Post = (await import("@/app/lib/models/post")).default;
    const postsUsingCategory = await Post.countDocuments({ category: id });
    if (postsUsingCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete category. It is used in ${postsUsingCategory} post(s). Please remove the category from posts first.`,
        },
        { status: 400 }
      );
    }

    // Delete the category
    await Category.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting category:", error);

    // Handle JWT verification errors
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Failed to delete category.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET - Fetch single category by ID
export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Validate that ID is provided
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required.",
        },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID format.",
        },
        { status: 400 }
      );
    }

    try {
      // Fetch the category with populated parent category if it exists
      const category = await Category.findById(id)
        .populate("parentCategory", "name slug _id")
        .lean();

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found.",
          },
          { status: 404 }
        );
      }

      // Return success response with category data
      return NextResponse.json(
        {
          success: true,
          category: category,
        },
        { status: 200 }
      );
    } catch (findError: any) {
      // Handle findById specific errors
      if (findError.name === "CastError") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid category ID format.",
          },
          { status: 400 }
        );
      }
      throw findError; // Re-throw if it's not a CastError
    }
  } catch (error: any) {
    console.error("Error fetching category:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID format.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Failed to fetch category.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}