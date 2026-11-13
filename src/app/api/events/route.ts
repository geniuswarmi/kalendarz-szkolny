import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolYearId = searchParams.get("schoolYearId");
    const categoryId = searchParams.get("categoryId");

    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        categoryId: events.categoryId,
        schoolYearId: events.schoolYearId,
        allDay: events.allDay,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryPattern: categories.pattern,
      })
      .from(events)
      .innerJoin(categories, eq(events.categoryId, categories.id))
      .$dynamic();

    const conditions = [];
    if (schoolYearId) {
      conditions.push(eq(events.schoolYearId, parseInt(schoolYearId, 10)));
    }
    if (categoryId) {
      conditions.push(eq(events.categoryId, parseInt(categoryId, 10)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = query.orderBy(events.startDate).all();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, categoryId, schoolYearId, allDay } = body;

    if (!title || !startDate || !categoryId || !schoolYearId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [created] = db
      .insert(events)
      .values({
        title,
        description: description || null,
        startDate,
        endDate: endDate || null,
        categoryId: Number(categoryId),
        schoolYearId: Number(schoolYearId),
        allDay: allDay ?? true,
      })
      .returning()
      .all();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}