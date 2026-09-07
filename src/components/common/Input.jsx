export default function Input({ label, type = 'text', className = '', ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label ? <span className="mb-2 block">{label}</span> : null}
      <input
        type={type}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${className}`}
        {...props}
      />
    </label>
  )
}
