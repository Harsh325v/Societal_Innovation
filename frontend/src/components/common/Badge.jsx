const statusConfig = {
  OPEN: { label: 'Open', tone: 'info' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'warning' },
  RESOLVED: { label: 'Resolved', tone: 'success' },

  ACTIVE: { label: 'Active', tone: 'primary' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  IN_PROGRESS: { label: 'In Progress', tone: 'info' },
  PENDING: { label: 'Pending', tone: 'warning' },

  SUBMITTED: { label: 'Submitted', tone: 'info' },
  APPROVED: { label: 'Approved', tone: 'success' },
  ACCEPTED: { label: 'Accepted', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },

  DEPLOYED: { label: 'Deployed', tone: 'success' },
}

export default function Badge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    tone: 'neutral',
  }

  const tones = {
    neutral: 'bg-slate-100 text-slate-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-cyan-100 text-cyan-700',
    purple: 'bg-violet-100 text-violet-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-emerald-100 text-emerald-700',
    dark: 'bg-slate-800 text-slate-100',
    danger: 'bg-rose-100 text-rose-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        tones[config.tone]
      }`}
    >
      {config.label}
    </span>
  )
}