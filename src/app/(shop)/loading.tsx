export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-8 md:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Gallery skeleton */}
        <div className="flex gap-4">
          <div className="hidden lg:flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="flex-1 aspect-square rounded-2xl bg-gray-100 animate-pulse" />
        </div>
        {/* Info skeleton */}
        <div className="space-y-5">
          <div className="h-8 w-3/4 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-6 w-1/4 rounded-lg bg-gray-100 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-4/6 rounded bg-gray-100 animate-pulse" />
          </div>
          <div className="h-14 w-full rounded-full bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
