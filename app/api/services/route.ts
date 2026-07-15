import { connectDB } from "@/app/lib/config/db";
import ServicePageModel from "@/app/lib/models/service";
import { NextRequest, NextResponse } from "next/server";

import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const authorResult = await requireRole(req, ADMIN_ROLES);
    if (authorResult instanceof NextResponse) {
      return authorResult;
    }
    const authorId = authorResult.id;

    if (!authorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to add the service page.",
        },
        { status: 401 }
      );
    }

    if (
      !body?.slug ||
      !body?.heroSection?.heading
    ) {
      return NextResponse.json(
        { message: "Missing required fields: slug and heroSection.heading are required" },
        { status: 400 }
      );
    }
    const slugExists = await ServicePageModel.findOne({ slug: body.slug });

    if (slugExists) {
      return NextResponse.json(
        { message: "Slug already exists. Please use a unique slug." },
        { status: 409 }
      );
    }

    const service = await ServicePageModel.create({
      ...body,
      author:authorId
    });

    return NextResponse.json(
      {
        message: "Service Added Successfully",
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Failed to Add Service", error);
    return NextResponse.json(
      {
        message: "Internal Server Error-Adding Service",
        error: error,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req:NextRequest) {
  try {
    const userResult = await requireRole(req, ADMIN_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login to access service data." },
        { status: 401}
      );
    }
    await connectDB();
    const servicePages = await ServicePageModel.find().populate("author", "username").sort({
      created: -1,
    });

    return NextResponse.json(
      { message: " Service Pages Fetched Successfully", servicePages },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in fetching all service pages", error);
    return NextResponse.json(
      { message: "Internal Server Error-Error fetching service pages" },
      { status: 500 }
    );
  }
}