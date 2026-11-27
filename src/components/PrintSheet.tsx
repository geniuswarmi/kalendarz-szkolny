"use client";

import {
  getSchoolYearMonths,
  parseSchoolYearName,
  getDaysInMonth,
  getFirstWeekday,
  WEEKDAY_NAMES_PL,
  dateInRange,
  formatDatePL,
  type CalendarEvent,
  type SchoolYear,
  type Category,
} from "@/lib/calendar-utils";

type Props = {
  year: SchoolYear;
  events: CalendarEvent[];
  categories: Category[];
};

function isDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

function getDateLabel(ev: CalendarEvent): string {
  if (!ev.endDate || ev.endDate === ev.startDate) {
    return formatDatePL(ev.startDate);
  }
  return `${formatDatePL(ev.startDate)}–${formatDatePL(ev.endDate)}`;
}

export function PrintSheet({ year, events, categories }: Props) {
  const startYear = parseSchoolYearName(year?.name);
  const months = getSchoolYearMonths(startYear);
  const safeEvents = Array.isArray(events) ? events : [];
  const sortedCats = Array.isArray(categories)
    ? [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];

  const freeDays = safeEvents.filter((e) =>
    e.categoryName.toLowerCase().includes("dni wolne od zajęć")
  );
  const startEndEvents = safeEvents.filter((e) =>
    e.categoryName.toLowerCase().includes("rozpoczęcie")
  );
  const councils = safeEvents.filter((e) =>
    e.categoryName.toLowerCase().includes("rada")
  );
  const internships = safeEvents.filter((e) =>
    e.categoryName.toLowerCase().includes("praktyki")
  );
  const parentMeetings = safeEvents.filter((e) =>
    e.categoryName.toLowerCase().includes("zebrania")
  );
  const consultations = safeEvents.filter((e) =>
    e.categoryName.toLowerCase().includes("konsultacje")
  );
  const exams = safeEvents.filter((e) =>
    e.categoryName.toLowerCase().includes("egzaminy")
  );

  const semesterBoundary = `${startYear + 1}-02-01`;
  const rightColumnEvents = safeEvents.filter((e) => {
    const c = e.categoryName.toLowerCase();
    return (
      !c.includes("ustawowo") &&
      !c.includes("rada") &&
      !c.includes("zebrania") &&
      !c.includes("konsultacje") &&
      !c.includes("praktyki") &&
      !c.includes("egzaminy")
    );
  });

  const firstSemester = rightColumnEvents.filter(
    (e) => e.startDate < semesterBoundary
  );
  const secondSemester = rightColumnEvents.filter(
    (e) => e.startDate >= semesterBoundary
  );

  const writtenExams = exams.filter((e) =>
    e.title.toLowerCase().includes("pisemna")
  );
  const practicalExams = exams.filter(
    (e) => !e.title.toLowerCase().includes("pisemna")
  );

  function countSchoolDays(y: number, m: number): number {
    const days = getDaysInMonth(y, m);
    let count = 0;
    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(y, m - 1, d);
      const wd = dateObj.getDay();
      if (wd === 0 || wd === 6) continue;

      const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayEvs = safeEvents.filter((e) =>
        dateInRange(dateStr, e.startDate, e.endDate)
      );
      const isOff = dayEvs.some((e) => {
        const c = e.categoryName.toLowerCase();
        return (
          c.includes("ustawowo") ||
          c.includes("dni wolne") ||
          e.title.toLowerCase().includes("wakac") ||
          e.title.toLowerCase().includes("ferie")
        );
      });
      if (!isOff) count++;
    }
    return count;
  }

  function getCellStyle(dayEvs: CalendarEvent[]): React.CSSProperties {
    if (dayEvs.length === 0) return {};
    const primary = dayEvs.at(0)!;
    const secondary = dayEvs.at(1);

    const style: React.CSSProperties = {
      backgroundColor: primary.categoryColor,
      color: isDark(primary.categoryColor) ? "#fff" : "#111827",
      fontWeight: 700,
    };

    if (secondary) {
      style.backgroundImage = `repeating-linear-gradient(
        135deg,
        ${primary.categoryColor},
        ${primary.categoryColor} 3px,
        ${secondary.categoryColor} 3px,
        ${secondary.categoryColor} 6px
      )`;
      style.color = "#111827";
      style.textShadow = "0 0 2px #fff, 0 0 2px #fff";
    } else if (primary.categoryPattern === "stripes") {
      style.backgroundImage = `repeating-linear-gradient(
        135deg,
        ${primary.categoryColor},
        ${primary.categoryColor} 3px,
        rgba(255,255,255,0.45) 3px,
        rgba(255,255,255,0.45) 6px
      )`;
    }
    return style;
  }

  const firstCouncil = councils.at(0);
  const firstInternship = internships.at(0);
  const firstMeeting = parentMeetings.at(0);
  const firstConsultation = consultations.at(0);
  const firstWritten = writtenExams.at(0);
  const firstPractical = practicalExams.at(0);

  return (
    <div className="hidden print:flex print:flex-col print:justify-between print-sheet w-full min-h-[188mm] text-gray-900 bg-white">
      {/* 1. NAGŁÓWEK WYDRUKU */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-300">
        <a
          href="https://www.zs4.oswiata.tychy.pl/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 no-underline text-inherit"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.zs4.oswiata.tychy.pl/photos/partners/thumbs/max1920x1920trifx3061ba683ed64baa_eduresized_Logo-ZS4-Tychy.png"
            alt="Logo ZS4 Tychy"
            className="h-14 w-14 object-contain shrink-0"
          />
        </a>
        <div className="flex-1 text-center pr-14">
          <a
            href="https://www.zs4.oswiata.tychy.pl/"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline text-inherit"
          >
            <div className="text-[15px] font-bold uppercase tracking-wide text-slate-800 leading-tight">
              Zespół Szkół nr 4 im. Janusza Groszkowskiego w Tychach
            </div>
          </a>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-600 mt-0.5">
            Kalendarz roku szkolnego {year?.name}
          </div>
        </div>
      </div>

      {/* 2. ŚRODEK: 12 MIESIĘCY (4x3) + PRAWA KOLUMNA */}
      <div className="grid grid-cols-12 gap-3 items-stretch my-2 flex-1">
        <div className="col-span-9 grid grid-cols-4 gap-x-2.5 gap-y-2">
          {months.map((m) => {
            const daysInMonth = getDaysInMonth(m.year, m.month);
            const firstWeekday = getFirstWeekday(m.year, m.month);
            const cells: (number | null)[] = [];
            for (let i = 0; i < firstWeekday; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);
            while (cells.length < 42) cells.push(null);

            const schoolDays = countSchoolDays(m.year, m.month);

            return (
              <div key={`${m.year}-${m.month}`} className="flex flex-col justify-between">
                <div className="border border-gray-300 rounded-sm overflow-hidden flex-1 flex flex-col">
                  <div className="bg-slate-800 text-white text-center font-semibold text-[9.5px] py-[2px]">
                    {m.name} {m.year}
                  </div>
                  <div className="grid grid-cols-7 bg-slate-100 text-slate-700 text-center text-[8px] font-semibold border-b border-gray-300">
                    {WEEKDAY_NAMES_PL.map((w) => (
                      <div key={w} className="border-r last:border-r-0 border-gray-200 py-[1px]">
                        {w}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 text-center text-[8.5px] flex-1">
                    {cells.map((day, idx) => {
                      const isWeekend = idx % 7 >= 5;
                      if (day === null) {
                        return (
                          <div
                            key={`e-${idx}`}
                            className={`min-h-[16px] border-r border-b border-gray-200 last:border-r-0 ${
                              isWeekend ? "bg-gray-100" : "bg-white"
                            }`}
                          />
                        );
                      }
                      const dateStr = `${m.year}-${String(m.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const dayEvs = safeEvents.filter((e) =>
                        dateInRange(dateStr, e.startDate, e.endDate)
                      );
                      const cellStyle = getCellStyle(dayEvs);

                      return (
                        <div
                          key={day}
                          style={cellStyle}
                          className={`min-h-[16px] flex items-center justify-center border-r border-b border-gray-200 leading-none ${
                            dayEvs.length === 0 && isWeekend
                              ? "bg-gray-100 text-gray-500 font-medium"
                              : "text-gray-800"
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center text-[7.5px] text-gray-600 font-medium mt-[2px]">
                  {schoolDays} dni szkolnych
                </div>
              </div>
            );
          })}
        </div>
        {/* Prawa kolumna */}
        <div className="col-span-3 text-[8px] leading-[1.3] flex flex-col justify-between bg-slate-50/60 border border-gray-200 rounded-sm p-2">
          <div className="space-y-1.5">
            {sortedCats.slice(0, 3).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-1.5 font-medium text-gray-800">
                  <span
                    className="w-3.5 h-2.5 border border-gray-400 rounded-[2px] shrink-0 inline-block"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </div>
                {cat.name.toLowerCase().includes("rozpoczęcie") && startEndEvents.length > 0 && (
                  <ul className="pl-5 list-disc text-[7.5px] text-gray-700 mt-0.5">
                    {startEndEvents.slice(0, 3).map((ev) => (
                      <li key={ev.id}>
                        {formatDatePL(ev.startDate)} – {ev.title.toLowerCase()}
                      </li>
                    ))}
                  </ul>
                )}
                {cat.name.toLowerCase().includes("dni wolne od zajęć") && freeDays.length > 0 && (
                  <ul className="pl-5 list-disc text-[7.5px] text-gray-700 mt-0.5">
                    {freeDays.slice(0, 6).map((ev) => (
                      <li key={ev.id}>
                        {getDateLabel(ev)} – {ev.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="font-bold uppercase text-[8.5px] text-slate-800 border-b border-gray-300 pb-[2px] mb-1">
              Pierwsze półrocze
            </div>
            <ul className="space-y-[2px] text-gray-700">
              {firstSemester.map((ev) => (
                <li key={ev.id}>
                  <span className="font-semibold text-gray-900">{getDateLabel(ev)}</span> – {ev.title}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold uppercase text-[8.5px] text-slate-800 border-b border-gray-300 pb-[2px] mb-1">
              Drugie półrocze
            </div>
            <ul className="space-y-[2px] text-gray-700">
              {secondSemester.map((ev) => (
                <li key={ev.id}>
                  <span className="font-semibold text-gray-900">{getDateLabel(ev)}</span> – {ev.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. DÓŁ STRONY: 4 KOLUMNY SZCZEGÓŁÓW */}
      <div className="grid grid-cols-12 gap-3 pt-2 border-t border-gray-300 text-[7.8px] leading-[1.3]">
        <div className="col-span-3 space-y-2">
          {firstCouncil && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
                <span
                  className="w-3.5 h-2.5 border border-gray-400 rounded-[2px] inline-block shrink-0"
                  style={{ backgroundColor: firstCouncil.categoryColor }}
                />
                <span>Rada klasyfikacyjna</span>
              </div>
              <ul className="space-y-[1.5px] text-gray-700">
                {councils.map((ev) => (
                  <li key={ev.id}>
                    <span className="font-semibold text-gray-900">{getDateLabel(ev)}</span> –{" "}
                    {ev.title.replace(/^rada klasyfikacyjna\s*[–-]\s*/i, "")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {firstInternship && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
                <span
                  className="w-3.5 h-2.5 border border-gray-400 rounded-[2px] inline-block shrink-0"
                  style={{
                    backgroundColor: firstInternship.categoryColor,
                    backgroundImage: `repeating-linear-gradient(135deg, ${firstInternship.categoryColor}, ${firstInternship.categoryColor} 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)`,
                  }}
                />
                <span>Praktyki zawodowe klasy:</span>
              </div>
              <ul className="space-y-[1.5px] text-gray-700">
                {internships.map((ev) => (
                  <li key={ev.id}>
                    {ev.title.replace(/^praktyki zawodowe\s*[–-]\s*/i, "")} ({getDateLabel(ev)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-2">
          {firstMeeting && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
                <span
                  className="w-3.5 h-2.5 border border-gray-400 rounded-[2px] inline-block shrink-0"
                  style={{ backgroundColor: firstMeeting.categoryColor }}
                />
                <span>Zebrania z rodzicami</span>
              </div>
              <ul className="space-y-[1.5px] text-gray-700">
                {parentMeetings.map((ev) => {
                  const groupMatch = ev.title.match(/\(([^)]+)\)/);
                  return (
                    <li key={ev.id} className="flex justify-between gap-1">
                      <span>
                        <span className="font-semibold text-gray-900">{formatDatePL(ev.startDate)}</span>{" "}
                        {groupMatch ? groupMatch.at(0) : ""}
                      </span>
                      <span>{ev.description || ""}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {firstConsultation && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
                <span
                  className="w-3.5 h-2.5 border border-gray-400 rounded-[2px] inline-block shrink-0"
                  style={{ backgroundColor: firstConsultation.categoryColor }}
                />
                <span>Konsultacje</span>
              </div>
              <ul className="space-y-[1.5px] text-gray-700">
                {consultations.map((ev) => {
                  const groupMatch = ev.title.match(/\(([^)]+)\)/);
                  return (
                    <li key={ev.id} className="flex justify-between gap-1">
                      <span>
                        <span className="font-semibold text-gray-900">{formatDatePL(ev.startDate)}</span>{" "}
                        {groupMatch ? groupMatch.at(0) : ""}
                      </span>
                      <span>{ev.description || ""}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="col-span-4 space-y-2">
          {firstWritten && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
                <span
                  className="w-3.5 h-2.5 border border-gray-400 rounded-[2px] inline-block shrink-0"
                  style={{ backgroundColor: firstWritten.categoryColor }}
                />
                <span>Egzaminy zawodowe – część pisemna</span>
              </div>
              <ul className="space-y-[1.5px] text-gray-700">
                {writtenExams.map((ev) => (
                  <li key={ev.id}>
                    <span className="font-semibold text-gray-900">{getDateLabel(ev)}</span> –{" "}
                    {ev.description || ev.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {firstPractical && (
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-0.5">
                <span
                  className="w-3.5 h-2.5 border border-gray-400 rounded-[2px] inline-block shrink-0"
                  style={{ backgroundColor: firstPractical.categoryColor }}
                />
                <span>Egzaminy zawodowe – część praktyczna</span>
              </div>
              <ul className="space-y-[1.5px] text-gray-700">
                {practicalExams.slice(0, 2).map((ev) => (
                  <li key={ev.id}>
                    <span className="font-semibold text-gray-900">{getDateLabel(ev)}</span> –{" "}
                    {ev.description || ev.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="col-span-3 space-y-1">
          {practicalExams.length > 2 && (
            <div>
              <div className="font-semibold text-slate-800 mb-0.5">
                Egzaminy zawodowe – sesja letnia
              </div>
              <ul className="space-y-[1.5px] text-gray-700">
                {practicalExams.slice(2).map((ev) => (
                  <li key={ev.id}>
                    <span className="font-semibold text-gray-900">{getDateLabel(ev)}</span> –{" "}
                    {ev.description || ev.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
