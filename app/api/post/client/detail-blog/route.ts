import { connectDB } from "@/app/lib/config/db";
import Post from "@/app/lib/models/post";
import { NextRequest, NextResponse } from "next/server";



// CORS headers helper - REPLACE THE HARDCODED ONE
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
    return NextResponse.json({}, { headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get slug from query parameters
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        // Validate slug parameter
        if (!slug || slug.trim().length === 0) {
            return NextResponse.json({
                success: false,
                message: "Slug parameter is required",
            }, {
                status: 400,
                headers: getCorsHeaders(req.headers.get('origin'))
            });
        }

        // Use aggregation pipeline instead of populate (more efficient and doesn't require User model registration)
        const posts = await Post.aggregate([
            // Match post by slug and status
            {
                $match: {
                    slug: slug.trim().toLowerCase(),
                    status: "published"
                }
            },
            // Populate author using $lookup
            {
                $lookup: {
                    from: 'users',
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            // Unwind author array to get single author object
            {
                $unwind: {
                    path: '$author',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Populate category using $lookup
            {
                $lookup: {
                    from: 'categories',
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            // Project all fields we need
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    excerpt: 1,
                    content: 1,
                    featuredImage: 1,
                    status: 1,
                    publishedAt: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    faq_items: 1,
                    additionalFields: 1,
                    schema: 1,
                    author: {
                        _id: '$author._id',
                        username: '$author.username',
                        email: '$author.email'
                    },
                    category: {
                        $map: {
                            input: '$category',
                            as: 'cat',
                            in: {
                                _id: '$$cat._id',
                                name: '$$cat.name',
                                slug: '$$cat.slug',
                                color: '$$cat.color',
                            }
                        }
                    }
                }
            }
        ]);

        // Check if post was found
        if (!posts || posts.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Post not found or not published",
            }, {
                status: 404,
                headers: getCorsHeaders(req.headers.get('origin'))
            });
        }   

        const post = posts[0];

        // Transform the response to include all post data
        const transformedPost = {
            id: post._id.toString(),
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || null,
            content: post.content,
            featuredImage: post.featuredImage || null,
            status: post.status,
            publishedAt: post.publishedAt || null,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author ? {
                id: post.author._id.toString(),
                username: post.author.username,
                email: post.author.email
            } : null,
            category: Array.isArray(post.category)
                ? post.category.map((cat: any) => ({
                    id: cat._id.toString(),
                    name: cat.name,
                    slug: cat.slug,
                    color: cat.color || "",
                }))
                : [],
            faq_items: post.faq_items || [],
            additionalFields: post.additionalFields || {},
            schema: post.schema || null,
        };

        return NextResponse.json({
            success: true,
            post: transformedPost,
        }, {
            status: 200,
            headers: getCorsHeaders(req.headers.get('origin'))
        });

    } catch (error: any) {
        console.error("Error fetching blog detail:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch blog post",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            {
                status: 500,
                headers: getCorsHeaders(req.headers.get('origin'))
            }
        );
    }
}