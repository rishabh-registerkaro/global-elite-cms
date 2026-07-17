import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/config/db";
import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await requireRole(req, ADMIN_ROLES);
    if (userResult instanceof NextResponse) return userResult;

    const { id } = await context.params;

    if (typeof id !== "string" || id.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const deleted = await prisma.registration
      .delete({ where: { id } })
      .catch((error: any) => {
        if (error?.code === "P2025") return null;
        throw error;
      });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/registrations/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
