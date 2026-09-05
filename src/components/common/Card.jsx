export default function Card({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : null}
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {action || null}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
