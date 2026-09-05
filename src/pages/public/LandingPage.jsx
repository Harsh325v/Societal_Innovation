import { ArrowRight, Building2, CheckCircle2, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'

const stats = [
  { value: '128+', label: 'Challenges mapped' },
  { value: '24', label: 'Universities engaged' },
  { value: '42', label: 'Industry partners' },
  { value: '186k+', label: 'People benefited' },
]

const domains = ['Water Management', 'Healthcare', 'Agriculture', 'Education', 'Energy', 'Environment']

const steps = [
  { title: 'Citizen reports a challenge', description: 'Residents share location, evidence, and impact details in plain language.' },
  { title: 'AI and expert triage', description: 'The platform classifies, prioritizes, and matches the challenge to relevant institutions.' },
  { title: 'University and industry action', description: 'Teams submit proposals, build projects, and mobilize support for implementation.' },
]

export default function LandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Jharkhand civic innovation network
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              From Community Problems to Real-World Solutions.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              A collaborative platform that connects citizens, universities, startups, industry leaders, and government agencies to turn societal challenges into practical, measurable impact.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/citizen/challenges/new">
                <Button size="lg">Report a Challenge <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
              <Link to="/challenges/CH-2041">
                <Button variant="secondary" size="lg">Explore Challenges</Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Active challenge</div>
                  <div className="mt-2 text-2xl font-semibold">Irregular drinking water supply</div>
                </div>
                <div className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">High priority</div>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-200">
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3"><span>District</span><span>Ranchi</span></div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3"><span>AI category</span><span>Water Management</span></div>
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3"><span>University match</span><span>92%</span></div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-600"><ShieldCheck className="h-4 w-4" /> Impact</div>
                <div className="mt-3 text-2xl font-bold text-slate-900">4,200</div>
                <div className="text-sm text-slate-500">Residents affected</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-600"><MapPin className="h-4 w-4" /> Coverage</div>
                <div className="mt-3 text-2xl font-bold text-slate-900">7</div>
                <div className="text-sm text-slate-500">Villages mapped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">A complete innovation pipeline</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">0{index + 1}</div>
                <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dominant sectors</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Prioritized around societal need</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <div key={domain} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-lg font-medium text-slate-700 shadow-sm">
              {domain}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><Users className="h-6 w-6" /></div>
              <h3 className="text-2xl font-semibold">Universities</h3>
              <p className="mt-3 text-slate-300">Faculty and students review challenges, select the best-fit problems, and develop solutions with structured mentorship.</p>
            </div>
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><Building2 className="h-6 w-6" /></div>
              <h3 className="text-2xl font-semibold">Industry</h3>
              <p className="mt-3 text-slate-300">Startups and firms contribute technical expertise, prototyping support, funding, and deployment pathways.</p>
            </div>
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10"><CheckCircle2 className="h-6 w-6" /></div>
              <h3 className="text-2xl font-semibold">Government</h3>
              <p className="mt-3 text-slate-300">Policy stakeholders review impact, track outcomes, and monitor district-wide progress through live dashboards.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-10 text-center text-white shadow-xl">
          <Sparkles className="mx-auto h-8 w-8 text-amber-300" />
          <h2 className="mt-5 text-3xl font-bold">Designed for real civic impact.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">This prototype demonstrates how grassroots ideas can be transformed into student innovation, academic mentorship, industry support, and government-scale deployment.</p>
          <div className="mt-8 flex justify-center">
            <Link to="/register">
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">Join as an organization</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
