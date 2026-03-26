"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword !== confirmPassword) {
      setError("Новый пароль и подтверждение не совпадают");
      return;
    }
    if (newPassword.length < 8) {
      setError("Новый пароль не менее 8 символов");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : data.error?.currentPassword?.[0] ?? "Ошибка смены пароля");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Текущий пароль</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          required
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Новый пароль</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1">Подтвердите новый пароль</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Пароль успешно изменён.</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/85 disabled:opacity-50"
      >
        {loading ? "Сохранение…" : "Сменить пароль"}
      </button>
    </form>
  );
}
