import { connectDB } from "@/app/lib/config/db";
import Post from "@/app/lib/models/post";
import Category from "@/app/lib/models/category";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";
import { ensureDefaultCategory } from "@/app/lib/utils/DefaultCategory"; // Add this import


import { requireRole } from "@/app/lib/utils/authorization";
import { CONTENT_ROLES, EDITOR_ROLES } from "@/app/lib/constants/role";


export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get current user (for authentication and fallback author)
    const authorResult = await requireRole(req, EDITOR_ROLES);
    if (authorResult instanceof NextResponse) {
      return authorResult;
    }
    const authenticatedUserId = authorResult.id;

    if (!authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to create a post."
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      publishedAt,
      faq_items,
      additionalFields,
      schema, // JSON-LD schema with @context and @graph
      author, // Author from request body (optional)
    } = body;

    // Use provided author if available, otherwise use authenticated user's ID
    let authorId = authenticatedUserId;
    
    if (author && author.trim()) {
      // Validate author ID format
      if (!mongoose.Types.ObjectId.isValid(author.trim())) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid author ID format.",
          },
          { status: 400 }
        );
      }
      authorId = author.trim();
    }

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, slug, and content are required fields.",
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return NextResponse.json(
        {
          success: false,
          message: "A post with this slug already exists. Please use a different slug.",
        },
        { status: 409 }
      );
    }

    // Validate FAQ items if provided
    if (faq_items && Array.isArray(faq_items)) {
      for (const faq of faq_items) {
        if (!faq.question || !faq.answer) {
          return NextResponse.json(
            {
              success: false,
              message: "Each FAQ item must have both question and answer.",
            },
            { status: 400 }
          );
        }
      }
    }

    // Prepare post data
    const postData: any = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      content: content.trim(),
      author: authorId,
      status: status || "draft",
    };

    // Add optional fields
    if (excerpt) postData.excerpt = excerpt.trim();
    if (featuredImage) postData.featuredImage = featuredImage.trim();
    
    // Handle category - assign to "Others" if no category is selected
    if (category) {
      // Handle category array - convert to ObjectIds and validate
      const categoryArray = Array.isArray(category) ? category : [category];
      const validCategoryIds = categoryArray.filter(Boolean);

      // Validate all category IDs exist
      if (validCategoryIds.length > 0) {
        const validObjectIds = validCategoryIds
          .map((id: string) => {
            try {
              return new mongoose.Types.ObjectId(id);
            } catch {
              return null;
            }
          })
          .filter((id): id is mongoose.Types.ObjectId => id !== null);

        // Verify all categories exist in database
        const existingCategories = await Category.find({
          _id: { $in: validObjectIds }
        }).select('_id');

        const existingIds = existingCategories.map(cat => cat._id.toString());
        const invalidIds = validCategoryIds.filter((id: string) => !existingIds.includes(id));

        if (invalidIds.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid category IDs: ${invalidIds.join(', ')}`,
            },
            { status: 400 }
          );
        }

        postData.category = validObjectIds;
      } else {
        // Empty array provided, assign to "Others"
        const othersCategoryId = await ensureDefaultCategory();
        postData.category = [othersCategoryId];
      }
    } else {
      // No category provided, assign to "Others"
      const othersCategoryId = await ensureDefaultCategory();
      postData.category = [othersCategoryId];
    }
    if (tags && Array.isArray(tags)) {
      postData.tags = tags.filter(Boolean).map((tag: string) => tag.trim());
    }

    // Add FAQ items if provided
    if (faq_items && Array.isArray(faq_items) && faq_items.length > 0) {
      postData.faq_items = faq_items.map((faq: any) => ({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      }));
    }

    // Add additional fields (ACF-style custom fields)
    if (additionalFields && typeof additionalFields === "object") {
      postData.additionalFields = additionalFields;
    }

    // Add schema (Array of schema objects)
    if (schema !== undefined) {
      if (schema === null) {
        postData.schema = null;
      } else if (Array.isArray(schema)) {
        // Filter out any null/undefined values and ensure all items are objects
        postData.schema = schema.filter((s: any) => s !== null && s !== undefined && typeof s === "object");
      } else if (typeof schema === "object") {
        // If it's a single object, wrap it in an array
        postData.schema = [schema];
      } else {
        postData.schema = null;
      }
    } else {
      postData.schema = null;
    }

    // Handle publishedAt
    if (status === "published") {
      if (publishedAt) {
        postData.publishedAt = new Date(publishedAt);
      } else {
        postData.publishedAt = new Date();
      }
    } else {
      postData.publishedAt = null;
    }

    // Create the post
    const post = await Post.create(postData);

    // Type assertion to fix TypeScript inference issue
    const createdPost = Array.isArray(post) ? post[0] : post;

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully!",
        post: {
          id: createdPost._id.toString(),
          title: createdPost.title,
          slug: createdPost.slug,
          status: createdPost.status,
          createdAt: createdPost.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating post:", error);

    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A post with this slug already exists.",
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
        message: "Internal server error. Failed to create post.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch posts (list with pagination) OR single post by ID
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Validate user authentication
    const userResult = await requireRole(req, CONTENT_ROLES);
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    // If ID is provided, fetch single post
    if (id) {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid post ID format.",
          },
          { status: 400 }
        );
      }

      try {
        // Fetch the single post
        const post = await Post.findById(id)
          .populate("author", "username email")
          .populate("category", "name slug")
          .lean();

        if (!post) {
          return NextResponse.json(
            {
              success: false,
              message: "Post not found.",
            },
            { status: 404 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            post: post,
          },
          { status: 200 }
        );
      } catch (findError: any) {
        // Handle findById specific errors
        if (findError.name === "CastError") {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid post ID format.",
            },
            { status: 400 }
          );
        }
        throw findError; // Re-throw if it's not a CastError
      }
    }

    // Otherwise, fetch list of posts (existing logic)
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Fetch posts with only required fields
    const posts = await Post.find(query)
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title slug author status publishedAt createdAt updatedAt")
      .lean();

    // Transform posts to include all date fields
    const transformedPosts = posts.map((post: any) => {
      const postData: any = {
        _id: post._id,
        title: post.title,
        slug: post.slug,
        author: post.author,
        status: post.status,
      };

      // Include all date fields
      if (post.publishedAt) {
        postData.publishedAt = post.publishedAt;
      }
      if (post.createdAt) {
        postData.createdAt = post.createdAt;
      }
      if (post.updatedAt) {
        postData.updatedAt = post.updatedAt;
      }

      return postData;
    });

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        posts: transformedPosts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching posts:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid post ID format.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch posts",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // connect to db
    await connectDB();

    // get current user
    const userResult = await requireRole(req, EDITOR_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized. Please login to perform changes",
      }, { status: 401 })
    }

    // Get post ID from request body
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Post ID is required.",
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found.",
        },
        { status: 404 }
      );
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Post deleted successfully!",
      },
      { status: 200 }
    );


  } catch (error: any) {
    console.error("Error deleting post:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid post ID format.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Failed to delete post.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );

  }
}
// ... existing code (POST, GET, DELETE) ...

export async function PUT(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get current user (author)
    const userResult = await requireRole(req, EDITOR_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    const userId = userResult.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to update a post."
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const {
      id,
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      status,
      publishedAt,
      faq_items,
      additionalFields,
      schema
    } = body;

    // Validate required field: id
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Post ID is required to update a post.",
        },
        { status: 400 }
      );
    }

    // Find the existing post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found.",
        },
        { status: 404 }
      );
    }

    // Validate that provided fields are not empty (if they are provided)
    if (title !== undefined && !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (slug !== undefined && !slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (content !== undefined && !content.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Content cannot be empty.",
        },
        { status: 400 }
      );
    }

    // Check if slug already exists (only if slug is being changed)
    if (slug && slug.toLowerCase().trim() !== post.slug) {
      const existingPost = await Post.findOne({ 
        slug: slug.toLowerCase().trim(),
        _id: { $ne: id } // Exclude current post
      });
      if (existingPost) {
        return NextResponse.json(
          {
            success: false,
            message: "A post with this slug already exists. Please use a different slug.",
          },
          { status: 409 }
        );
      }
    }

    // Update fields if provided
    if (title !== undefined) {
      post.title = title.trim();
    }

    if (slug !== undefined) {
      post.slug = slug.toLowerCase().trim();
    }

    if (content !== undefined) {
      post.content = content.trim();
    }

    if (excerpt !== undefined) {
      post.excerpt = excerpt ? excerpt.trim() : "";
    }

    if (featuredImage !== undefined) {
      post.featuredImage = featuredImage ? featuredImage.trim() : "";
    }

    // Handle category update
    if (category !== undefined) {
      const categoryArray = Array.isArray(category) ? category : [category];
      const validCategoryIds = categoryArray.filter(Boolean);

      if (validCategoryIds.length > 0) {
        const validObjectIds = validCategoryIds
          .map((id: string) => {
            try {
              return new mongoose.Types.ObjectId(id);
            } catch {
              return null;
            }
          })
          .filter((id): id is mongoose.Types.ObjectId => id !== null);

        // Verify all categories exist in database
        const existingCategories = await Category.find({
          _id: { $in: validObjectIds }
        }).select('_id');

        const existingIds = existingCategories.map(cat => cat._id.toString());
        const invalidIds = validCategoryIds.filter((id: string) => !existingIds.includes(id));

        if (invalidIds.length > 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid category IDs: ${invalidIds.join(', ')}`,
            },
            { status: 400 }
          );
        }

        post.category = validObjectIds;
      } else {
        // Empty array provided, assign to "Others"
        const othersCategoryId = await ensureDefaultCategory();
        post.category = [othersCategoryId];
      }
    }
    // If category is undefined, don't change existing category (preserve existing behavior)


    // Handle FAQ items update
    if (faq_items !== undefined) {
      if (!Array.isArray(faq_items)) {
        return NextResponse.json(
          {
            success: false,
            message: "FAQ items must be an array.",
          },
          { status: 400 }
        );
      }

      // Validate FAQ items
      for (const faq of faq_items) {
        if (!faq.question || !faq.answer) {
          return NextResponse.json(
            {
              success: false,
              message: "Each FAQ item must have both question and answer.",
            },
            { status: 400 }
          );
        }
      }

      post.faq_items = faq_items.map((faq: any) => ({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      }));
    }

    // Handle additionalFields update - MERGE with existing fields
    if (additionalFields !== undefined) {
      if (typeof additionalFields !== "object" || Array.isArray(additionalFields)) {
        return NextResponse.json(
          {
            success: false,
            message: "Additional fields must be an object.",
          },
          { status: 400 }
        );
      }

      // Deep merge additionalFields with existing ones
      // This allows updating specific fields in additionalFields without losing others
      const existingFields = post.additionalFields || {};
      post.additionalFields = {
        ...existingFields,
        ...additionalFields,
      };

      // Deep merge nested objects within additionalFields
      // If a field in additionalFields has nested content, merge it
      for (const key in additionalFields) {
        if (
          typeof additionalFields[key] === "object" &&
          additionalFields[key] !== null &&
          !Array.isArray(additionalFields[key]) &&
          typeof existingFields[key] === "object" &&
          existingFields[key] !== null &&
          !Array.isArray(existingFields[key])
        ) {
          // Deep merge nested objects
          post.additionalFields[key] = {
            ...existingFields[key],
            ...additionalFields[key],
          };
        }
      }
    }

    // Handle schema update (Array of schema objects)
    if (schema !== undefined) {
      if (schema === null) {
        (post as any).schema = null;
      } else if (Array.isArray(schema)) {
        // Filter out any null/undefined values and ensure all items are objects
        (post as any).schema = schema.filter((s: any) => s !== null && s !== undefined && typeof s === "object");
      } else if (typeof schema === "object") {
        // If it's a single object, wrap it in an array
        (post as any).schema = [schema];
      } else {
        (post as any).schema = null;
      }
    }

    // Handle status and publishedAt
    if (status !== undefined) {
      post.status = status;
      
      if (status === "published") {
        if (publishedAt) {
          post.publishedAt = new Date(publishedAt);
        } else if (!post.publishedAt) {
          // Only set if not already published
          post.publishedAt = new Date();
        }
      } else {
        // If status is draft, set publishedAt to null
        post.publishedAt = null;
      }
    } else if (publishedAt !== undefined && post.status === "published") {
      // If only publishedAt is provided and status is already published
      post.publishedAt = new Date(publishedAt);
    }

    // Save the updated post
    const updatedPost = await post.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Post updated successfully!",
        post: {
          id: updatedPost._id.toString(),
          title: updatedPost.title,
          slug: updatedPost.slug,
          status: updatedPost.status,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating post:", error);

    // Handle duplicate key error (slug)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A post with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid post ID format.",
        },
        { status: 400 }
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
        message: "Internal server error. Failed to update post.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}