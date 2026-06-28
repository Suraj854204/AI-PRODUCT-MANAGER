import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { password: _pw, ...userWithoutPassword } = user;

  return NextResponse.json({ success: true, data: userWithoutPassword });
}
