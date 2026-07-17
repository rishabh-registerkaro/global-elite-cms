import prisma from "@/app/lib/config/db";
import { withMongoId } from "@/app/lib/utils/serialize";
import { Prisma, HeaderMenu } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { requireRole } from "@/app/lib/utils/authorization";
import { CONTENT_ROLES } from "@/app/lib/constants/role";

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
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
      };
  }

  // Check if origin is localhost with any port
  if (origin && origin.startsWith('http://localhost:')) {
      return {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
      };
  }

  // Default: always allow production URL (for cases where origin might be null or different)
  return {
      'Access-Control-Allow-Origin': PRODUCTION_URL,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
  };
};

// API contract keeps the Mongo-era snake_case field name `main_menu`
// (Prisma field is `mainMenu`).
const serializeHeaderMenu = (menu: HeaderMenu) => {
  const { mainMenu, ...rest } = menu;
  return withMongoId({ ...rest, main_menu: mainMenu });
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req.headers.get('origin')) });
}

// GET - Fetch header menu (singleton - only one document)
export async function GET(req: NextRequest) {
  try {
    // Get the header menu (there should only be one)
    let headerMenu = await prisma.headerMenu.findFirst();

    // If no menu exists, create an empty one
    if (!headerMenu) {
      headerMenu = await prisma.headerMenu.create({
        data: { mainMenu: [] as Prisma.InputJsonValue },
      });
    }

    return NextResponse.json(
      {
        success: true,
        headerMenu: serializeHeaderMenu(headerMenu),
      },
      { status: 200, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  } catch (error) {
    console.error("Error fetching header menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Fetching header menu",
        error: error,
      },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  }
}

// POST/PUT - Create or update header menu (singleton pattern)
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }

    const body = await req.json();
    const { main_menu } = body;

    // Validate main_menu structure
    if (!Array.isArray(main_menu)) {
      return NextResponse.json(
        {
          success: false,
          message: "main_menu must be an array",
        },
        { status: 400, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }

    // Check if header menu already exists
    let headerMenu = await prisma.headerMenu.findFirst();

    if (headerMenu) {
      // Update existing
      headerMenu = await prisma.headerMenu.update({
        where: { id: headerMenu.id },
        data: { mainMenu: main_menu as Prisma.InputJsonValue },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Header menu updated successfully",
          headerMenu: serializeHeaderMenu(headerMenu),
        },
        { status: 200, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    } else {
      // Create new - direct assignment
      headerMenu = await prisma.headerMenu.create({
        data: { mainMenu: main_menu as Prisma.InputJsonValue },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Header menu created successfully",
          headerMenu: serializeHeaderMenu(headerMenu),
        },
        { status: 201, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }
  } catch (error) {
    console.error("Error saving header menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Saving header menu",
        error: error,
      },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  }
}

// PUT - Update header menu
export async function PUT(req: NextRequest) {
  try {
    // Authenticate user
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }

    const body = await req.json();
    const { main_menu } = body;

    // Validate main_menu structure
    if (!Array.isArray(main_menu)) {
      return NextResponse.json(
        {
          success: false,
          message: "main_menu must be an array",
        },
        { status: 400, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }

    // Find and update header menu
    let headerMenu = await prisma.headerMenu.findFirst();

    if (!headerMenu) {
      // Create if doesn't exist
      headerMenu = await prisma.headerMenu.create({
        data: { mainMenu: main_menu as Prisma.InputJsonValue },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Header menu created successfully",
          headerMenu: serializeHeaderMenu(headerMenu),
        },
        { status: 201, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }

    // Update existing
    headerMenu = await prisma.headerMenu.update({
      where: { id: headerMenu.id },
      data: { mainMenu: main_menu as Prisma.InputJsonValue },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Header menu updated successfully",
        headerMenu: serializeHeaderMenu(headerMenu),
      },
      { status: 200, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  } catch (error) {
    console.error("Error updating header menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Updating header menu",
        error: error,
      },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  }
}
