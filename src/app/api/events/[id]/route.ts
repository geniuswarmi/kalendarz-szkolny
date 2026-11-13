import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = session.user as { role?: string };
  if (user.role !== "admin") return null;
  return session;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, startDate, endDate, categoryId, schoolYearId, allDay } = body;

    if (!title || !startDate || !categoryId || !schoolYearId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [updated] = db
      .update(events)
      .set({
        title,
        description: description || null,
        startDate,
        endDate: endDate || null,
        categoryId: Number(categoryId),
        schoolYearId: Number(schoolYearId),
        allDay: allDay ?? true,
        updatedAt: new Date(),
      })
      .where(eq(events.id, parseInt(id, 10)))
      .returning()
      .all();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    db.delete(events).where(eq(events.id, eventId)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}