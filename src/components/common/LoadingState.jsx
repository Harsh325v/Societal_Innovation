export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        {message}
      </div>
    </div>
  )
}
