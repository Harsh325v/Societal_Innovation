import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Mic,
  MicOff,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import MapPicker from '../../components/common/MapPicker'
import { challengeService } from '../../services/challengeService'

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

// Approximate coordinates of district headquarters.
// These are only used to move the map when a district is selected.
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
  'Seraikela Kharsawan': {
    lat: 22.7,
    lng: 85.93,
  },
  Simdega: { lat: 22.6158, lng: 84.5021 },
  'West Singhbhum': {
    lat: 22.57,
    lng: 85.8,
  },
}

const initialForm = {
  title: '',
  description: '',
  district: '',
  block: '',
  locality: '',
  affectedPeople: '',
  lat: 23.3441,
  lng: 85.3096,
}

export default function ChallengeForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)

  const [submitted, setSubmitted] = useState(false)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')

  const [listening, setListening] = useState(false)

  const [showLocation, setShowLocation] = useState(false)

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  /*
   * Voice input.
   *
   * Uses the browser's built-in speech recognition
   * when available.
   */
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError(
        'Voice input is not supported in this browser. You can type your problem instead.'
      )
      return
    }

    if (listening) {
      return
    }

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onstart = () => {
      setListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript

      setForm((current) => ({
        ...current,
        description: current.description
          ? `${current.description} ${transcript}`
          : transcript,
        title:
          current.title ||
          transcript.slice(0, 80),
      }))
    }

    recognition.onerror = () => {
      setError(
        'Could not understand the voice input. Please try again or type your problem.'
      )
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    /*
     * Basic validation before sending data.
     */
    if (!form.description.trim()) {
      setError(
        'Please tell us about the problem you are facing.'
      )
      return
    }

    if (!form.district) {
      setError('Please select your district.')
      return
    }

    setLoading(true)

    try {
      /*
       * Convert the number of people into the
       * 1-5 impact value expected by the backend.
       */
      let peopleAffected = 1

      if (Number(form.affectedPeople) >= 5000) {
        peopleAffected = 5
      } else if (
        Number(form.affectedPeople) >= 1000
      ) {
        peopleAffected = 4
      } else if (
        Number(form.affectedPeople) >= 500
      ) {
        peopleAffected = 3
      } else if (
        Number(form.affectedPeople) >= 100
      ) {
        peopleAffected = 2
      }

      /*
       * We deliberately do NOT ask citizens to choose
       * technical AI fields such as category, severity
       * or urgency.
       *
       * Sahyog's backend/AI layer handles the analysis.
       *
       * Safe default values are sent because the current
       * backend expects these fields.
       */
      const payload = {
        title:
          form.title.trim() ||
          'Citizen reported problem',

        description: form.description.trim(),

        district: form.district,

        block: form.block.trim(),

        locality: form.locality.trim(),

        latitude: form.lat,

        longitude: form.lng,

        severity: 3,

        urgency: 3,

        people_affected: peopleAffected,

        geographic_impact: 5,
      }

      const response =
        await challengeService.submitChallenge(
          payload
        )

      setSubmitted(true)

      /*
       * Give the success message a moment to appear
       * before opening the challenge details page.
       */
      setTimeout(() => {
        navigate(
          `/challenges/${response.data.id}`
        )
      }, 1200)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          'Something went wrong while submitting the problem.'
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * When a district changes, move the map to that
   * district's approximate location.
   */
  const handleDistrictChange = (e) => {
    const district = e.target.value

    const coordinates =
      districtCoordinates[district]

    setForm((current) => ({
      ...current,
      district,
      ...(coordinates || {}),
    }))
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">

            <CheckCircle2 className="h-8 w-8 text-emerald-600" />

          </div>

          <h2 className="mt-5 text-2xl font-bold text-emerald-900">
            Problem reported successfully
          </h2>

          <p className="mt-3 text-sm leading-6 text-emerald-700">
            Thank you for reporting this issue.
            Sahyog will analyze your problem and
            look for suitable university experts
            who can help.
          </p>

          <p className="mt-4 text-xs text-emerald-600">
            Taking you to your problem...
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* PAGE HEADING */}

      <div>

        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Citizen
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Report a Problem
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Tell us about a problem in your community.
          You do not need to know the category or
          technical details. Sahyog will help analyze it.
        </p>

      </div>


      {/* MAIN PROBLEM */}

      <Card
        title="What problem are you facing?"
        subtitle="Explain the problem in your own words."
      >

        <div className="space-y-5">

          {/* BIG DESCRIPTION BOX */}

          <div>

            <label className="block text-sm font-medium text-slate-700">
              Describe your problem
            </label>

            <textarea
              rows={7}
              value={form.description}
              onChange={(e) =>
                updateForm(
                  'description',
                  e.target.value
                )
              }
              placeholder="For example: There is no proper drinking water supply in our village..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

            <p className="mt-2 text-xs text-slate-500">
              You can write in simple words. You do
              not need to explain it technically.
            </p>

          </div>


          {/* VOICE BUTTON */}

          <button
            type="button"
            onClick={handleVoiceInput}
            className={`flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold transition ${
              listening
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >

            {listening ? (
              <>
                <MicOff className="h-5 w-5" />
                Listening... Speak clearly
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Speak your problem instead
              </>
            )}

          </button>


          {/* OPTIONAL SHORT TITLE */}

          <Input
            label="Problem title (optional)"
            value={form.title}
            onChange={(e) =>
              updateForm(
                'title',
                e.target.value
              )
            }
            placeholder="Example: Drinking water problem"
          />

          <p className="-mt-3 text-xs text-slate-500">
            If you leave this empty, Sahyog will use
            a simple title automatically.
          </p>

        </div>

      </Card>


      {/* LOCATION */}

      <Card
        title="Where is the problem?"
        subtitle="This helps us connect your problem with nearby universities and experts."
      >

        <div className="grid gap-5 md:grid-cols-2">

          <Select
            label="District"
            value={form.district}
            options={districts.map(
              (district) => ({
                value: district,
                label: district,
              })
            )}
            onChange={
              handleDistrictChange
            }
          />

          <Input
            label="Block"
            value={form.block}
            onChange={(e) =>
              updateForm(
                'block',
                e.target.value
              )
            }
            placeholder="Example: Angara"
          />

          <Input
            label="Village / locality"
            value={form.locality}
            onChange={(e) =>
              updateForm(
                'locality',
                e.target.value
              )
            }
            placeholder="Example: Kusmi Pahari"
          />

        </div>


        {/* OPTIONAL MAP */}

        <div className="mt-5">

          <button
            type="button"
            onClick={() =>
              setShowLocation(
                (current) => !current
              )
            }
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >

            <MapPin className="h-4 w-4" />

            {showLocation
              ? 'Hide map'
              : 'Add exact location on map'}

          </button>


          {showLocation && (

            <div className="mt-4 space-y-4">

              <MapPicker
                position={{
                  lat: form.lat,
                  lng: form.lng,
                }}
                setPosition={(position) =>
                  setForm((current) => ({
                    ...current,
                    lat: position.lat,
                    lng: position.lng,
                  }))
                }
              />

              <p className="text-xs text-slate-500">
                You can move the marker to the
                approximate location of the problem.
                You do not need to enter coordinates.
              </p>

            </div>

          )}

        </div>

      </Card>


      {/* IMPACT */}

      <Card
        title="How many people are affected?"
        subtitle="An approximate number is completely fine."
      >

        <div className="max-w-md">

          <Input
            label="People affected"
            type="number"
            min="0"
            value={form.affectedPeople}
            onChange={(e) =>
              updateForm(
                'affectedPeople',
                e.target.value
              )
            }
            placeholder="Example: 500"
          />

        </div>


        <div className="mt-4 rounded-2xl bg-slate-50 p-4">

          <p className="text-sm font-medium text-slate-700">
            Why do we ask this?
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            This helps Sahyog understand how many
            people may be affected and how urgently
            the problem may need attention.
          </p>

        </div>

      </Card>


      {/* AI EXPLANATION */}

      <Card title="What happens after you submit?">

        <div className="grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl bg-slate-50 p-4">

            <div className="text-sm font-semibold text-slate-900">
              1. We understand
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Sahyog analyzes your problem and
              identifies its category.
            </p>

          </div>


          <div className="rounded-2xl bg-slate-50 p-4">

            <div className="text-sm font-semibold text-slate-900">
              2. We find experts
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Suitable universities and faculty
              are matched to your problem.
            </p>

          </div>


          <div className="rounded-2xl bg-slate-50 p-4">

            <div className="text-sm font-semibold text-slate-900">
              3. A solution is built
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              Students and faculty work on the
              problem through a project.
            </p>

          </div>


          <div className="rounded-2xl bg-slate-50 p-4">

            <div className="text-sm font-semibold text-slate-900">
              4. Impact is tracked
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              The solution can eventually reach
              the community.
            </p>

          </div>

        </div>

      </Card>


      {/* ERROR */}

      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm leading-6 text-red-600">
            {error}
          </p>

        </div>

      )}


      {/* SUBMIT */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-xs leading-5 text-slate-500">
          By submitting, your problem will be
          reviewed and analyzed by Sahyog.
        </p>


        <Button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
        >

          {loading ? (
            'Submitting...'
          ) : (
            <>
              Submit Problem
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}

        </Button>

      </div>

    </div>
  )
}