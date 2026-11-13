
"use client";

import {
  getDaysInMonth,
  getFirstWeekday,
  WEEKDAY_NAMES_PL,
  dateInRange,
  type CalendarEvent,
} from "@/lib/calendar-utils";

type Props = {
  year: number;
  month: number;
  name: string;
  events: CalendarEvent[];
  schoolDaysCount?: number;
};

export function MonthCalendar({
  year,
  month,
  name,
  events,
  schoolDaysCount,
}: Props) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function getEventsForDay(day: number): CalendarEvent[] {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) =>
      dateInRange(dateStr, e.startDate, e.endDate)
    );
  }

  function getDayStyle(
    dayEvents: CalendarEvent[]
  ): React.CSSProperties {
    if (dayEvents.length === 0) return {};

    const primary = dayEvents[0];

    const style: React.CSSProperties = {
      backgroundColor: primary.categoryColor,
      color: isDark(primary.categoryColor) ? "#fff" : "#111",
      fontWeight: 600,
    };

    if (primary.categoryPattern === "stripes") {
      style.backgroundImage = `repeating-linear-gradient(
        45deg,
        ${primary.categoryColor},
        ${primary.categoryColor} 4px,
        rgba(255,255,255,0.35) 4px,
        rgba(255,255,255,0.35) 8px
      )`;
    }

    return style;
  }

  function isDark(hex: string): boolean {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">

      {/* Nagłówek miesiąca */}
      <div className="bg-orange-600 text-white text-center py-1.5 font-semibold text-sm capitalize">
        {name} {year}
      </div>

      {/* Dni tygodnia */}
      <div className="grid grid-cols-7 calendar-weekdays-grid text-center text-xs font-medium bg-gray-100 border-b">
        {WEEKDAY_NAMES_PL.map((w) => (
          <div
            key={w}
            className="py-1 border-r last:border-r-0"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Dni miesiąca */}
      <div className="grid grid-cols-7 calendar-days-grid">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`e-${idx}`}
                className="calendar-day-cell h-8 border-r border-b border-gray-100 bg-gray-50"
              />
            );
          }

          const dayEvents = getEventsForDay(day);
          const style = getDayStyle(dayEvents);
          const title = dayEvents.map((e) => e.title).join(", ");

          return (
            <div
              key={day}
              className="h-8 border-r border-b border-gray-100 flex items-center justify-center text-xs relative group cursor-default calendar-day-cell"
              style={style}
              title={title || undefined}
            >
              {day}

              {dayEvents.length > 1 && (
                <span className="absolute top-0 right-0 text-[9px] leading-none bg-black/50 text-white rounded-bl px-0.5">
                  {dayEvents.length}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Liczba dni szkolnych */}
      {schoolDaysCount !== undefined && (
        <div className="text-center text-xs text-gray-600 py-1 bg-gray-50 border-t">
          {schoolDaysCount} dni szkolnych
        </div>
      )}
    </div>
  );
}
