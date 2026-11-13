"use client";

import { useSession } from "@/lib/auth-client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  categoryId: number;
  schoolYearId: number;
  categoryName: string;
  categoryColor: string;
};

type Year = { id: number; name: string; isActive: boolean };
type Category = { id: number; name: string; color: string };

export default function AdminEventsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterYear, setFilterYear] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    categoryId: "",
    schoolYearId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function fetchData() {
      const params = new URLSearchParams();
      if (filterYear) params.set("schoolYearId", filterYear);
      if (filterCat) params.set("categoryId", filterCat);

      try {
        const [e, y, c] = await Promise.all([
          fetch(`/api/events?${params}`).then((r) => r.json()),
          fetch("/api/school-years").then((r) => r.json()),
          fetch("/api/categories").then((r) => r.json()),
        ]);
        if (cancelled) return;
        setEvents(Array.isArray(e) ? e : []);
        setYears(Array.isArray(y) ? y : []);
        setCategories(Array.isArray(c) ? c : []);
      } catch {
        // ignore
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [session, filterYear, filterCat]);

  async function reloadEvents() {
    const params = new URLSearchParams();
    if (filterYear) params.set("schoolYearId", filterYear);
    if (filterCat) params.set("categoryId", filterCat);

    const [e, y, c] = await Promise.all([
      fetch(`/api/events?${params}`).then((r) => r.json()),
      fetch("/api/school-years").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setEvents(Array.isArray(e) ? e : []);
    setYears(Array.isArray(y) ? y : []);
    setCategories(Array.isArray(c) ? c : []);
  }

  function openCreate() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      categoryId: categories[0]?.id?.toString() || "",
      schoolYearId:
        years.find((y) => y.isActive)?.id?.toString() ||
        years[0]?.id?.toString() ||
        "",
    });
    setShowForm(true);
    setError("");
  }

  function openEdit(ev: Event) {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description || "",
      startDate: ev.startDate,
      endDate: ev.endDate || "",
      categoryId: String(ev.categoryId),
      schoolYearId: String(ev.schoolYearId),
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title || !form.startDate || !form.categoryId || !form.schoolYearId) {
      setError("Wypełnij wymagane pola");
      return;
    }
    setLoading(true);
    try {
      const url = editing ? `/api/events/${editing.id}` : "/api/events";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          startDate: form.startDate,
          endDate: form.endDate || null,
          categoryId: Number(form.categoryId),
          schoolYearId: Number(form.schoolYearId),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Błąd zapisu");
      } else {
        setShowForm(false);
        await reloadEvents();
      }
    } catch {
      setError("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(id: number) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || `Błąd usuwania (${res.status})`);
        return;
      }
      await reloadEvents();
    } catch {
      alert("Błąd połączenia przy usuwaniu");
    }
  }

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-[#3f3b3a] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-300 hover:text-white text-sm transition"
            >
              ← Panel
            </Link>
            <h1 className="font-bold text-lg">Wydarzenia</h1>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#82000a] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#6a0008] transition"
          >
            + Dodaj wydarzenie
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-sans bg-white text-gray-900"
          >
            <option value="">Wszystkie lata</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} {y.isActive ? "(aktywny)" : ""}
              </option>
            ))}
          </select>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-sans bg-white text-gray-900"
          >
            <option value="">Wszystkie kategorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
            <h2 className="font-semibold mb-3 text-[#3f3b3a]">
              {editing ? "Edytuj wydarzenie" : "Nowe wydarzenie"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Tytuł *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#82000a]/20 focus:border-[#82000a]"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Opis</label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#82000a]/20 focus:border-[#82000a]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data rozpoczęcia *</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data zakończenia</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kategoria *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 font-sans bg-white"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Rok szkolny *</label>
                <select
                  value={form.schoolYearId}
                  onChange={(e) =>
                    setForm({ ...form, schoolYearId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 font-sans bg-white"
                  required
                >
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <p className="sm:col-span-2 text-[#82000a] text-sm">{error}</p>
              )}
              <div className="sm:col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3f3b3a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2d2a29] disabled:opacity-50 transition"
                >
                  {loading ? "Zapisywanie..." : "Zapisz"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#3f3b3a] text-white border-b">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Tytuł</th>
                <th className="text-left px-4 py-2.5 font-medium">Data</th>
                <th className="text-left px-4 py-2.5 font-medium">Kategoria</th>
                <th className="text-right px-4 py-2.5 font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium text-[#3f3b3a]">{ev.title}</div>
                    {ev.description && (
                      <div className="text-xs text-gray-500">{ev.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {ev.startDate}
                    {ev.endDate && ev.endDate !== ev.startDate
                      ? ` – ${ev.endDate}`
                      : ""}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ev.categoryColor }}
                      />
                      {ev.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(ev)}
                      className="text-[#3f3b3a] hover:underline mr-3 font-medium"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => requestDelete(ev.id)}
                      className="text-[#82000a] hover:underline font-medium"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Brak wydarzeń
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ConfirmModal
        open={deleteId !== null}
        title="Usuń wydarzenie"
        message="Czy na pewno chcesz usunąć to wydarzenie? Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}