import { connectDB } from "@/app/lib/config/db";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";
import Post from "@/app/lib/models/post";
import Lead from "@/app/lib/models/lead";
import User from "@/app/lib/models/user";
import ServicePageModel from "@/app/lib/models/service";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userResult = await getCurrentUser(req);
    if (userResult instanceof NextResponse) return userResult;

    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to access dashboard." },
        { status: 401 }
      );
    }

    const [
      totalUsers,
      totalServices,
      publishedServices,
      draftServices,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalLeads,
      newLeads,
      recentServices,
    ] = await Promise.all([
      User.countDocuments({}),
      ServicePageModel.countDocuments({}),
      ServicePageModel.countDocuments({ status: "published" }),
      ServicePageModel.countDocuments({ status: "draft" }),
      Post.countDocuments({}),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Lead.countDocuments({}),
      Lead.countDocuments({ status: "new" }),
      ServicePageModel.find()
        .populate("author", "username")
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("slug status heroSection updatedAt author"),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          users: { total: totalUsers },
          services: {
            total: totalServices,
            published: publishedServices,
            draft: draftServices,
          },
          posts: {
            total: totalPosts,
            published: publishedPosts,
            draft: draftPosts,
          },
          leads: {
            total: totalLeads,
            new: newLeads,
          },
          recentServices,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Fetching dashboard statistics",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
