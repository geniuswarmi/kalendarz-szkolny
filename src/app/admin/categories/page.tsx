"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ConfirmModal } from "@/components/ConfirmModal";

type Category = {
  id: number;
  name: string;
  color: string;
  description: string | null;
  pattern: string | null;
  sortOrder: number | null;
};

export default function AdminCategoriesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    color: "#e53935",
    description: "",
    pattern: "",
    sortOrder: "0",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/admin/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!cancelled) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch {
        // ignore
      }
    }

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function reloadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      color: "#e53935",
      description: "",
      pattern: "",
      sortOrder: "0",
    });
    setShowForm(true);
    setError("");
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      color: c.color,
      description: c.description || "",
      pattern: c.pattern || "",
      sortOrder: String(c.sortOrder ?? 0),
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.color) {
      setError("Nazwa i kolor są wymagane");
      return;
    }
    setLoading(true);
    try {
      const url = editing
        ? `/api/categories/${editing.id}`
        : "/api/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          color: form.color,
          description: form.description || null,
          pattern: form.pattern || null,
          sortOrder: parseInt(form.sortOrder, 10) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Błąd zapisu");
      } else {
        setShowForm(false);
        await reloadCategories();
      }
    } catch {
      setError("Błąd połączenia");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (deleteId === null) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || `Błąd usuwania (${res.status})`);
        return;
      }
      await reloadCategories();
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
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-300 hover:text-white text-sm transition"
            >
              ← Panel
            </Link>
            <h1 className="font-bold text-lg">Kategorie</h1>
          </div>
          <button
            onClick={openCreate}
            className="bg-[#82000a] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#6a0008] transition"
          >
            + Dodaj kategorię
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
            <h2 className="font-semibold mb-3 text-[#3f3b3a]">
              {editing ? "Edytuj kategorię" : "Nowa kategoria"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div>
                <label className="text-sm font-medium">Nazwa *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#82000a]/20 focus:border-[#82000a]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kolor *</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
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
                <label className="text-sm font-medium">Wzorzec</label>
                <select
                  value={form.pattern}
                  onChange={(e) =>
                    setForm({ ...form, pattern: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 font-sans bg-white"
                >
                  <option value="">Brak</option>
                  <option value="stripes">Paski</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Kolejność</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                />
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
          {categories.map((c) => (
            <div
              key={c.id}
              className="px-4 py-3 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded border shrink-0"
                  style={{
                    backgroundColor: c.color,
                    backgroundImage:
                      c.pattern === "stripes"
                        ? `repeating-linear-gradient(45deg, ${c.color}, ${c.color} 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 6px)`
                        : undefined,
                  }}
                />
                <div>
                  <span className="font-medium text-[#3f3b3a]">{c.name}</span>
                  {c.description && (
                    <div className="text-xs text-gray-500">{c.description}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="text-sm text-[#3f3b3a] hover:underline font-medium"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="text-sm text-[#82000a] hover:underline font-medium"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">
              Brak kategorii
            </p>
          )}
        </div>
      </main>

      <ConfirmModal
        open={deleteId !== null}
        title="Usuń kategorię"
        message="Czy na pewno chcesz usunąć tę kategorię? Jeśli są do niej przypisane wydarzenia, usunięcie może się nie powieść."
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}