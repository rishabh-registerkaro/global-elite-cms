// app/api/post/filter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";
import Post from "@/app/lib/models/post";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || '';
    const status = searchParams.get("status") as "draft" | "published" | null;
    const authorId = searchParams.get("author");
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    // Auth
    const userResult = await getCurrentUser(req);
    if (userResult instanceof NextResponse) return userResult;

    const userId = userResult.id?.toString();
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    // Build Query
    const query: any = {};

    if (search) query.title = { $regex: search, $options: 'i' };
    if (status) query.status = status;

    // Author Filter
    if (authorId) {
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return NextResponse.json({ success: false, message: "Invalid author ID" }, { status: 400 });
      }
      query.author = new mongoose.Types.ObjectId(authorId);
    } else {
      if (status === 'draft') {
        query.author = new mongoose.Types.ObjectId(userId);
        query.status = 'draft';
      } else {
        query.$or = [
          { status: 'published' },
          { author: new mongoose.Types.ObjectId(userId), status: 'draft' }
        ];
      }
    }



    // MINIMAL & FAST Projection — only what you asked for
    const projection = {
      title: 1,
      slug: 1,
      status: 1,
      publishedAt: 1,
      createdAt: 1,
      author: 1,
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .select(projection)
        .populate('author', 'username')           // only username needed
        .sort({ publishedAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),

      Post.countDocuments(query).exec()
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error: any) {
    console.error('Filter API Error:', error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}