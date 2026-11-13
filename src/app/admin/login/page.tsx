"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setError(res.error.message || "Błędny e-mail lub hasło");
        return;
      }

      // wyczyść pola przed przejściem dalej
      setEmail("");
      setPassword("");
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-center text-[#3f3b3a] mb-1">
          Panel administratora
        </h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Zaloguj się, aby zarządzać kalendarzem
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          autoComplete="off"
        >
          {/* ukryte pola – przeglądarka mniej chętnie podpowiada dane */}
          <input
            type="text"
            name="fake-user"
            autoComplete="username"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
          <input
            type="password"
            name="fake-pass"
            autoComplete="current-password"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mail
            </label>
            <input
              id="admin-email"
              name="admin-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="E-mail"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#82000a]/30 focus:border-[#82000a] disabled:bg-gray-50"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hasło
            </label>
            <input
              id="admin-password"
              name="admin-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Hasło"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#82000a]/30 focus:border-[#82000a] disabled:bg-gray-50"
            />
          </div>

          {error && (
            <p className="text-[#82000a] text-sm bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3f3b3a] text-white py-2.5 rounded-lg font-medium hover:bg-[#2d2a29] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="text-[#82000a] hover:underline">
            ← Powrót do kalendarza
          </Link>
        </p>
      </div>
    </div>
  );
}