import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        outputs: true,
        userStories: true,
        roadmap: true,
        competitors: true,
        personas: true,
        risks: true,
      },
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error("Get project error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load project" },
      { status: 500 }
    );
  }
}
