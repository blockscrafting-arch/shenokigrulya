"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => router.push("/admin/dashboard");
  const handleError = (message: string) => setError(message);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-black/10 bg-white p-8">
        <h1 className="font-heading text-2xl font-semibold text-center">Вход в админку</h1>
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
        <LoginForm onSuccess={handleSuccess} onError={handleError} />
      </div>
    </div>
  );
}
