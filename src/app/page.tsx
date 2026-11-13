import { db } from "@/db";
import { schoolYears, events, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { CalendarView } from "@/components/CalendarView";
import { PrintButton } from "@/components/PrintButton";
import Link from "next/link";

async function getActiveYearData() {
  try {
    const activeYear = db
      .select()
      .from(schoolYears)
      .where(eq(schoolYears.isActive, true))
      .get();

    if (!activeYear) {
      return { year: null, events: [], categories: [] };
    }

    const yearEvents = db
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

    const cats = db
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

export default async function HomePage() {
  const { year, events: yearEvents, categories: cats } =
    await getActiveYearData();

  return (
    <div className="min-h-screen text-gray-900">
      {/* górny pasek */}
      <div className="bg-[#3f3b3a] text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="font-medium tracking-wide">
            Kalendarz Roku Szkolnego{" "}
            <span>{year?.name ?? "—"}</span>
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://www.zs4.oswiata.tychy.pl/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f0c0c0] transition"
            >
              Strona szkoły
            </a>
            <Link href="/admin" className="hover:text-[#f0c0c0] transition">
              Panel admina
            </Link>
          </div>
        </div>
      </div>

      {/* nagłówek */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* lewa strona – logo + nazwa */}
          <div className="flex items-center gap-4 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.zs4.oswiata.tychy.pl/photos/partners/thumbs/max1920x1920trifx3061ba683ed64baa_eduresized_Logo-ZS4-Tychy.png"
              alt="Logo ZS4 Tychy"
              className="h-16 w-16 object-contain shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#3f3b3a] leading-tight">
                Zespół Szkół nr 4 im. Janusza Groszkowskiego
              </h1>
              <p className="text-sm text-[#82000a] font-medium">w Tychach</p>
            </div>
          </div>

          {/* prawa strona – drukuj */}
          <div className="shrink-0 print:hidden">
            <PrintButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
      </main>

      <footer className="bg-[#3f3b3a] text-gray-300 text-center text-xs py-5 mt-8">
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