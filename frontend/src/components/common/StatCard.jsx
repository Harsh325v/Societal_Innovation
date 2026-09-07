export default function StatCard({ icon: Icon, label, value, change, accent = 'slate' }) {
  const accents = {
    slate: 'bg-slate-900 text-white',
    cyan: 'bg-cyan-50 text-cyan-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {change ? <span className="text-xs font-semibold text-emerald-600">{change}</span> : null}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
    </div>
  )
}
