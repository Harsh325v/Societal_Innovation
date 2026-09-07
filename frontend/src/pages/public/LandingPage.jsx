import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import Button from '../../components/common/Button'

// these are the main domains our platform currently supports
const domains = [
  'Water Management',
  'Healthcare',
  'Agriculture',
  'Education',
  'Environment',
]

const steps = [
  {
    title: 'Citizen reports a challenge',
    description:
      'Residents share problems, location details, and impact information through a simple challenge form.',
  },
  {
    title: 'AI and expert triage',
    description:
      'The platform classifies the challenge, calculates its priority, detects duplicates, and finds relevant HEIs.',
  },
  {
    title: 'University and industry action',
    description:
      'HEIs propose solutions, build projects, involve students and faculty, and receive industry support.',
  },
]

export default function LandingPage() {
  return (
    <div className="bg-slate-50">
      {/* hero section */}
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
              A collaborative platform that connects citizens, universities,
              industry leaders, and government agencies to turn societal
              challenges into practical, measurable impact.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/citizen/challenges/new">
                <Button size="lg">
                  Report a Challenge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Explore the Platform
                </Button>
              </Link>
            </div>

            {/* don't show fake platform numbers here */}
            <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-lg font-bold text-slate-900">
                  AI-powered
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Challenge analysis
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-lg font-bold text-slate-900">
                  HEI matching
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Expertise-based
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-lg font-bold text-slate-900">
                  Industry
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Collaboration
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-lg font-bold text-slate-900">
                  Impact
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Government monitoring
                </div>
              </div>
            </div>
          </div>

          {/* platform workflow preview */}
          <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Platform workflow
              </div>

              <div className="mt-3 text-2xl font-semibold">
                From problem to implementation
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <span>Community challenge</span>
                  <span className="text-emerald-300">Submitted</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <span>AI analysis</span>
                  <span className="text-cyan-300">Analyzed</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <span>HEI matching</span>
                  <span className="text-violet-300">Matched</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <span>Project</span>
                  <span className="text-amber-300">Active</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                  <span>Industry support</span>
                  <span className="text-emerald-300">Collaborative</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="h-4 w-4" />
                  AI Intelligence
                </div>

                <div className="mt-3 text-lg font-bold text-slate-900">
                  Priority + Matching
                </div>

                <div className="text-sm text-slate-500">
                  Data-driven triage
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  Local Impact
                </div>

                <div className="mt-3 text-lg font-bold text-slate-900">
                  District-aware
                </div>

                <div className="text-sm text-slate-500">
                  Jharkhand-focused
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* workflow explanation */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              A complete innovation pipeline
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                  0{index + 1}
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* supported domains */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Focus areas
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Prioritized around societal need
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <div
              key={domain}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-lg font-medium text-slate-700 shadow-sm"
            >
              {domain}
            </div>
          ))}
        </div>
      </section>

      {/* role explanation */}
      <section className="border-y border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Users className="h-6 w-6" />
              </div>

              <h3 className="text-2xl font-semibold">Universities</h3>

              <p className="mt-3 text-slate-300">
                Faculty and students review challenges, develop solutions,
                build projects, and contribute expertise through structured
                collaboration.
              </p>
            </div>

            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Building2 className="h-6 w-6" />
              </div>

              <h3 className="text-2xl font-semibold">Industry</h3>

              <p className="mt-3 text-slate-300">
                Companies can contribute mentorship, funding, prototyping,
                testing, and pilot support to help solutions reach the field.
              </p>
            </div>

            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h3 className="text-2xl font-semibold">Government</h3>

              <p className="mt-3 text-slate-300">
                Government stakeholders can monitor challenges, projects,
                institutional participation, and measurable impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* call to action */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-10 text-center text-white shadow-xl">
          <Sparkles className="mx-auto h-8 w-8 text-amber-300" />

          <h2 className="mt-5 text-3xl font-bold">
            Designed for real civic impact.
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Connect grassroots challenges with academic expertise, student
            innovation, industry support, and government oversight.
          </p>

          <div className="mt-8 flex justify-center">
            <Link to="/register">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                Join as an organization
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}