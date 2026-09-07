import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import MapPicker from '../../components/common/MapPicker'
import { domains, districts } from '../../data/mockData'

const initialForm = {
  title: 'Irregular drinking water supply in rural Ranchi',
  description: 'Villages in the Angara block face intermittent water flow and limited storage capacity, affecting health and agricultural productivity.',
  domain: 'Water Management',
  district: 'Ranchi',
  block: 'Angara',
  locality: 'Kusmi Pahari',
  severity: 'High',
  urgency: 'Immediate',
  affectedPeople: '4200',
  lat: 23.3607,
  lng: 85.3131,
}

export default function ChallengeForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      navigate('/challenges/CH-2041')
    }, 800)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <h2 className="text-3xl font-bold text-emerald-900">Challenge submitted successfully</h2>
        <p className="mt-3 text-emerald-700">Your issue is now being analyzed and matched with university experts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Citizen</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Report a challenge</h1>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card title="Basic information">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input label="Challenge title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Detailed description</span>
                <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200" />
              </label>
            </div>
            <Select label="Domain / category" value={form.domain} options={domains.map((domain) => ({ value: domain, label: domain }))} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
            <Select label="Severity" value={form.severity} options={['High', 'Medium', 'Low'].map((value) => ({ value, label: value }))} onChange={(e) => setForm({ ...form, severity: e.target.value })} />
          </div>
        </Card>

        <Card title="Location">
          <div className="grid gap-5 md:grid-cols-2">
            <Select label="District" value={form.district} options={districts.map((district) => ({ value: district, label: district }))} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <Input label="Block" value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} />
            <Input label="Locality" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} />
            <Select label="Urgency" value={form.urgency} options={['Immediate', 'Urgent', 'Planned'].map((value) => ({ value, label: value }))} onChange={(e) => setForm({ ...form, urgency: e.target.value })} />
            <div className="md:col-span-2">
              <MapPicker position={{ lat: form.lat, lng: form.lng }} setPosition={(position) => setForm({ ...form, lat: position.lat, lng: position.lng })} />
            </div>
            <Input label="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: Number(e.target.value) })} />
            <Input label="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: Number(e.target.value) })} />
          </div>
        </Card>

        <Card title="Impact">
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Number of people affected" type="number" value={form.affectedPeople} onChange={(e) => setForm({ ...form, affectedPeople: e.target.value })} />
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Impact summary</p>
              <p className="mt-2 text-sm text-slate-500">{form.affectedPeople || 0} residents affected in {form.district}.</p>
            </div>
          </div>
        </Card>

        <Card title="Evidence">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Images preview</div>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Videos preview</div>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Documents preview</div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Submit challenge</Button>
        </div>
      </form>
    </div>
  )
}
