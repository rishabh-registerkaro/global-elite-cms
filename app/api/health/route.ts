import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/config/db";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    const start = Date.now();

    let dbStatus: "connected" | "disconnected" | "error" = "disconnected";
    let dbError: string | null = null;

    try {
        await connectDB();
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        const state = mongoose.connection.readyState;
        dbStatus = state === 1 ? "connected" : "disconnected";
    } catch (err: any) {
        dbStatus = "error";
        dbError = err.message || "Unknown DB error";
    }

    const healthy = dbStatus === "connected";
    const domain = process.env.PRODUCTION_URL || req.headers.get("host") || "unknown";

    return NextResponse.json(
        {
            success: healthy,
            message: healthy ? "All systems operational" : "Degraded — database unreachable",
            domain,
            db: {
                status: dbStatus,
                ...(dbError ? { error: dbError } : {}),
            },
            responseTimeMs: Date.now() - start,
            timestamp: new Date().toISOString(),
        },
        { status: healthy ? 200 : 503 }
    );
}
