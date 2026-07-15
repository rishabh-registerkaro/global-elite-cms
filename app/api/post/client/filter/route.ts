import { connectDB } from "@/app/lib/config/db";
import Post from "@/app/lib/models/post";
import Category from "@/app/lib/models/category";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// Helper function to get CORS headers based on origin
const getCorsHeaders = (origin: string | null) => {
    const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://magdee-coral.vercel.app';
    if (origin === PRODUCTION_URL) {
        return {
            'Access-Control-Allow-Origin': PRODUCTION_URL,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
    }
    // Check if origin is localhost with any port
    if (origin && origin.startsWith('http://localhost:')) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
    }
    // Default: allow production URL
    return {
        'Access-Control-Allow-Origin': PRODUCTION_URL,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
};
// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const categoryParam = searchParams.get("category") || "";
        
        // Pagination parameters (only used when fetching posts)
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = 10; // Fixed limit of 10 posts per page

        // If no category parameter, return all categories (no pagination)
        if (!categoryParam || categoryParam.trim().length === 0) {
            const categories = await Category.find()
                .select('_id name slug')
                .sort({ name: 1 })
                .lean();

            const formattedCategories = categories.map((category) => ({
                id: category._id.toString(),
                name: category.name,
                slug: category.slug,
            }));

            const origin = req.headers.get('origin');
            return NextResponse.json({
                success: true,
                categories: formattedCategories,
                count: formattedCategories.length,
            }, {
                status: 200,
                headers: getCorsHeaders(origin)
            });
        }

        // Category parameter provided - find posts by category with pagination
        const categoryQuery = categoryParam.trim();

        // Try to find category by slug first (case-insensitive)
        let category = await Category.findOne({
            slug: { $regex: new RegExp(`^${categoryQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        }).lean();

        // If not found by slug, try to find by name (case-insensitive, partial match)
        if (!category) {
            category = await Category.findOne({
                name: { $regex: categoryQuery, $options: 'i' }
            }).lean();
        }

        // If category not found, return empty result
        if (!category) {
            const origin = req.headers.get('origin');
            return NextResponse.json({
                success: true,
                posts: [],
                count: 0,
                pagination: {
                    page: 1,
                    limit: limit,
                    total: 0,
                    totalPages: 0,
                    hasMore: false
                },
                message: `No category found matching "${categoryQuery}"`,
            }, {
                status: 200,
                headers: getCorsHeaders(origin)
            });
        }

        const categoryId = new mongoose.Types.ObjectId(category._id.toString());
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalCount = await Post.countDocuments({
            status: "published",
            category: { $in: [categoryId] }
        });

        // Find all published posts that have this category with pagination
        const posts = await Post.aggregate([
            // Match only published posts that contain this category ID
            {
                $match: {
                    status: "published",
                    category: { $in: [categoryId] }
                }
            },
            // Add computed field for most recent activity
            {
                $addFields: {
                    mostRecentActivity: {
                        $cond: {
                            if: { $gt: ['$updatedAt', '$publishedAt'] },
                            then: '$updatedAt',
                            else: '$publishedAt'
                        }
                    }
                }
            },
            // Sort by most recent activity
            {
                $sort: { mostRecentActivity: -1 }
            },
            // Skip for pagination
            {
                $skip: skip
            },
            // Limit results
            {
                $limit: limit
            },
            // Populate author
            {
                $lookup: {
                    from: 'users',
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            // Unwind author array
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Project only the fields we need
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    excerpt: 1,
                    featuredImage: 1,
                    publishedAt: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    author: {
                        _id: '$author._id',
                        username: '$author.username',
                        email: '$author.email'
                    },
                    mostRecentActivity: 1
                }
            }
        ]);

        // Transform the response
        const transformedPosts = posts.map((post: any) => ({
            id: post._id.toString(),
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || null,
            featuredImage: post.featuredImage || null,
            publishedAt: post.publishedAt || null,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author || null,
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        const origin = req.headers.get('origin');
        return NextResponse.json({
            success: true,
            posts: transformedPosts,
            count: transformedPosts.length,
            category: {
                id: category._id.toString(),
                name: category.name,
                slug: category.slug,
            },
            pagination: {
                page: page,
                limit: limit,
                total: totalCount,
                totalPages: totalPages,
                hasMore: hasMore
            }
        }, {
            status: 200,
            headers: getCorsHeaders(origin)
        });

    } catch (error: any) {
        console.error("Error in filter route:", error);
        const origin = req.headers.get('origin');
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch data",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            {
                status: 500,
                headers: getCorsHeaders(origin)
            }
        );
    }
}