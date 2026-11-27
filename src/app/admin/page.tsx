"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ events: 0, years: 0, categories: 0 });
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function load() {
      try {
        const [e, y, c] = await Promise.all([
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/school-years").then((r) => r.json()),
          fetch("/api/categories").then((r) => r.json()),
        ]);
        setStats({
          events: Array.isArray(e) ? e.length : 0,
          years: Array.isArray(y) ? y.length : 0,
          categories: Array.isArray(c) ? c.length : 0,
        });
      } catch {}
    }
    if (session) load();
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <p className="text-gray-500">Ładowanie...</p>
      </div>
    );
  }

  const btnCard =
    "flex flex-col justify-between min-h-[110px] rounded-xl p-5 text-left " +
    "bg-white text-[#3f3b3a] shadow-sm border-2 border-[#3f3b3a] " +
    "hover:bg-[#3f3b3a] hover:text-white hover:shadow-md active:scale-[0.98] " +
    "transition-all duration-150 cursor-pointer";

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-[#3f3b3a] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-lg">Panel administratora</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{session.user.email}</span>
            <button
              onClick={() => setLogoutOpen(true)}
              className="text-sm px-4 py-1.5 rounded-lg bg-[#82000a] text-white font-medium hover:bg-[#6a0008] active:scale-95 transition"
            >
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-3xl font-bold text-[#3f3b3a]">{stats.events}</p>
            <p className="text-gray-600 text-sm">Wydarzenia</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-3xl font-bold text-[#3f3b3a]">{stats.years}</p>
            <p className="text-gray-600 text-sm">Lata szkolne</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <p className="text-3xl font-bold text-[#3f3b3a]">{stats.categories}</p>
            <p className="text-gray-600 text-sm">Kategorie</p>
          </div>
        </div>

        <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Zarządzanie
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <Link href="/admin/events" className={btnCard}>
            <span className="font-semibold text-lg">Wydarzenia →</span>
            <span className="text-sm opacity-70 mt-2">
              Dodawaj, edytuj i usuwaj wydarzenia
            </span>
          </Link>
          <Link href="/admin/years" className={btnCard}>
            <span className="font-semibold text-lg">Lata szkolne →</span>
            <span className="text-sm opacity-70 mt-2">
              Zarządzaj latami i aktywny rok
            </span>
          </Link>
          <Link href="/admin/categories" className={btnCard}>
            <span className="font-semibold text-lg">Kategorie →</span>
            <span className="text-sm opacity-70 mt-2">
              Kolory i oznaczenia w kalendarzu
            </span>
          </Link>
        </div>

        <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Dokumentacja
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/docs/dokumentacja-techniczna.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={btnCard}
          >
            <span className="font-semibold text-lg">Dokumentacja techniczna</span>
            <span className="text-sm opacity-70 mt-2">
              Architektura, API, baza danych
            </span>
          </a>
          <a
            href="/docs/dokumentacja-uzytkownika.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={btnCard}
          >
            <span className="font-semibold text-lg">Dokumentacja użytkownika</span>
            <span className="text-sm opacity-70 mt-2">
              Instrukcja korzystania z systemu
            </span>
          </a>
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-lg border-2 border-[#82000a] text-[#82000a] text-sm font-semibold hover:bg-[#82000a] hover:text-white active:scale-95 transition"
          >
            ← Kalendarz publiczny
          </Link>
        </p>
      </main>

      <ConfirmModal
        open={logoutOpen}
        title="Wylogowanie"
        message="Czy na pewno chcesz się wylogować z panelu administratora?"
        confirmLabel="Wyloguj"
        cancelLabel="Anuluj"
        danger
        onCancel={() => setLogoutOpen(false)}
        onConfirm={async () => {
          setLogoutOpen(false);
          await signOut();
          router.push("/admin/login");
        }}
      />
    </div>
  );
}