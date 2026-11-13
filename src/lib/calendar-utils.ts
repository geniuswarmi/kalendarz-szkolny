export const MONTH_NAMES_PL = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
];

export const WEEKDAY_NAMES_PL = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

export type CalendarEvent = {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryPattern: string | null;
};

export type SchoolYear = {
  id: number;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  description: string | null;
  pattern: string | null;
  sortOrder: number | null;
};

/** Get days in month (1-based month) */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Get weekday of first day of month (0=Mon ... 6=Sun) */
export function getFirstWeekday(year: number, month: number): number {
  const d = new Date(year, month - 1, 1);
  const day = d.getDay(); // 0=Sun
  return day === 0 ? 6 : day - 1;
}

/** Check if a date (YYYY-MM-DD) falls on or between start and end */
export function dateInRange(date: string, start: string, end: string | null): boolean {
  if (!end) return date === start;
  return date >= start && date <= end;
}

/** Get school year months in order (Sep -> Aug) */
export function getSchoolYearMonths(startYear: number): { year: number; month: number; name: string }[] {
  const months: { year: number; month: number; name: string }[] = [];
  // Sep-Dec of startYear
  for (let m = 9; m <= 12; m++) {
    months.push({ year: startYear, month: m, name: MONTH_NAMES_PL[m - 1] });
  }
  // Jan-Aug of startYear+1
  for (let m = 1; m <= 8; m++) {
    months.push({ year: startYear + 1, month: m, name: MONTH_NAMES_PL[m - 1] });
  }
  return months;
}

export function parseSchoolYearName(name: string): number {
  // "2026/2027" -> 2026
  const match = name.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

export function formatDatePL(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
