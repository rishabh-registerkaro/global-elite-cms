import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import Registration from "@/app/lib/models/registration";
import { sendRegistrationNotification } from "@/app/lib/config/email";
import { getCorsHeaders } from "@/app/lib/utils/corsHeader";
import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

// POST — public, no auth required
export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
    await connectDB();
    const body = await req.json();
    const { email, pageSource, pageUrl, metadata } = body;

    if (!email || !pageSource || !pageUrl) {
      return NextResponse.json(
        { success: false, message: "email, pageSource and pageUrl are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const validSources = ["home", "contact", "about", "blog"];
    if (!validSources.includes(pageSource)) {
      return NextResponse.json(
        { success: false, message: "Invalid pageSource" },
        { status: 400, headers: corsHeaders }
      );
    }

    const registration = await Registration.create({
      email: email.trim().toLowerCase(),
      pageSource,
      pageUrl,
      metadata: metadata ?? {},
    });

    // Fire-and-forget — don't block response on email
    sendRegistrationNotification({ email, pageSource, pageUrl, metadata }).catch(
      (err) => console.error("Registration notification email failed:", err)
    );

    return NextResponse.json(
      { success: true, message: "Registered successfully", id: registration._id.toString() },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("POST /api/registrations error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET — admin only
export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
    const userResult = await requireRole(req, ADMIN_ROLES);
    if (userResult instanceof NextResponse) return userResult;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "20"));
    const skip  = (page - 1) * limit;
    const source = searchParams.get("source");

    const query: Record<string, string> = {};
    if (source && source !== "all") query.pageSource = source;

    const [registrations, total] = await Promise.all([
      Registration.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Registration.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        registrations,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("GET /api/registrations error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
