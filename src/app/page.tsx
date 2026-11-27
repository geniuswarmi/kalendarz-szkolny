import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/db";
import { schoolYears, events, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { CalendarView } from "@/components/CalendarView";
import { SiteHeader } from "@/components/SiteHeader";

async function getActiveYearData() {
  await connection();
  try {
    const activeYear = await db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .get();

    if (!activeYear) {
      return { year: null, events: [], categories: [] };
    }

    const yearEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        categoryId: events.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryPattern: categories.pattern,
      })
      .from(events)
      .innerJoin(categories, eq(events.categoryId, categories.id))
      .where(eq(events.schoolYearId, activeYear.id))
      .orderBy(asc(events.startDate))
      .all();

    const cats = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder))
      .all();

    return { year: activeYear, events: yearEvents, categories: cats };
  } catch (e) {
    console.error(e);
    return { year: null, events: [], categories: [] };
  }
}

async function CalendarContent() {
  const { year, events: yearEvents, categories: cats } =
    await getActiveYearData();

  return (
    <>
      {!year && (
        <p className="mb-6 text-center text-[#82000a] bg-red-50 border border-red-100 px-4 py-3 rounded-lg text-sm">
          Brak aktywnego roku szkolnego.
        </p>
      )}

      {year && (
        <CalendarView
          year={year}
          events={yearEvents}
          categories={cats}
        />
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen text-gray-900">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <Suspense
          fallback={
            <div className="text-center py-12 text-gray-500">
              Ładowanie kalendarza...
            </div>
          }
        >
          <CalendarContent />
        </Suspense>
      </main>

      <footer className="bg-[#3f3b3a] text-gray-300 text-center text-xs py-5 px-3 mt-8">
        ZS nr 4 im. J. Groszkowskiego · Tychy ·{" "}
        <a
          href="https://www.zs4.oswiata.tychy.pl/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          zs4.oswiata.tychy.pl
        </a>
      </footer>
    </div>
  );
}
