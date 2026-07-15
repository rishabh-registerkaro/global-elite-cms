import { connectDB } from "@/app/lib/config/db";
import Lead from "@/app/lib/models/lead";
import ServicePackage from "@/app/lib/models/package";
import { getCorsHeaders } from "@/app/lib/utils/corsHeader";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

// POST - Create Lead (Step 1)
export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phoneNo || !body.region || !body.serviceSelected) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, Email, Phone Number, Region, and Service Selected are required",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if packageId is provided - if yes, redirect to payment flow
    if (body.packageId) {
      return NextResponse.json(
        {
          success: false,
          message: "For package purchases, please use /api/razorpay/create-order endpoint",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if lead already exists
    let lead = await Lead.findOne({ email: body.email });

    if (lead) {
      // Update existing lead only if no payment exists
      if (!lead.hasPayment) {
        lead.name = body.name;
        lead.phoneNo = body.phoneNo;
        lead.companyName = body.companyName;
        lead.region = body.region;
        lead.serviceSelected = body.serviceSelected;
        lead.message = body.message;
        lead.hasPayment = false;
        lead.status = "new";
        await lead.save();
      }
    } else {
      // Create new lead
      lead = await Lead.create({
        name: body.name,
        email: body.email,
        phoneNo: body.phoneNo,
        companyName: body.companyName,
        region: body.region,
        serviceSelected: body.serviceSelected,
        message: body.message,
        hasPayment: false,
        status: "new",
        leadSource: "Website",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        leadId: lead._id.toString(),
        data: lead,
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.log("Error while storing lead data in DB", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Storing Lead data",
        error: error.message,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// GET - Fetch Leads (Admin Only)
export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  try {
    const userResult = await requireRole(req, ADMIN_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult; // Unauthorized response
    }
    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login to access leads." },
        { status: 401, headers: corsHeaders }
      );
    }

    await connectDB();
    
    // Ensure ServicePackage model is registered before populate
    // This prevents "Schema hasn't been registered" errors
    if (!mongoose.models.ServicePackage) {
      // Model will be registered when imported, but this ensures it's available
      ServicePackage;
    }
    
    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const region = searchParams.get("region");
    const hasPayment = searchParams.get("hasPayment");

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    if (region) {
      query.region = region;
    }
    if (hasPayment !== null) {
      query.hasPayment = hasPayment === "true";
    }

    // Get total count for pagination
    const total = await Lead.countDocuments(query);
    
    // Fetch leads with pagination
    const leads = await Lead.find(query)
      .populate({
        path: "packageId",
        select: "packageName serviceName",
        model: ServicePackage, // Explicitly specify the model
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        success: true,
        message: "Fetched Leads Data successfully",
        leadCount: total,
        leads: leads,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: total,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.log("Error fetching leads", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Fetching leads",
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}