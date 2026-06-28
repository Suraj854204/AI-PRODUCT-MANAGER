import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        outputs: true,
        _count: {
          select: { userStories: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (err) {
    console.error("List projects error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, idea, industry, targetUsers } = body as {
      title?: string;
      idea?: string;
      industry?: string;
      targetUsers?: string;
    };

    if (!title?.trim() || !idea?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title and idea are required" },
        { status: 400 }
      );
    }

    const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.project.create({
        data: {
          userId: user.id,
          title: title.trim(),
          idea: idea.trim(),
          industry: industry?.trim() || null,
          targetUsers: targetUsers?.trim() || null,
          status: "PENDING",
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { projectCount: { increment: 1 } },
      });

      return created;
    });

    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error("Create project error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}
