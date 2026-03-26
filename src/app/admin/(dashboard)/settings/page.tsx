import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function AdminSettingsPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "main" } });
  const telegramConfigured = Boolean(
    process.env.TELEGRAM_CHAT_ID ?? settings?.telegramChatId
  );

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-semibold">Настройки</h1>

      <section className="max-w-md rounded-xl border border-black/10 bg-white p-6">
        <h2 className="font-heading text-lg font-medium mb-2">Telegram-уведомления</h2>
        <p className="text-sm text-text-muted">
          Статус:{" "}
          <span className={telegramConfigured ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
            {telegramConfigured ? "Настроено" : "Не настроено"}
          </span>
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Chat ID: {settings?.telegramChatId || process.env.TELEGRAM_CHAT_ID ? "задан" : "не задан"}.
          Настройте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env или сохраните Chat ID в БД (настройки — в следующих итерациях).
        </p>
      </section>

      <section className="max-w-md rounded-xl border border-black/10 bg-white p-6">
        <h2 className="font-heading text-lg font-medium mb-4">Смена пароля</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
