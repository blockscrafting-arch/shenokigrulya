import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
          <Link
            href="/offer"
            className="text-xs text-ink-muted hover:text-brand transition-colors underline underline-offset-2"
          >
            Публичная оферта
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-ink-muted hover:text-brand transition-colors underline underline-offset-2"
          >
            Политика конфиденциальности
          </Link>
          <a
            href="mailto:partners@kkushneriov.ru"
            className="text-xs text-ink-muted hover:text-brand transition-colors"
          >
            partners@kkushneriov.ru
          </a>
        </div>
        <p className="text-center text-xs text-ink-muted">
          &copy; {year} ИП Кушнерёв Кирилл.&nbsp;
          УСН&#8209;6%,&nbsp;НДС не облагается (п.&nbsp;1 ст.&nbsp;346.11 НК&nbsp;РФ).
        </p>
      </div>
    </footer>
  );
}
