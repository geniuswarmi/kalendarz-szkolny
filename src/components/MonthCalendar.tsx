"use client";

import { useState, useEffect } from "react";
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
  const [activeDay, setActiveDay] = useState<number | null>(null);

  // Zamknij dymek po dotknięciu dowolnego innego miejsca na ekranie (ważne na telefonie)
  useEffect(() => {
    if (activeDay === null) return;
    const handleOutsideClick = () => setActiveDay(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [activeDay]);

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

  function getDayStyle(dayEvents: CalendarEvent[]): React.CSSProperties {
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
    // Zmiana overflow-hidden na overflow-visible pozwala dymkowi wystawać poza ramkę miesiąca
    <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
      {/* Nagłówek miesiąca */}
      <div className="bg-orange-600 text-white text-center py-1.5 font-semibold text-sm capitalize rounded-t-lg">
        {name} {year}
      </div>

      {/* Dni tygodnia */}
      <div className="grid grid-cols-7 calendar-weekdays-grid text-center text-xs font-medium bg-gray-100 border-b">
        {WEEKDAY_NAMES_PL.map((w) => (
          <div key={w} className="py-1 border-r last:border-r-0">
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
          const hasEvents = dayEvents.length > 0;
          const isOpen = activeDay === day && hasEvents;
          const style = getDayStyle(dayEvents);
          const colIndex = idx % 7; // 0 = Pn ... 6 = Nd

          // Wyrównanie dymka, aby nie ucinało go na lewej/prawej krawędzi ekranu telefonu
          const alignClass =
            colIndex <= 1
              ? "left-0"
              : colIndex >= 5
                ? "right-0"
                : "left-1/2 -translate-x-1/2";

          return (
            <div
              key={day}
              onMouseEnter={() => hasEvents && setActiveDay(day)}
              onMouseLeave={() => setActiveDay(null)}
              onClick={(e) => {
                if (!hasEvents) return;
                e.stopPropagation();
                setActiveDay((prev) => (prev === day ? null : day));
              }}
              className={`h-8 border-r border-b border-gray-100 flex items-center justify-center text-xs relative select-none calendar-day-cell ${
                hasEvents ? "cursor-pointer" : "cursor-default"
              }`}
              style={style}
            >
              {day}

              {dayEvents.length > 1 && (
                <span className="absolute top-0 right-0 text-[9px] leading-none bg-black/60 text-white rounded-bl px-0.5">
                  {dayEvents.length}
                </span>
              )}

              {/* Szybki dymek (tooltip) dla komputera i telefonu */}
              {isOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute bottom-full mb-1.5 z-50 w-56 max-w-[80vw] bg-gray-900/95 text-white text-left rounded-lg shadow-xl p-2.5 pointer-events-auto print:hidden ${alignClass}`}
                >
                  <div className="text-[11px] font-semibold text-gray-300 border-b border-gray-700 pb-1 mb-1.5">
                    {day} {name} {year}
                  </div>
                  <ul className="space-y-1.5">
                    {dayEvents.map((ev) => (
                      <li key={ev.id} className="flex items-start gap-2 text-xs leading-snug">
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 border border-white/30"
                          style={{ backgroundColor: ev.categoryColor }}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-white break-words">
                            {ev.title}
                          </div>
                          {ev.description && (
                            <div className="text-[10px] text-gray-300">
                              {ev.description}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Liczba dni szkolnych */}
      {schoolDaysCount !== undefined && (
        <div className="text-center text-xs text-gray-600 py-1 bg-gray-50 border-t rounded-b-lg">
          {schoolDaysCount} dni szkolnych
        </div>
      )}
    </div>
  );
}
