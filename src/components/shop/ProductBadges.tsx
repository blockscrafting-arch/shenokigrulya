interface ProductBadgesProps {
  badges: string[];
}

export function ProductBadges({ badges }: ProductBadgesProps) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
