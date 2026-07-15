import { connectDB } from "@/app/lib/config/db";
import FooterMenu from "@/app/lib/models/footerMenu";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/utils/getCurrentUser";

import { requireRole } from "@/app/lib/utils/authorization";
import { CONTENT_ROLES } from "@/app/lib/constants/role";

const getCorsHeaders = (origin: string | null) => {
  const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://magdee-coral.vercel.app';
  
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

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req.headers.get('origin')) });
}

// GET - Fetch footer menu (singleton - only one document)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the footer menu (there should only be one)
    let footerMenu = await FooterMenu.findOne();
    
    // If no menu exists, create an empty one
    if (!footerMenu) {
      footerMenu = await FooterMenu.create({ main_menu: [], contact_details: [] });
    }
    
    return NextResponse.json(
      {
        success: true,
        footerMenu: footerMenu,
      },
      { status: 200, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  } catch (error) {
    console.error("Error fetching footer menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Fetching footer menu",
        error: error,
      },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  }
}

// POST/PUT - Create or update footer menu (singleton pattern)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate user
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    
    const body = await req.json();
    const { main_menu, contact_details } = body;
    
    // Validate main_menu structure (optional, can be undefined)
    if (main_menu !== undefined && !Array.isArray(main_menu)) {
      return NextResponse.json(
        {
          success: false,
          message: "main_menu must be an array",
        },
        { status: 400, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }
    
    // Validate contact_details structure (optional, can be undefined)
    if (contact_details !== undefined && !Array.isArray(contact_details)) {
      return NextResponse.json(
        {
          success: false,
          message: "contact_details must be an array",
        },
        { status: 400, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }
    
    // Check if footer menu already exists
    let footerMenu = await FooterMenu.findOne();
    
    if (footerMenu) {
      // Update existing - use findByIdAndUpdate to bypass validation issues
      const updateData: any = {};
      if (main_menu !== undefined) updateData.main_menu = main_menu;
      if (contact_details !== undefined) updateData.contact_details = contact_details;
      
      footerMenu = await FooterMenu.findByIdAndUpdate(
        footerMenu._id,
        updateData,
        { new: true, runValidators: false, overwrite: false }
      );
      
      return NextResponse.json(
        {
          success: true,
          message: "Footer menu updated successfully",
          footerMenu: footerMenu,
        },
        { status: 200, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    } else {
      // Create new - direct assignment
      const createData: any = {};
      if (main_menu !== undefined) createData.main_menu = main_menu;
      else createData.main_menu = [];
      if (contact_details !== undefined) createData.contact_details = contact_details;
      else createData.contact_details = [];
      
      footerMenu = await FooterMenu.create(createData);
      
      return NextResponse.json(
        {
          success: true,
          message: "Footer menu created successfully",
          footerMenu: footerMenu,
        },
        { status: 201, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }
  } catch (error) {
    console.error("Error saving footer menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Saving footer menu",
        error: error,
      },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  }
}

// PUT - Update footer menu
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate user
    const userResult = await requireRole(req, CONTENT_ROLES);
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    
    const body = await req.json();
    const { main_menu, contact_details } = body;
    
    // Validate main_menu structure (optional, can be undefined)
    if (main_menu !== undefined && !Array.isArray(main_menu)) {
      return NextResponse.json(
        {
          success: false,
          message: "main_menu must be an array",
        },
        { status: 400, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }
    
    // Validate contact_details structure (optional, can be undefined)
    if (contact_details !== undefined && !Array.isArray(contact_details)) {
      return NextResponse.json(
        {
          success: false,
          message: "contact_details must be an array",
        },
        { status: 400, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }
    
    // Find and update footer menu
    let footerMenu = await FooterMenu.findOne();
    
    if (!footerMenu) {
      // Create if doesn't exist
      const createData: any = {};
      if (main_menu !== undefined) createData.main_menu = main_menu;
      else createData.main_menu = [];
      if (contact_details !== undefined) createData.contact_details = contact_details;
      else createData.contact_details = [];
      
      footerMenu = await FooterMenu.create(createData);
      
      return NextResponse.json(
        {
          success: true,
          message: "Footer menu created successfully",
          footerMenu: footerMenu,
        },
        { status: 201, headers: getCorsHeaders(req.headers.get('origin')) }
      );
    }
    
    // Update existing - use findByIdAndUpdate with runValidators: false to bypass nested validation
    const updateData: any = {};
    if (main_menu !== undefined) updateData.main_menu = main_menu;
    if (contact_details !== undefined) updateData.contact_details = contact_details;
    
    footerMenu = await FooterMenu.findByIdAndUpdate(
      footerMenu._id,
      updateData,
      { new: true, runValidators: false } // Disable validators for Mixed type
    );
    
    return NextResponse.json(
      {
        success: true,
        message: "Footer menu updated successfully",
        footerMenu: footerMenu,
      },
      { status: 200, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  } catch (error) {
    console.error("Error updating footer menu:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error - Updating footer menu",
        error: error,
      },
      { status: 500, headers: getCorsHeaders(req.headers.get('origin')) }
    );
  }
}