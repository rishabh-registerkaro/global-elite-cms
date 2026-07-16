import prisma from "@/app/lib/config/db";
import { withMongoId } from "@/app/lib/utils/serialize";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { requireRole } from "@/app/lib/utils/authorization";
import { CONTENT_ROLES } from "@/app/lib/constants/role";

// small merging requred
// CORS headers helper
const getCorsHeaders = (origin: string | null) => {
  const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://global-elite-cms-coral.vercel.app';

  // Normalize URLs (remove trailing slashes for comparison)
  const normalizeUrl = (url: string) => url.replace(/\/$/, '');
  const normalizedProductionUrl = normalizeUrl(PRODUCTION_URL);
  const normalizedOrigin = origin ? normalizeUrl(origin) : null;

  // Check if origin matches production URL (with or without trailing slash)
  if (normalizedOrigin === normalizedProductionUrl) {
    return {
      'Access-Control-Allow-Origin': origin || PRODUCTION_URL,
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }

  // Check if origin is localhost with any port
  if (origin && origin.startsWith('http://localhost:')) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  }

  // Default: always allow production URL (for cases where origin might be null or different)
  return {
    'Access-Control-Allow-Origin': PRODUCTION_URL,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
};

// Nullable Json columns need Prisma.JsonNull instead of plain null
const jsonValue = (v: unknown) =>
  v === null ? Prisma.JsonNull : (v as Prisma.InputJsonValue);

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user - only admin/editor can access
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult; // Return error response if authentication fails
    }

    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to perform changes",
        },
        { status: 401 }
      );
    }

    const existing = await prisma.aboutPage.findFirst();
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "About page already exists. Use PATCH to edit.",
        },
        { status: 409 }
      );
    }
    const body = await req.json();
    const aboutPage = await prisma.aboutPage.create({
      data: {
        metaTitle: body.metaTitle ?? undefined,
        metaDescription: body.metaDescription ?? undefined,
        heroSection: (body.heroSection ?? undefined) as Prisma.InputJsonValue | undefined,
        aboutSection: (body.aboutSection ?? undefined) as Prisma.InputJsonValue | undefined,
        approachSection: (body.approachSection ?? undefined) as Prisma.InputJsonValue | undefined,
        teamSection: (body.teamSection ?? undefined) as Prisma.InputJsonValue | undefined,
        foundersNoteSection: (body.foundersNoteSection ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "About page created successfully",
        data: withMongoId(aboutPage),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating About page:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error-Failed To Create the About us page",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const aboutPage = await prisma.aboutPage.findFirst();

    if (!aboutPage) {
      return NextResponse.json(
        {
          success: false,
          message: "About page not found",
        },
        { status: 404, headers: getCorsHeaders(origin) }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: withMongoId(aboutPage),
      },
      { status: 200, headers: getCorsHeaders(origin) }
    );
  } catch (error: any) {
    console.error("Error fetching About page:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch About page",
        error: error.message || String(error),
      },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {

    // Authenticate user - only admin/editor can access
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult; // Return error response if authentication fails
    }

    const userId = userResult.id;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login to perform changes",
        },
        { status: 401 }
      );
    }

    const existingAboutPage = await prisma.aboutPage.findFirst();

    if (!existingAboutPage) {
      return NextResponse.json(
        {
          success: false,
          message: "About page not found. Create one first using POST.",
        },
        { status: 404 }
      );
    }

    const updateData = await req.json();

    const data: Prisma.AboutPageUpdateInput = {};
    if (updateData.metaTitle !== undefined) data.metaTitle = updateData.metaTitle;
    if (updateData.metaDescription !== undefined) data.metaDescription = updateData.metaDescription;
    if (updateData.heroSection !== undefined) data.heroSection = jsonValue(updateData.heroSection);
    if (updateData.aboutSection !== undefined) data.aboutSection = jsonValue(updateData.aboutSection);
    if (updateData.approachSection !== undefined) data.approachSection = jsonValue(updateData.approachSection);
    if (updateData.teamSection !== undefined) data.teamSection = jsonValue(updateData.teamSection);
    if (updateData.foundersNoteSection !== undefined) data.foundersNoteSection = jsonValue(updateData.foundersNoteSection);

    const updatedAboutPage = await prisma.aboutPage.update({
      where: { id: existingAboutPage.id },
      data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "About page updated successfully",
        data: withMongoId(updatedAboutPage),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating About page:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Failed to update About page",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}
