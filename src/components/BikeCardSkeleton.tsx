import { Skeleton } from "@/components/ui/skeleton";

export const BikeCardSkeleton = () => (
  <div className="rounded-xl bg-card border border-border overflow-hidden shadow-card">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export const BikeGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => <BikeCardSkeleton key={i} />)}
  </div>
);
