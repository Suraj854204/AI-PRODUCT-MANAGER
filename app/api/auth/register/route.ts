import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  createToken,
  AUTH_COOKIE_NAME,
  authCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name: name?.trim() || null,
      },
    });

    const token = await createToken(user.id);

    const { password: _pw, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong creating your account" },
      { status: 500 }
    );
  }
}
