"use client";

import { useSession } from "@/lib/auth-client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Year = {
  id: number;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

export default function AdminYearsPage() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [years, setYears] = useState<Year[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Year | null>(null);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/admin/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function fetchYears() {
      try {
        const res = await fetch("/api/school-years");
        const data = await res.json();
        if (!cancelled) {
          setYears(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore
      }
    }

    fetchYears();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function reloadYears() {
    const res = await fetch("/api/school-years");
    const data = await res.json();
    setYears(Array.isArray(data) ? data : []);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", startDate: "", endDate: "", isActive: false });
    setShowForm(true);
    setError("");
  }

  function openEdit(y: Year) {
    setEditing(y);
    setForm({
      name: y.name,
      startDate: y.startDate,
      endDate: y.endDate,
      isActive: y.isActive,
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.startDate || !form.endDate) {
      setError("Wypełnij wymagane pola");
      return;
    }
    setLoading(true);
    try {
      const url = editing
        ? `/api/school-years/${editing.id}`
        : "/api/school-years";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Błąd zapisu");
      } else {
        setShowForm(false);
        await reloadYears();
      }
    } catch {
      setError("Błąd połączenia");
    } finally {
      setLoading(false);
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
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-300 hover:text-white text-sm transition"
            >
              ← Panel
            </Link>
            <h1 className="font-bold text-lg">Lata szkolne</h1>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#82000a] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#6a0008] transition"
          >
            + Dodaj rok
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
            <h2 className="font-semibold mb-3 text-[#3f3b3a]">
              {editing ? "Edytuj rok szkolny" : "Nowy rok szkolny"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Nazwa (np. 2026/2027) *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#82000a]/20 focus:border-[#82000a]"
                  placeholder="2026/2027"
                  required
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
                <label className="text-sm font-medium">Data zakończenia *</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  required
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                <label htmlFor="isActive" className="text-sm">
                  Ustaw jako aktywny rok
                </label>
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

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y">
          {years.map((y) => (
            <div
              key={y.id}
              className="px-4 py-3 flex items-center justify-between gap-4"
            >
              <div>
                <span className="font-medium text-[#3f3b3a]">{y.name}</span>
                {y.isActive && (
                  <span className="ml-2 text-xs bg-[#3f3b3a] text-white px-2 py-0.5 rounded">
                    aktywny
                  </span>
                )}
                <div className="text-xs text-gray-500">
                  {y.startDate} – {y.endDate}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => openEdit(y)}
                  className="text-sm text-[#3f3b3a] hover:underline font-medium"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => setDeleteId(y.id)}
                  className="text-sm text-[#82000a] hover:underline font-medium"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
          {years.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">
              Brak lat szkolnych
            </p>
          )}
        </div>
      </main>

      <ConfirmModal
        open={deleteId !== null}
        title="Usuń rok szkolny"
        message="Czy na pewno chcesz usunąć ten rok szkolny? Powiązane wydarzenia mogą zostać usunięte."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId === null) return;
          const id = deleteId;
          setDeleteId(null);
          const res = await fetch(`/api/school-years/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.error || "Błąd usuwania");
            return;
          }
          await reloadYears();
        }}
      />
    </div>
  );
}