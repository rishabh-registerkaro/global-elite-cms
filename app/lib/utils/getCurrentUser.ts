import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/user";

export const getCurrentUser = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login to perform changes" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as {
      id: string;
      username: string;
      role: string;
    };

    // Connect to database and verify user exists
    await connectDB();
    const user = await User.findById(decoded.id).select("_id role");

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User not found. Please login again." 
        },
        { status: 401 }
      );
    }

    // Return user data (verified from database) - same format as before
    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    };
  } catch (error: any) {
    // Handle JWT errors
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid or expired token. Please login again." 
        },
        { status: 401 }
      );
    }

    // Handle other errors
    console.error("getCurrentUser error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Authentication failed. Please login again." 
      },
      { status: 401 }
    );
  }
};