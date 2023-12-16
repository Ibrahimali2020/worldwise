import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './Map.module.css'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useCities } from '../Contexts/CitiesContext'
import { useGeolocation } from '../hooks/useGeolocation'
import { useUrlPosition } from '../hooks/useUrlPosition'
import Button from '../components/Button'

export default function Map() {
  const { cities } = useCities()
  const [mapPosition, setMapPosition] = useState([31.205753, 29.924526])
  const { isLoading: isLoadingPosition, position: geolocationPosition, getPosition } = useGeolocation()

  const [mapLat, mapLng] = useUrlPosition()

  useEffect(() => {
    if (mapLat && mapLng) setMapPosition([mapLat, mapLng])
  }, [mapLat, mapLng])

  useEffect(() => {
    if (geolocationPosition) setMapPosition([
      geolocationPosition.lat, geolocationPosition.lng
    ])
  }, [geolocationPosition])

  return (
    <div className={styles.mapContainer} >
      {!geolocationPosition && <Button
        type='position'
        onClick={getPosition}>
        {isLoadingPosition ? 'Loading...' : ' Use Your Position'}
      </Button>}
      <MapContainer
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.map}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cities.map(city => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}>
            <Popup>
              {city.emoji} <br /> {city.cityName}
            </Popup>
          </Marker>
        ))}
        <DetectClick />
        <ChangeCenter position={mapPosition} />
      </MapContainer>
    </div>
  )
}

function ChangeCenter({ position }) {
  const map = useMap()
  map.setView(position);
  return null;
}

function DetectClick() {
  const nagivage = useNavigate()

  useMapEvents({
    click: (e) => nagivage(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`)
  })
}
