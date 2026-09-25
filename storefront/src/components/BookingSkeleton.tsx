import { Skeleton } from "@/components/ui/skeleton"

export function BookingSkeleton() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex items-center justify-between bg-brand px-3 py-2.5">
        <Skeleton className="size-8 rounded-md bg-brand-foreground/10" />
        <Skeleton className="h-4 w-32 bg-brand-foreground/10" />
        <Skeleton className="size-8 rounded-md bg-brand-foreground/10" />
      </div>

      <div className="flex gap-2 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 flex-1 rounded-md" />
        ))}
      </div>

      <div className="flex flex-col gap-3 px-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
