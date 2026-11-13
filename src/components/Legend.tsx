
"use client";

import type { Category } from "@/lib/calendar-utils";

type Props = {
  categories: Category[];
};

export function Legend({ categories }: Props) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm print:shadow-none print:border-gray-400 print:p-2">
      <h3 className="font-semibold text-sm mb-3 text-gray-800 print:text-[8px] print:mb-1">
        Legenda
      </h3>

      <ul className="space-y-2 print:space-y-0 print:flex print:flex-row print:flex-wrap print:items-center print:gap-x-3 print:gap-y-1">
        {categories
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-2 text-sm print:inline-flex print:gap-1 print:text-[7px] print:whitespace-nowrap"
            >
              <span
                className="w-5 h-5 rounded border border-gray-300 shrink-0 print:w-2.5 print:h-2.5"
                style={{
                  backgroundColor: cat.color,
                  backgroundImage:
                    cat.pattern === "stripes"
                      ? `repeating-linear-gradient(45deg, ${cat.color}, ${cat.color} 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 6px)`
                      : undefined,
                }}
              />
              <span className="text-gray-700">{cat.name}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}