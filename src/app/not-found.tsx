import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 py-16 text-center">
      <Link href="/" className="mb-8 block">
        <Image
          src="/logo/logo-color.svg"
          alt="Щенок Игруля"
          width={200}
          height={60}
          className="mx-auto h-auto w-48"
          priority
        />
      </Link>
      <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-ink md:text-4xl">
        Страница не найдена
      </h1>
      <p className="mt-4 max-w-md text-ink-secondary">
        Такой страницы нет или ссылка устарела. Перейдите на главную и продолжите покупки.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        На главную
      </Link>
    </div>
  );
}
