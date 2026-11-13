import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, color, description, pattern, sortOrder } = body;

    if (!name || !color) {
      return NextResponse.json({ error: "Name and color required" }, { status: 400 });
    }

    const [updated] = db
      .update(categories)
      .set({
        name,
        color,
        description: description || null,
        pattern: pattern || null,
        sortOrder: sortOrder ?? 0,
      })
      .where(eq(categories.id, parseInt(id, 10)))
      .returning()
      .all();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (Number.isNaN(categoryId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    db.delete(categories).where(eq(categories.id, categoryId)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Nie można usunąć kategorii (może być używana przez wydarzenia)" },
      { status: 500 }
    );
  }
}