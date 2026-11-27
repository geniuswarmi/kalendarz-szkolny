"use client";

import { useState } from "react";
import Link from "next/link";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Górny pasek z menu hamburger na telefonie */}
      <div className="bg-[#3f3b3a] text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="font-medium text-sm sm:text-base tracking-wide truncate">
            Kalendarz Roku Szkolnego
          </span>

          {/* Linki na komputer / tablet */}
          <div className="hidden sm:flex items-center gap-5 text-sm">
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

          {/* Przycisk hamburgera na telefon */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Otwórz menu"
            aria-expanded={menuOpen}
            className="sm:hidden p-1.5 -mr-1.5 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Rozwijane menu mobilne */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/15 bg-[#353130] px-4 py-2 flex flex-col divide-y divide-white/10 text-sm">
            <a
              href="https://www.zs4.oswiata.tychy.pl/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 hover:text-[#f0c0c0] transition"
            >
              Strona szkoły
            </a>
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 hover:text-[#f0c0c0] transition"
            >
              Panel admina
            </Link>
          </div>
        )}
      </div>

      {/* Nagłówek szkoły dopasowany do wąskich ekranów */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.zs4.oswiata.tychy.pl/photos/partners/thumbs/max1920x1920trifx3061ba683ed64baa_eduresized_Logo-ZS4-Tychy.png"
              alt="Logo ZS4 Tychy"
              className="h-11 w-11 sm:h-16 sm:w-16 object-contain shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-xl font-bold text-[#3f3b3a] leading-snug break-words">
                Zespół Szkół nr 4 im. Janusza Groszkowskiego
              </h1>
              <p className="text-xs sm:text-sm text-[#82000a] font-medium mt-0.5">
                w Tychach
              </p>
            </div>
          </div>

          {/* Przycisk drukowania - tylko znaczek */}
          <button
            type="button"
            onClick={() => window.print()}
            title="Drukuj / Zapisz jako PDF"
            aria-label="Drukuj kalendarz"
            className="shrink-0 print:hidden p-2.5 rounded-lg border border-gray-300 bg-white text-[#3f3b3a] hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
