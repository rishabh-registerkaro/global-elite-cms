import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";

export async function PUT(req) {
    try {
        const userResult = await getCurrentUser(req);
        if (userResult instanceof NextResponse) {
            return userResult;
        }
        const userId = userResult.id;
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized. Please login to change password."
            }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;


        // Validate required fields
        if (!currentPassword || !newPassword) {
            return NextResponse.json({
                success: false,
                message: "Current password and new password are required",
            }, { status: 400 });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return NextResponse.json({
                success: false,
                message: "New password must be at least 6 characters long",
            }, { status: 400 });
        }

        // connecting DB
        await connectDB();

        const user = await User.findById(userId).select("+password");
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({
                success: false,
                message: "Current password is incorrect",
            }, { status: 401 });
        }

        // Check if new password is same as current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return NextResponse.json({
                success: false,
                message: "New password must be different from current password",
            }, { status: 400 });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

         // Update password
         user.password = hashedNewPassword;
         await user.save();

         return NextResponse.json({
            success: true,
            message: "Password changed successfully.",
        }, { status: 200 });

    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to update password",
            },
            { status: 500 }
        );

    }
}