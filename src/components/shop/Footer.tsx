export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-8">
        <p className="text-center text-xs text-ink-muted">
          &copy; {year} Щенок Игруля. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
