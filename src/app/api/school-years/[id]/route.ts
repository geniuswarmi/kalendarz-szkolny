import { NextResponse } from "next/server";
import { db } from "@/db";
import { schoolYears } from "@/db/schema";
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
    const { name, startDate, endDate, isActive } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isActive) {
      db.update(schoolYears).set({ isActive: false }).run();
    }

    const [updated] = db
      .update(schoolYears)
      .set({
        name,
        startDate,
        endDate,
        isActive: !!isActive,
        updatedAt: new Date(),
      })
      .where(eq(schoolYears.id, parseInt(id, 10)))
      .returning()
      .all();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating school year:", error);
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
    const yearId = parseInt(id, 10);

    if (Number.isNaN(yearId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    db.delete(schoolYears).where(eq(schoolYears.id, yearId)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting school year:", error);
    return NextResponse.json(
      { error: "Nie można usunąć roku (może mieć powiązane wydarzenia)" },
      { status: 500 }
    );
  }
}