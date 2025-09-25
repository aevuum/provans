"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("token") || "";
    setToken(t);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Отсутствует токен сброса.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Пароль должен быть не менее 6 символов.");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Не удалось сбросить пароль");
      }
      setMessage("Пароль успешно изменён. Сейчас перенаправим на вход…");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setError(err.message || "Ошибка при сбросе пароля");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Сброс пароля</h1>
      {message && (
        <div className="mb-4 rounded bg-green-100 p-3 text-green-800">{message}</div>
      )}
      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-800">{error}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm">Новый пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1 block text-sm">Повторите пароль</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded border px-3 py-2"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Сохраняем…" : "Сбросить пароль"}
        </button>
      </form>
    </div>
  );
}
