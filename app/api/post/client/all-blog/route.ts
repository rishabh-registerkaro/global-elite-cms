// import { connectDB } from "@/app/lib/config/db";
// import Post from "@/app/lib/models/post";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//     try {

//         // connecting to db
//         await connectDB();

//         const posts = await Post.aggregate([
//             // matches only published posts
//             {
//                 $match: {
//                     status: "published"
//                 }
//             },
//             // added a computed fields for the most recent posts
//             {
//                 $addFields: {
//                     mostRecentActivity: {
//                         $cond: {
//                             if: { $gt: ['$updatedAt', '$publishedAt'] },
//                             then: '$updatedAt',
//                             else: '$publishedAt'
//                         }
//                     }
//                 }
//             },
//             {
//                 $sort: { mostRecentActivity: -1 }
//             },
//             {
//                 $limit: 5
//             },
//             // populate author
//             {
//                 $lookup: {
//                     from: 'users',
//                     localField: "author",
//                     foreignField: "_id",
//                     as: "author"
//                 }
//             },
//             // Unwind author array to get single author object
//             {
//                 $unwind: {
//                     path: '$author',
//                     preserveNullAndEmptyArrays: true
//                 }
//             },
//             // Project only the fields we need
//             {
//                 $project: {
//                     _id: 1,
//                     title: 1,
//                     slug: 1,
//                     featuredImage: 1,
//                     publishedAt: 1,
//                     createdAt: 1,
//                     updatedAt: 1,
//                     excerpt: 1,
//                     author: {
//                         _id: '$author._id',
//                         username: '$author.username',
//                         email: '$author.email'
//                     },
//                     mostRecentActivity: 1
//                 }
//             }
//         ]);

//        // Transform the response to match expected format
//        const transformedPosts = posts.map((post: any) => ({
//         id: post._id.toString(),
//         title: post.title,
//         slug: post.slug,
//         featuredImage: post.featuredImage || null,
//         publishedAt: post.publishedAt || null,
//         excerpt: post.excerpt || null,
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//         author: post.author || null,
//     }));

//         return NextResponse.json({
//             success: true,
//             posts: transformedPosts,
//             count: transformedPosts.length,
//         },
//             { status: 200 })
//     } catch (error: any) {
//         console.error("Error fetching top blogs:", error);
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: "Failed to fetch blogs",
//                 error: process.env.NODE_ENV === "development" ? error.message : undefined,
//             },
//             { status: 500 }
//         )
//     }
// }

import { connectDB } from "@/app/lib/config/db";
import Post from "@/app/lib/models/post";
import { NextRequest, NextResponse } from "next/server";

function computeReadTimeMinutes(html: string): number {
    const text = html.replace(/<[^>]+>/g, ' ');
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}

// CORS headers helper
const getCorsHeaders = (origin: string | null) => {
    const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://magdee-coral.vercel.app';
    
    // Normalize URLs (remove trailing slashes for comparison)
    const normalizeUrl = (url: string) => url.replace(/\/$/, '');
    const normalizedProductionUrl = normalizeUrl(PRODUCTION_URL);
    const normalizedOrigin = origin ? normalizeUrl(origin) : null;
    
    // Check if origin matches production URL (with or without trailing slash)
    if (normalizedOrigin === normalizedProductionUrl) {
        return {
            'Access-Control-Allow-Origin': origin || PRODUCTION_URL,
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
    
    // Default: always allow production URL (for cases where origin might be null or different)
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

        const { searchParams } = new URL(req.url);
        const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
        const skip  = (page - 1) * limit;

        const matchStage = { $match: { status: "published" } };
        const addFieldsStage = {
            $addFields: {
                mostRecentActivity: {
                    $cond: {
                        if: { $gt: ["$updatedAt", "$publishedAt"] },
                        then: "$updatedAt",
                        else: "$publishedAt",
                    },
                },
            },
        };

        const [posts, totalCount] = await Promise.all([
            Post.aggregate([
                matchStage,
                addFieldsStage,
                { $sort: { mostRecentActivity: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "users",
                        localField: "author",
                        foreignField: "_id",
                        as: "author",
                    },
                },
                { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $project: {
                        _id: 1, title: 1, slug: 1, featuredImage: 1,
                        publishedAt: 1, createdAt: 1, updatedAt: 1, excerpt: 1,
                        content: 1, mostRecentActivity: 1,
                        author: { _id: "$author._id", username: "$author.username" },
                        category: {
                            $map: {
                                input: "$category",
                                as: "cat",
                                in: { _id: "$$cat._id", name: "$$cat.name", slug: "$$cat.slug", color: "$$cat.color" },
                            },
                        },
                    },
                },
            ]),
            Post.countDocuments({ status: "published" }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const transformedPosts = posts.map((post: any) => ({
            id: post._id.toString(),
            title: post.title,
            slug: post.slug,
            featuredImage: post.featuredImage || null,
            publishedAt: post.publishedAt || null,
            excerpt: post.excerpt || null,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            readTimeMinutes: computeReadTimeMinutes(post.content || ""),
            author: post.author ? { id: post.author._id?.toString(), username: post.author.username } : null,
            category: Array.isArray(post.category)
                ? post.category.map((cat: any) => ({ id: cat._id?.toString(), name: cat.name, slug: cat.slug, color: cat.color || "" }))
                : [],
        }));

        const origin = req.headers.get("origin");
        return NextResponse.json(
            {
                success: true,
                posts: transformedPosts,
                count: transformedPosts.length,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
            { status: 200, headers: getCorsHeaders(origin) }
        );
    } catch (error: any) {
        console.error("Error fetching top blogs:", error);
        const origin = req.headers.get("origin");
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch blogs",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500, headers: getCorsHeaders(origin) }
        );
    }
}