import { NextResponse } from "next/server";
import { db } from "@/db";
import { schoolYears } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let years;
    if (activeOnly) {
      years = db
        .select()
        .from(schoolYears)
        .where(eq(schoolYears.isActive, true))
        .all();
    } else {
      years = db
        .select()
        .from(schoolYears)
        .orderBy(desc(schoolYears.name))
        .all();
    }

    return NextResponse.json(years);
  } catch (error) {
    console.error("Error fetching school years:", error);
    return NextResponse.json({ error: "Failed to fetch school years" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, startDate, endDate, isActive } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isActive) {
      db.update(schoolYears).set({ isActive: false }).run();
    }

    const [created] = db
      .insert(schoolYears)
      .values({
        name,
        startDate,
        endDate,
        isActive: !!isActive,
      })
      .returning()
      .all();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating school year:", error);
    return NextResponse.json({ error: "Failed to create school year" }, { status: 500 });
  }
}