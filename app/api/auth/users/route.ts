import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/user";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";

export async function GET(req: NextRequest) {
    try {
        // Verify authentication
        const userResult = await getCurrentUser(req);
        if (userResult instanceof NextResponse) {
            return userResult; // Error response
        }

        const userId = userResult.id;
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Please login to perform changes" },
                { status: 401 }
            );
        }

        await connectDB();
        const users = await User.find().select("_id username").sort({ username: 1 }).lean();

        const formattedUsers = users.map((user) => ({
            _id: user._id.toString(),
            id: user._id.toString(),
            username: user.username,
        }));

        return NextResponse.json({
            success: true,
            users: formattedUsers
        });

    } catch (error: any) {
        console.error("Get users error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch users." },
            { status: 500 }
        );
    }
}