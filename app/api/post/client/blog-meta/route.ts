import { connectDB } from "@/app/lib/config/db";
import Post from "@/app/lib/models/post";
import { NextRequest, NextResponse } from "next/server";

const getCorsHeaders = (origin: string | null) => {
    const PRODUCTION_URL = process.env.PRODUCTION_URL || "https://magdee-coral.vercel.app";
    const normalize = (url: string) => url.replace(/\/$/, "");
    if (normalize(origin ?? "") === normalize(PRODUCTION_URL)) {
        return {
            "Access-Control-Allow-Origin": origin || PRODUCTION_URL,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };
    }
    if (origin && origin.startsWith("http://localhost:")) {
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };
    }
    return {
        "Access-Control-Allow-Origin": PRODUCTION_URL,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
};

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req.headers.get("origin")) });
}

// Lightweight endpoint — returns all published posts with only the fields
// needed for sidebar navigation and prev/next links. No content field.
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const posts = await Post.aggregate([
            { $match: { status: "published" } },
            {
                $addFields: {
                    mostRecentActivity: {
                        $cond: {
                            if: { $gt: ["$updatedAt", "$publishedAt"] },
                            then: "$updatedAt",
                            else: "$publishedAt",
                        },
                    },
                },
            },
            { $sort: { mostRecentActivity: -1 } },
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
                    _id: 0,
                    slug: 1,
                    title: 1,
                    publishedAt: 1,
                    category: {
                        $map: {
                            input: "$category",
                            as: "cat",
                            in: { name: "$$cat.name", slug: "$$cat.slug", color: "$$cat.color" },
                        },
                    },
                },
            },
        ]);

        const origin = req.headers.get("origin");
        return NextResponse.json(
            { success: true, posts, count: posts.length },
            { status: 200, headers: getCorsHeaders(origin) }
        );
    } catch (error: any) {
        console.error("GET /api/post/client/blog-meta error:", error);
        const origin = req.headers.get("origin");
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch blog meta",
                error: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500, headers: getCorsHeaders(origin) }
        );
    }
}
