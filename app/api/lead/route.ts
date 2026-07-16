import prisma from "@/app/lib/config/db";
import { withMongoId } from "@/app/lib/utils/serialize";
import { getCorsHeaders } from "@/app/lib/utils/corsHeader";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

// POST - Create Lead (Step 1)
export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);
  try {
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
    let lead = await prisma.lead.findFirst({ where: { email: body.email } });

    if (lead) {
      // Update existing lead only if no payment exists
      if (!lead.hasPayment) {
        lead = await prisma.lead.update({
          where: { id: lead.id },
          data: {
            name: body.name,
            phoneNo: body.phoneNo,
            companyName: body.companyName,
            region: body.region,
            serviceSelected: body.serviceSelected,
            message: body.message,
            hasPayment: false,
            status: "new",
          },
        });
      }
    } else {
      // Create new lead
      lead = await prisma.lead.create({
        data: {
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
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        leadId: lead.id,
        data: withMongoId(lead),
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

    // Invalid enum values would make Prisma throw — Mongoose simply matched
    // nothing, so mimic that with an impossible filter.
    const LEAD_STATUSES = ["new", "contacted", "converted", "lost"];
    const PAYMENT_STATUSES = ["pending", "success", "failed"];
    const noMatch =
      (status !== null && !LEAD_STATUSES.includes(status)) ||
      (paymentStatus !== null && !PAYMENT_STATUSES.includes(paymentStatus));

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
    const total = noMatch ? 0 : await prisma.lead.count({ where: query });

    // Fetch leads with pagination
    const leads = noMatch
      ? []
      : await prisma.lead.findMany({
          where: query,
          include: {
            package: { select: { id: true, packageName: true, serviceName: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        });

    // Preserve the Mongoose populate("packageId") contract: the API field
    // `packageId` holds the populated package object (or null).
    const serializedLeads = leads.map((lead) => {
      const { package: pkg, ...rest } = lead;
      return withMongoId({
        ...rest,
        packageId: pkg ? withMongoId(pkg) : rest.packageId,
      });
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        success: true,
        message: "Fetched Leads Data successfully",
        leadCount: total,
        leads: serializedLeads,
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
