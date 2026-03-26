"use client";

import { useState } from "react";

interface LoginFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(data.error ?? "Ошибка входа");
        return;
      }
      onSuccess();
    } catch {
      onError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-primary">Логин</label>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-primary">Пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2"
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Вход…" : "Войти"}
      </button>
    </form>
  );
}
