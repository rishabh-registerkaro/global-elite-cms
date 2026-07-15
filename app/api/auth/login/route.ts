import { connectDB } from "@/app/lib/config/db";
import User from "@/app/lib/models/user";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, username, password } = await req.json();

    if (!password || (!email && !username)) {
      return NextResponse.json(
        {
          message:
            "Please provide either email or username along with password",
        },
        { status: 400 }
      );
    }
    const user = await User.findOne(email ? { email } : { username }).select(
      "+password"
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: " Invalid Credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successfull",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    response.cookies.set("loggedIn", "true");

    return response;

    
  } catch (error) {
    console.log("Error message", error)
    return NextResponse.json(
        { message: " Internal Server Error-Login Api failed"},
        { status: 500 }
    )
  }
}
