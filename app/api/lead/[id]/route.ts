import { connectDB } from "@/app/lib/config/db";
import Lead from "@/app/lib/models/lead";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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

    const deleteLead = await Lead.findByIdAndDelete(id);

    if (!deleteLead) {
      return NextResponse.json(
        {
          message: "Lead Not found corresponding to this id",
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(
      { message: "Lead Deleted Successfully", deletedLead: deleteLead },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error deleting lead", error);
    return NextResponse.json(
      { message: "Internal Server Error-deleting lead" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
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
    const body = await req.json();
    const updatedLead = await Lead.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedLead) {
      return NextResponse.json(
        { message: "Lead corresponding to this id not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Updated Lead data", updatedLead: updatedLead },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error updating lead", error);
    return NextResponse.json(
      { message: "Internal Server Error-Updating Lead data" },
      { status: 500 }
    );
  }
}
