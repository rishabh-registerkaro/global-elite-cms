import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/lib/config/db"
import User from "@/app/lib/models/user"
import Post from "@/app/lib/models/post"
import ServicePageModel from "@/app/lib/models/service"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("authToken")?.value
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized. Please login to perform changes"
            }, { status: 401 })
        }
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
            id: string;
            username: string;
            role: string;
        }

        await connectDB();

        const user = await User.findById(decoded.id).select('_id username email role createdAt updatedAt');
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }
        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        })
    } catch (error: any) {
        if (error.name === "JsonWebTokenError" || error.name === 'TokenExpiredError') {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token. Please login again." },
                { status: 401 }
            );
        }
        console.error("Get profile error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch profile data." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {

        // 1. Verify authentication
        const token = req.cookies.get("authToken")?.value;
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized. Please login to perform changes"
            }, { status: 401 });
        }

        let decoded: { id: string; username: string; role: string };
        try {
            decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
                id: string;
                username: string;
                role: string;
            };
        } catch (error: any) {
            if (error.name === "JsonWebTokenError" || error.name === 'TokenExpiredError') {
                return NextResponse.json(
                    { success: false, message: "Invalid or expired token. Please login again." },
                    { status: 401 }
                );
            }
            throw error;
        }

        await connectDB();

        // Verify user exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }
        const body = await req.json();
        const { userId, page: pageParam, limit: limitParam, postsPage: postsPageParam, pagesPage: pagesPageParam, postsLimit: postsLimitParam, pagesLimit: pagesLimitParam } = body;

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "userId is required"
            }, { status: 400 });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({
                success: false,
                message: "Invalid userId format"
            }, { status: 400 });
        }

        // Pagination defaults and validation
        const defaultLimit = 10;
        const maxLimit = 100;

        // Posts pagination
        const postsPage = Math.max(1, parseInt(postsPageParam || pageParam || '1', 10));
        const postsLimit = Math.min(maxLimit, Math.max(1, parseInt(postsLimitParam || limitParam || String(defaultLimit), 10)));
        const postsSkip = (postsPage - 1) * postsLimit;

        // Pages pagination
        const pagesPage = Math.max(1, parseInt(pagesPageParam || pageParam || '1', 10));
        const pagesLimit = Math.min(maxLimit, Math.max(1, parseInt(pagesLimitParam || limitParam || String(defaultLimit), 10)));
        const pagesSkip = (pagesPage - 1) * pagesLimit;

        await connectDB();

        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Run posts and services queries in parallel
        const [totalPostsCount, publishedPosts, totalServicesCount, services] = await Promise.all([
            Post.countDocuments({ author: userObjectId, status: { $in: ['published', 'draft'] } }),
            Post.find({ author: userObjectId, status: 'published' })
                .select('_id title slug status publishedAt createdAt updatedAt')
                .sort({ publishedAt: -1, createdAt: -1 })
                .skip(postsSkip)
                .limit(postsLimit)
                .lean(),
            ServicePageModel.countDocuments({ author: userObjectId }),
            ServicePageModel.find({ author: userObjectId })
                .select('_id slug status heroSection createdAt updatedAt')
                .sort({ updatedAt: -1 })
                .skip(pagesSkip)
                .limit(pagesLimit)
                .lean(),
        ]);

        const totalPostsPages = Math.ceil(totalPostsCount / postsLimit);
        const totalServicesPages = Math.ceil(totalServicesCount / pagesLimit);

        return NextResponse.json({
            success: true,
            data: {
                posts: publishedPosts.map(post => ({
                    _id: post._id.toString(),
                    title: post.title,
                    slug: post.slug,
                    status: post.status,
                    publishedAt: post.publishedAt,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                })),
                pages: services.map((svc: any) => ({
                    _id: svc._id.toString(),
                    pageTitle: svc.heroSection?.title || svc.slug,
                    pageSlug: svc.slug,
                    status: svc.status,
                    createdAt: svc.createdAt,
                    updatedAt: svc.updatedAt,
                })),
                pagination: {
                    posts: {
                        currentPage: postsPage,
                        limit: postsLimit,
                        totalItems: totalPostsCount,
                        totalPages: totalPostsPages,
                        hasNextPage: postsPage < totalPostsPages,
                        hasPrevPage: postsPage > 1,
                    },
                    pages: {
                        currentPage: pagesPage,
                        limit: pagesLimit,
                        totalItems: totalServicesCount,
                        totalPages: totalServicesPages,
                        hasNextPage: pagesPage < totalServicesPages,
                        hasPrevPage: pagesPage > 1,
                    },
                },
            },
        });
    } catch (error: any) {
        console.error("Get user published content error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch user published content." },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        // Verify authentication
        const token = req.cookies.get("authToken")?.value;
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized. Please login to perform changes"
            }, { status: 401 });
        }

        let decoded: { id: string; username: string };
        try {
            decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
                id: string;
                username: string;
            };
        } catch (error: any) {
            if (error.name === "JsonWebTokenError" || error.name === 'TokenExpiredError') {
                return NextResponse.json(
                    { success: false, message: "Invalid or expired token. Please login again." },
                    { status: 401 }
                );
            }
            throw error;
        }

        // Parse request body
        const body = await req.json();
        const { email, username } = body;

        // Validate required fields
        if (!email || !username) {
            return NextResponse.json({
                success: false,
                message: "Email and username are required"
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                message: "Please provide a valid email address"
            }, { status: 400 });
        }

        // Validate username length
        if (username.length < 3 || username.length > 30) {
            return NextResponse.json({
                success: false,
                message: "Username must be between 3 and 30 characters"
            }, { status: 400 });
        }

        await connectDB();

        // Get current user
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        // Check if email is being changed and validate uniqueness
        if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
            const emailExists = await User.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: decoded.id }
            });

            if (emailExists) {
                return NextResponse.json({
                    success: false,
                    message: "Email already exists. Please use a different email."
                }, { status: 400 });
            }
        }

        // Check if username is being changed and validate uniqueness
        if (username.trim() !== currentUser.username.trim()) {
            const usernameExists = await User.findOne({
                username: username.trim(),
                _id: { $ne: decoded.id }
            });

            if (usernameExists) {
                return NextResponse.json({
                    success: false,
                    message: "Username already exists. Please use a different username."
                }, { status: 400 });
            }
        }

        // Update user (only email and username)
        currentUser.email = email.toLowerCase().trim();
        currentUser.username = username.trim();
        await currentUser.save();

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: currentUser._id.toString(),
                email: currentUser.email,
                username: currentUser.username,
                createdAt: currentUser.createdAt,
                updatedAt: currentUser.updatedAt,
            }
        });
    } catch (error: any) {
        console.error("Update profile error:", error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({
                success: false,
                message: `${field === 'email' ? 'Email' : 'Username'} already exists. Please use a different ${field}.`
            }, { status: 400 });
        }

        return NextResponse.json(
            { success: false, message: "Failed to update profile." },
            { status: 500 }
        );
    }
}