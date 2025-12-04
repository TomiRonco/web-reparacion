export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
            </div>
            <div className="h-6 w-20 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4"></div>
            <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
            <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4"></div>
        </div>
      ))}
    </div>
  )
}
