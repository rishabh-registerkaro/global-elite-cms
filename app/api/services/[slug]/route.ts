import { connectDB } from "@/app/lib/config/db";
import ServicePageModel from "@/app/lib/models/service";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const userResult = await getCurrentUser(req);
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
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 }
      );
    }

    const service = await ServicePageModel.findOne({ slug }).lean();
    if (!service) {
      return NextResponse.json(
        { message: "Service Not Found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        message: "Service Data fetched successfully",
        data: service,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error fetching service data", error);
    return NextResponse.json(
      { message: "Internal Server Error-fetching service data", error: error },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  try {
    const userResult = await getCurrentUser(req);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized. Please login to access leads." },
        { status: 401 }
      );
    }
    await connectDB();
    const { slug: newSlug, ...rest } = await req.json();

    if (newSlug && newSlug !== slug) {
      const existing = await ServicePageModel.findOne({ slug: newSlug }).lean();
      if (existing) {
        return NextResponse.json(
          { message: `Slug "${newSlug}" is already taken. Please choose a different slug.` },
          { status: 409 }
        );
      }
    }

    const updatedPageData = newSlug ? { slug: newSlug, ...rest } : rest;

    const updated = await ServicePageModel.findOneAndUpdate({ slug },{ $set: updatedPageData },{ new: true });
    if (!updated) {
      return NextResponse.json(
        { message: "Service Page not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Service Page updated successfully", updatedPage: updated },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error while editing service page");
    return NextResponse.json(
      { message: "Internal Server error-Editing service Page",
        error:error
       },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  try {
    const userResult = await getCurrentUser(req);
        if (userResult instanceof NextResponse) {
          return userResult;
        }
        const userId = userResult.id;
        if (!userId) {
          return NextResponse.json(
            { message: "Unauthorized. Please login to access leads." },
            { status: 401 }
          );
        }
    await connectDB();
    const deletePage = await ServicePageModel.findOneAndDelete({slug});

    if (!deletePage) {
      return NextResponse.json(
        { message: "Service Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Service Page deleted successfully", deletePage },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting service page", error);
    return NextResponse.json(
      { message: "Internal Server Error — deleting service page failed" },
      { status: 500 }
    );
  }
}
