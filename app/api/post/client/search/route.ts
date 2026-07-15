import { connectDB } from "@/app/lib/config/db";
import Post from "@/app/lib/models/post";
import { NextRequest, NextResponse } from "next/server";

const getCorsHeaders = (origin: string | null) => {
    const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://magdee-coral.vercel.app';
    // Check if origin is production URL
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

        // get search query parameter 
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get("q") || "";

        // validate search query
        if (!searchQuery || searchQuery.trim().length === 0) {
            const origin = req.headers.get('origin');
            return NextResponse.json({
                success: false,
                message: "Search Query is required",
            }, { 
                status: 400,
                headers: getCorsHeaders(origin)
            })
        }

        // optimized search using aggregation pipeline
        const posts = await Post.aggregate([
            // Match only published posts and search by title (case-insensitive, partial match)
            {
                $match: {
                    status: "published",
                    title: {
                        $regex: searchQuery.trim(),
                        $options: "i"  // case-insensitive
                    }
                }
            },
            // sort by most recent (updatedAt or publishedAt)
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
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0, // Exclude _id
                    title: 1,
                    slug: 1
                }
            }
        ])

        // Return original format with success and posts
        const origin = req.headers.get('origin');
        return NextResponse.json({
            success: true,
            posts: posts
        }, { 
            status: 200,
            headers: getCorsHeaders(origin)
        })
    } catch (error: any) {
        console.error("Error searching blogs:", error);
        const origin = req.headers.get('origin');
        return NextResponse.json(
            {
                success: false,
                message: "Failed to search blogs",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { 
                status: 500,
                headers: getCorsHeaders(origin)
            }
        );
    }
}