import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  createToken,
  AUTH_COOKIE_NAME,
  authCookieOptions,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createToken(user.id);

    const { password: _pw, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong logging you in" },
      { status: 500 }
    );
  }
}
