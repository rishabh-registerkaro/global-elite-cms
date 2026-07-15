import { connectDB } from "@/app/lib/config/db";
import ServicePageModel from "@/app/lib/models/service";
import { NextRequest, NextResponse } from "next/server";
// bug fix

// CORS headers helper
const getCorsHeaders = (origin: string | null) => {
    const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://magdee-coral.vercel.app';
    if (origin === PRODUCTION_URL) {
        return {
            'Access-Control-Allow-Origin': PRODUCTION_URL,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
    }
    // Check if origin is localhost with any port
    if (origin && origin.startsWith('http://localhost:')) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
    }
    // Default: allow production URL
    return {
        'Access-Control-Allow-Origin': PRODUCTION_URL,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
    const origin = req.headers.get('origin');
    return NextResponse.json({}, { headers: getCorsHeaders(origin) });
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();
        const { slug } = await context.params;
        const servicePage = await ServicePageModel.findOne({ slug }).populate("author", "username").sort({
            created: -1,
        });

        const origin = req.headers.get('origin');
        return NextResponse.json(
            { message: " Service Pages Fetched Successfully", servicePages: servicePage },
            { 
                status: 200,
                headers: getCorsHeaders(origin)
            }
        );
    } catch (error) {
        console.log("Error in fetching all service pages", error);
        const origin = req.headers.get('origin');
        return NextResponse.json(
            { message: "Internal Server Error-Error fetching service pages" },
            { 
                status: 500,
                headers: getCorsHeaders(origin)
            }
        );
    }
}