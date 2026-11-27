"use client";

import { MonthCalendar } from "./MonthCalendar";
import { Legend } from "./Legend";
import { PrintSheet } from "./PrintSheet";

import {
  getSchoolYearMonths,
  parseSchoolYearName,
  type CalendarEvent,
  type SchoolYear,
  type Category,
} from "@/lib/calendar-utils";

type Props = {
  year: SchoolYear;
  events: CalendarEvent[];
  categories: Category[];
};

export function CalendarView({ year, events, categories }: Props) {
  const startYear = parseSchoolYearName(year?.name);
  const months = getSchoolYearMonths(startYear);
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <>
      <div className="calendar-layout flex flex-col lg:flex-row gap-6 print:hidden">
        <div className="flex-1 min-w-0">
          <div className="print-calendar-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {months.map((m) => (
              <div key={`${m.year}-${m.month}`} className="print-month">
                <MonthCalendar
                  year={m.year}
                  month={m.month}
                  name={m.name}
                  events={safeEvents}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Ważne terminy</h3>
            <ul className="space-y-2 max-h-96 overflow-y-auto text-sm">
              {safeEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-2 border-b border-gray-100 pb-2"
                >
                  <span
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: e.categoryColor }}
                  />
                  <div>
                    <span className="font-medium">{e.title}</span>
                    <span className="text-gray-500 ml-2">
                      {e.startDate}
                      {e.endDate && e.endDate !== e.startDate
                        ? ` – ${e.endDate}`
                        : ""}
                    </span>
                    {e.description && (
                      <p className="text-gray-600 text-xs mt-0.5">
                        {e.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="calendar-legend print-legend lg:w-64 shrink-0">
          <Legend categories={categories} />
        </aside>
      </div>

      <PrintSheet year={year} events={safeEvents} categories={categories} />
    </>
  );
}
