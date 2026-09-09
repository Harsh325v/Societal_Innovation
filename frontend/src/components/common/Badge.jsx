import { useTranslation } from '../../i18n/useTranslation'

const statusConfig = {
  OPEN: { key: 'open', tone: 'info' },
  UNDER_REVIEW: { key: 'underReview', tone: 'warning' },
  RESOLVED: { key: 'resolved', tone: 'success' },

  ACTIVE: { key: 'active', tone: 'primary' },
  COMPLETED: { key: 'completed', tone: 'success' },
  IN_PROGRESS: { key: 'statusInProgress', tone: 'info' },
  PENDING: { key: 'statusPending', tone: 'warning' },

  SUBMITTED: { key: 'statusSubmitted', tone: 'info' },
  APPROVED: { key: 'approved', tone: 'success' },
  ACCEPTED: { key: 'statusAccepted', tone: 'success' },
  REJECTED: { key: 'statusRejected', tone: 'danger' },

  DEPLOYED: { key: 'solutionDeployed', tone: 'success' },
}

export default function Badge({ status }) {
  const { t } = useTranslation()

  const config = statusConfig[status] || {
    key: null,
    tone: 'neutral',
  }

  const label = config.key
    ? t(config.key)
    : status

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
      {label}
    </span>
  )
}