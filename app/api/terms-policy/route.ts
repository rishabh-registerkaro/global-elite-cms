import { connectDB } from "@/app/lib/config/db";
import TermsPolicyModel from "@/app/lib/models/termsAndConditions";
import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";
import { NextResponse, NextRequest } from "next/server";

const getCorsHeaders = (origin: string | null) => {
    const PRODUCTION_URL = process.env.PRODUCTION_URL || "https://magdee-coral.vercel.app";
    const normalize = (u: string) => u.replace(/\/$/, "");

    if (origin && normalize(origin) === normalize(PRODUCTION_URL)) {
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };
    }
    if (origin && origin.startsWith("http://localhost:")) {
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };
    }
    return {
        "Access-Control-Allow-Origin": PRODUCTION_URL,
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
};

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req.headers.get("origin")) });
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const doc = await TermsPolicyModel.findOne().lean();
        const corsHeaders = getCorsHeaders(req.headers.get("origin"));

        if (!doc) {
            return NextResponse.json({ success: true, data: null }, { headers: corsHeaders });
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    metaTitle: doc.metaTitle,
                    metaDescription: doc.metaDescription,
                    title: doc.title,
                    subTitle: doc.subTitle,
                    content: doc.content,
                    privacyPolicyContent: doc.privacyPolicyContent,
                    updatedAt: (doc as any).updatedAt,
                },
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error("GET /api/terms-policy error:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch terms & policy." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authResult = await requireRole(req, ADMIN_ROLES);
        if (authResult instanceof NextResponse) return authResult;

        await connectDB();
        const existing = await TermsPolicyModel.findOne();
        if (existing) {
            return NextResponse.json(
                { success: false, message: "Terms & Policy already exists. Use PATCH to update." },
                { status: 409 }
            );
        }

        const body = await req.json();
        const doc = await TermsPolicyModel.create({
            metaTitle: body.metaTitle,
            metaDescription: body.metaDescription,
            title: body.title,
            subTitle: body.subTitle,
            content: body.content ?? {},
            privacyPolicyContent: body.privacyPolicyContent ?? {},
        });

        return NextResponse.json({ success: true, data: doc }, { status: 201 });
    } catch (error) {
        console.error("POST /api/terms-policy error:", error);
        return NextResponse.json({ success: false, message: "Failed to create terms & policy." }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authResult = await requireRole(req, ADMIN_ROLES);
        if (authResult instanceof NextResponse) return authResult;

        await connectDB();
        const body = await req.json();

        const doc = await TermsPolicyModel.findOne();
        if (!doc) {
            return NextResponse.json(
                { success: false, message: "Terms & Policy not found. Use POST to create it first." },
                { status: 404 }
            );
        }

        if (body.metaTitle !== undefined) doc.metaTitle = body.metaTitle;
        if (body.metaDescription !== undefined) doc.metaDescription = body.metaDescription;
        if (body.title !== undefined) doc.title = body.title;
        if (body.subTitle !== undefined) doc.subTitle = body.subTitle;
        if (body.content !== undefined) {
            doc.content = body.content;
            doc.markModified("content");
        }
        if (body.privacyPolicyContent !== undefined) {
            doc.privacyPolicyContent = body.privacyPolicyContent;
            doc.markModified("privacyPolicyContent");
        }

        await doc.save();

        return NextResponse.json({
            success: true,
            data: {
                metaTitle: doc.metaTitle,
                metaDescription: doc.metaDescription,
                title: doc.title,
                subTitle: doc.subTitle,
                content: doc.content,
                privacyPolicyContent: doc.privacyPolicyContent,
            },
        });
    } catch (error) {
        console.error("PATCH /api/terms-policy error:", error);
        return NextResponse.json({ success: false, message: "Failed to update terms & policy." }, { status: 500 });
    }
}
