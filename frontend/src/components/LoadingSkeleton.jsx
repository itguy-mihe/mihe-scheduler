export function CardSkeleton() {
  return (
    <div className="card p-6 animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-white/5 rounded-lg w-2/3" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2" />
        </div>
        <div className="h-6 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="h-px bg-white/5" />
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-white/5 rounded-lg" />
        <div className="h-8 w-20 bg-white/5 rounded-lg" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-1/2 mb-3" />
      <div className="h-8 bg-white/5 rounded w-1/3" />
    </div>
  )
}

export function TableRowSkeleton({ rows = 4 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-1/3" />
      <div className="h-4 bg-white/5 rounded w-1/5" />
      <div className="h-4 bg-white/5 rounded w-1/6 ml-auto" />
    </div>
  ))
}
