import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/user";
import mongoose from "mongoose";
import bcrypt from "bcrypt";


import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const userResult = await requireRole(req, ADMIN_ROLES);
        if (userResult instanceof NextResponse) {
            return userResult;
        }

        const userId = userResult.id;
        if (!userId) {
            return NextResponse.json({
                success: false, message: "Unauthorized User Access",
            }, { status: 401 })
        }

        const { id } = await context.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid User ID format"
            }, { status: 400 });
        }

        await connectDB();

        // Fetch the user (excluding password)
        const user = await User.findById(id)
            .select('_id username email createdAt updatedAt role')
            .lean()

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        const formattedUser = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: user.role,
        }

        return NextResponse.json({
            success: true,
            user: formattedUser
        }, { status: 200 })
    } catch (error: any) {
        console.error("Get user by ID error:", error);

        // Handle CastError
        if (error.name === "CastError") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid user ID format.",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Failed to fetch user details." },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const userResult = await requireRole(req, ADMIN_ROLES);
        if (userResult instanceof NextResponse) {
            return userResult;
        }

        const currentUser = userResult;
        const { id } = await context.params;

        // validate objectid format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                message: "Invalid User ID format"
            }, { status: 400 })
        }

        // check query parameter for password update flag
        const { searchParams } = new URL(req.url);
        const updatePassword = searchParams.get("updatePassword") === "true";

        const body = await req.json();
        const { role, newPassword, currentPassword } = body;

        await connectDB();

        const targetUser = await updatePassword ? await User.findById(id).select("+password _id username email role") : await User.findById(id).select("_id username email role");

        if (!targetUser) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        // checking if user is trying to change their own data
        const isChangingOwnData = currentUser.id === id;

        // ========== PASSWORD UPDATE LOGIC ==========
        if (updatePassword) {
            // validate new password is provided
            if (!newPassword) {
                return NextResponse.json({
                    success: false,
                    message: "New password is required"
                }, { status: 400 })
            }

            // validate new password length
            if (newPassword.length < 6) {
                return NextResponse.json({
                    success: false,
                    message: "New password must be at least 6 characters"
                }, { status: 400 })
            }

            // Security check: Admin cannot change superadmin's password
            if (currentUser.role === "admin" && targetUser.role === "superadmin") {
                return NextResponse.json({
                    success: false,
                    message: "You don't have permission to change Super Admin's password"
                }, { status: 403 })
            }

            // If changing own password, require and verify current password
            if (isChangingOwnData) {
                if (!currentPassword) {
                    return NextResponse.json({
                        success: false,
                        message: "Current password is required when changing your own password"
                    }, { status: 400 })
                }

                // Verify current password
                const isCurrentPasswordValid = await targetUser.comparePassword(currentPassword);
                if (!isCurrentPasswordValid) {
                    return NextResponse.json({
                        success: false,
                        message: "Current password is incorrect"
                    }, { status: 401 })
                }

                // Check if new password is same as current password
                const isSamePassword = await bcrypt.compare(newPassword, targetUser.password);
                if (isSamePassword) {
                    return NextResponse.json({
                        success: false,
                        message: "New password must be different from current password"
                    }, { status: 400 })
                }
            }
            // Note: When changing another user's password, we don't need current password verification

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update password 
            targetUser.password = hashedNewPassword;
            await targetUser.save();

            return NextResponse.json({
                success: true,
                message: "Password updated successfully"
            }, { status: 200 })
        }
        // ========== ROLE UPDATE LOGIC ==========
        else {
            // validate role is provided
            if (!role) {
                return NextResponse.json({
                    success: false,
                    message: "Role is required"
                }, { status: 400 })
            }

            // Validate role value — superadmin cannot be assigned via API
            const validRoles = ["admin", "editor", "contributor"];
            if (!validRoles.includes(role)) {
                return NextResponse.json({
                    success: false,
                    message: role === "superadmin"
                        ? "Super Admin role cannot be assigned through the system."
                        : "Invalid role."
                }, { status: 403 })
            }

            // Prevent users from changing their own role
            if (isChangingOwnData) {
                return NextResponse.json({
                    success: false,
                    meessage: "You cannot change your own role"
                }, { status: 403 })
            }

            // security check: admin cannot change superadmin's role
            if (currentUser.role === "admin" && targetUser.role === "superadmin") {
                return NextResponse.json({
                    success: false,
                    message: "You don't have permission to change Super Admin's role"
                }, { status: 403 })
            }

            // Prevent admin from assigning superadmin or admin role
            if (currentUser.role === "admin" && (role === "superadmin" || role === "admin")) {
                return NextResponse.json({
                    success: false,
                    message: `You don't have permission to assign ${role === "superadmin" ? "Super Admin" : "Admin"} role`
                }, { status: 403 })
            }

            // update the user's role
            targetUser.role = role;
            await targetUser.save();

            return NextResponse.json({
                success: true,
                message: "User role updated successfully",
                user: {
                    id: targetUser._id.toString(),
                    username: targetUser.username,
                    email: targetUser.email,
                    role: targetUser.role,
                }
            }, { status: 200 })
        }
    } catch (error: any) {
        console.error("Update user error:", error);

        if (error.name === "CastError") {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID format.",
            }, { status: 400 });
        }

        return NextResponse.json(
            { success: false, message: "Failed to update user." },
            { status: 500 }
        );
    }
}