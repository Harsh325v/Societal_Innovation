import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import MapPicker from '../../components/common/MapPicker'
import { challengeService } from '../../services/challengeService'

// these are the domains currently supported by our portal
const domains = [
  'Agriculture',
  'Healthcare',
  'Education',
  'Water Management',
  'Environment',
]

// Jharkhand has 24 districts
const districts = [
  'Bokaro',
  'Chatra',
  'Deoghar',
  'Dhanbad',
  'Dumka',
  'East Singhbhum',
  'Garhwa',
  'Giridih',
  'Godda',
  'Gumla',
  'Hazaribagh',
  'Jamtara',
  'Khunti',
  'Koderma',
  'Latehar',
  'Lohardaga',
  'Pakur',
  'Palamu',
  'Ramgarh',
  'Ranchi',
  'Sahibganj',
  'Seraikela Kharsawan',
  'Simdega',
  'West Singhbhum',
]

// approximate coordinates of each district headquarters
// these are used to move the map when a district is selected
const districtCoordinates = {
  Bokaro: { lat: 23.6693, lng: 86.1511 },
  Chatra: { lat: 24.2065, lng: 84.8705 },
  Deoghar: { lat: 24.4763, lng: 86.6942 },
  Dhanbad: { lat: 23.7957, lng: 86.4304 },
  Dumka: { lat: 24.2676, lng: 87.2486 },
  'East Singhbhum': { lat: 22.8046, lng: 86.2029 },
  Garhwa: { lat: 24.1596, lng: 83.8078 },
  Giridih: { lat: 24.186, lng: 86.3003 },
  Godda: { lat: 24.827, lng: 87.2125 },
  Gumla: { lat: 23.042, lng: 84.537 },
  Hazaribagh: { lat: 23.9966, lng: 85.3691 },
  Jamtara: { lat: 23.963, lng: 86.801 },
  Khunti: { lat: 23.076, lng: 85.2782 },
  Koderma: { lat: 24.4674, lng: 85.593 },
  Latehar: { lat: 23.7446, lng: 84.4998 },
  Lohardaga: { lat: 23.4336, lng: 84.6836 },
  Pakur: { lat: 24.6397, lng: 87.8424 },
  Palamu: { lat: 24.03, lng: 84.07 },
  Ramgarh: { lat: 23.63, lng: 85.52 },
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Sahibganj: { lat: 25.2445, lng: 87.6506 },
  'Seraikela Kharsawan': { lat: 22.7, lng: 85.93 },
  Simdega: { lat: 22.6158, lng: 84.5021 },
  'West Singhbhum': { lat: 22.57, lng: 85.8 },
}

const initialForm = {
  title: 'Irregular drinking water supply in rural Ranchi',
  description:
    'Villages in the Angara block face intermittent water flow and limited storage capacity, affecting health and agricultural productivity.',
  domain: 'Water Management',
  district: 'Ranchi',
  block: 'Angara',
  locality: 'Kusmi Pahari',
  severity: 'High',
  urgency: 'Immediate',
  affectedPeople: '4200',
  lat: 23.3441,
  lng: 85.3096,
}

export default function ChallengeForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      // convert the UI values into the 1-5 values expected by our backend
      const severityMap = {
        High: 5,
        Medium: 3,
        Low: 1,
      }

      const urgencyMap = {
        Immediate: 5,
        Urgent: 3,
        Planned: 1,
      }

      // convert the actual number of people into an impact rating
      let peopleAffected = 1

      if (Number(form.affectedPeople) >= 5000) {
        peopleAffected = 5
      } else if (Number(form.affectedPeople) >= 1000) {
        peopleAffected = 4
      } else if (Number(form.affectedPeople) >= 500) {
        peopleAffected = 3
      } else if (Number(form.affectedPeople) >= 100) {
        peopleAffected = 2
      }

      const payload = {
        title: form.title,
        description: form.description,

        // send the selected location to the backend
        district: form.district,
        block: form.block,
        locality: form.locality,
        latitude: form.lat,
        longitude: form.lng,

        severity: severityMap[form.severity],
        urgency: urgencyMap[form.urgency],
        people_affected: peopleAffected,
        geographic_impact: 5,
      }

      // send the challenge to FastAPI
      const response = await challengeService.submitChallenge(payload)

      // backend returns the real database challenge ID
      setSubmitted(true)

      setTimeout(() => {
        navigate(`/challenges/${response.data.id}`)
      }, 800)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Something went wrong while submitting the challenge.'
      )
    } finally {
      setLoading(false)
    }
  }

  // move the map whenever the selected district changes
  const handleDistrictChange = (e) => {
    const district = e.target.value
    const coordinates = districtCoordinates[district]

    setForm({
      ...form,
      district,
      ...(coordinates || {}),
    })
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
        <h2 className="text-3xl font-bold text-emerald-900">
          Challenge submitted successfully
        </h2>

        <p className="mt-3 text-emerald-700">
          Your issue is now being analyzed and matched with university experts.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Citizen
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Report a challenge
        </h1>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card title="Basic information">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Challenge title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Detailed description</span>

                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>

            <Select
              label="Domain / category"
              value={form.domain}
              options={domains.map((domain) => ({
                value: domain,
                label: domain,
              }))}
              onChange={(e) =>
                setForm({ ...form, domain: e.target.value })
              }
            />

            <Select
              label="Severity"
              value={form.severity}
              options={['High', 'Medium', 'Low'].map((value) => ({
                value,
                label: value,
              }))}
              onChange={(e) =>
                setForm({ ...form, severity: e.target.value })
              }
            />
          </div>
        </Card>

        <Card title="Location">
          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="District"
              value={form.district}
              options={districts.map((district) => ({
                value: district,
                label: district,
              }))}
              onChange={handleDistrictChange}
            />

            <Input
              label="Block"
              value={form.block}
              onChange={(e) =>
                setForm({ ...form, block: e.target.value })
              }
            />

            <Input
              label="Locality"
              value={form.locality}
              onChange={(e) =>
                setForm({ ...form, locality: e.target.value })
              }
            />

            <Select
              label="Urgency"
              value={form.urgency}
              options={['Immediate', 'Urgent', 'Planned'].map((value) => ({
                value,
                label: value,
              }))}
              onChange={(e) =>
                setForm({ ...form, urgency: e.target.value })
              }
            />

            <div className="md:col-span-2">
              <MapPicker
                position={{ lat: form.lat, lng: form.lng }}
                setPosition={(position) =>
                  setForm({
                    ...form,
                    lat: position.lat,
                    lng: position.lng,
                  })
                }
              />
            </div>

            <Input
              label="Latitude"
              value={form.lat}
              onChange={(e) =>
                setForm({ ...form, lat: Number(e.target.value) })
              }
            />

            <Input
              label="Longitude"
              value={form.lng}
              onChange={(e) =>
                setForm({ ...form, lng: Number(e.target.value) })
              }
            />
          </div>
        </Card>

        <Card title="Impact">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Number of people affected"
              type="number"
              value={form.affectedPeople}
              onChange={(e) =>
                setForm({
                  ...form,
                  affectedPeople: e.target.value,
                })
              }
            />

            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">
                Impact summary
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {form.affectedPeople || 0} residents affected in{' '}
                {form.district}.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Evidence">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Images preview
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Videos preview
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Documents preview
            </div>
          </div>
        </Card>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit challenge'}
          </Button>
        </div>
      </form>
    </div>
  )
}