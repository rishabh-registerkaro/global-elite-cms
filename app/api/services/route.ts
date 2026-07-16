import prisma from "@/app/lib/config/db";
import { withMongoId, withMongoIds } from "@/app/lib/utils/serialize";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, PublishStatus } from "@prisma/client";

import { requireRole } from "@/app/lib/utils/authorization";
import { ADMIN_ROLES } from "@/app/lib/constants/role";
import { revalidateFrontendTags, serviceTags } from "@/app/lib/utils/revalidateFrontend";

export async function POST(req: NextRequest) {
  try {
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

    if (!body?.slug || !body?.content || typeof body.content !== "object") {
      return NextResponse.json(
        { message: "Missing required fields: slug and content are required" },
        { status: 400 }
      );
    }
    const slugExists = await prisma.servicePage.findUnique({
      where: { slug: body.slug },
    });

    if (slugExists) {
      return NextResponse.json(
        { message: "Slug already exists. Please use a unique slug." },
        { status: 409 }
      );
    }

    const service = await prisma.servicePage.create({
      data: {
        slug: body.slug,
        template: body.template ?? undefined,
        metaTitle: body.metaTitle ?? undefined,
        metaDescription: body.metaDescription ?? undefined,
        content: body.content as Prisma.InputJsonValue,
        status: (body.status ?? undefined) as PublishStatus | undefined,
        authorId,
      },
    });

    await revalidateFrontendTags(serviceTags(service.slug));

    const { authorId: serviceAuthorId, ...serviceRest } = service;

    return NextResponse.json(
      {
        message: "Service Added Successfully",
        data: withMongoId({ ...serviceRest, author: serviceAuthorId }),
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
    const rows = await prisma.servicePage.findMany({
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });

    const servicePages = withMongoIds(
      rows.map(({ authorId, ...rest }) => rest)
    );

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
