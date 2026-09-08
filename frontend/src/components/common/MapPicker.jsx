import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      // clicking the map updates the selected coordinates
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      })
    },
  })

  return position ? (
    <Marker
      position={[position.lat, position.lng]}
      icon={markerIcon}
    />
  ) : null
}

function MapUpdater({ position }) {
  const map = useMap()

  useEffect(() => {
    if (!position) {
      return
    }

    // move the map whenever the selected coordinates change
    map.flyTo(
      [position.lat, position.lng],
      10,
      {
        duration: 0.8,
      }
    )
  }, [position, map])

  return null
}

export default function MapPicker({ position, setPosition }) {
  return (
    <div className="relative z-0 h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <MapContainer
        center={[23.3441, 85.3096]}
        zoom={7}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater position={position} />

        <MapMarker
          position={position}
          setPosition={setPosition}
        />
      </MapContainer>
    </div>
  )
}