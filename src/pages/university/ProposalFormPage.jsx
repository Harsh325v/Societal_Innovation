import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'

export default function ProposalFormPage() {
  const { challengeId } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    title: 'Smart Water Network for Angara Villages',
    problem: 'Current supply is intermittent, creating health risks and productivity loss in households and farms.',
    solution: 'Deploy a low-cost monitoring and pilot pipeline system using sensor-based flow analysis and community dashboards.',
    methodology: 'Assessment, design, pilot deployment, and feedback-led optimization.',
    outcomes: 'Improved reliability, reduced water wastage, and measurable health and productivity benefits.',
    budget: '₹18,50,000',
    duration: '9 months',
  })

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <h2 className="text-3xl font-bold text-emerald-900">Proposal submitted successfully</h2>
        <p className="mt-3 text-emerald-700">The proposal has been shared with the challenge owner and the review committee.</p>
        <Link to="/university/projects"><Button className="mt-6">View projects</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Proposal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Submit a solution proposal</h1>
      </div>

      <Card title={`Challenge: ${challengeId}`}>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}>
          <div className="md:col-span-2"><Input label="Proposal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Problem understanding</span><textarea rows={4} value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" /></label></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Proposed solution</span><textarea rows={4} value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" /></label></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Methodology</span><textarea rows={3} value={form.methodology} onChange={(e) => setForm({ ...form, methodology: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" /></label></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700"><span className="mb-2 block">Expected outcomes</span><textarea rows={3} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" /></label></div>
          <Input label="Estimated budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          <Input label="Estimated duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <div className="md:col-span-2 flex justify-end"><Button type="submit">Submit proposal</Button></div>
        </form>
      </Card>
    </div>
  )
}
