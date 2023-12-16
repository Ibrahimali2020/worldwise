// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import { useUrlPosition } from '../hooks/useUrlPosition'
import styles from "./Form.module.css";
import Button from "./Button";
import BackButton from "./BackButton";
import Message from "./Message";
import Spinner from "./Spinner";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../Contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

// const flagemojiToPNG = (flag) => {
//   const countryFlag = flag.toLowerCase()
//   return (
//     <img src={`https://flagcdn.com/24x18/${countryFlag}.png`} alt="flag" />
//   );
// };


const BASE_URL = 'https://us1.locationiq.com/v1/reverse';
const KEY = 'pk.1e68b48fd98d026f6b0745cbc99f2e8d'

function Form() {

  const { createCity, isLoading } = useCities()
  const [lat, lng] = useUrlPosition()
  const navigate = useNavigate()

  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false)
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [emoji, setemoji] = useState('')
  const [geocodingError, setgeocodingError] = useState('')

  useEffect(() => {
    if (!lat && !lng) return;
    async function fetchCityData() {
      try {
        setIsLoadingGeocoding(true)
        setgeocodingError('')
        const res = await fetch(`${BASE_URL}?key=${KEY}&lat=${lat}&lon=${lng}&format=json`)
        const data = await res.json();
        if (!data.address.country_code) throw new Error('That does not to seem to be a cityName.Click somwwhere else 😒')
        setCityName(data.display_name?.split(',', 1) || '')
        setCountry(data.address.country)
        setemoji(convertToEmoji(data.address.country_code))
      } catch (err) {
        setgeocodingError(err.message)
      } finally {
        setIsLoadingGeocoding(false)
      }
    }
    fetchCityData()
  }, [lat, lng])

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng }
    }
    await createCity(newCity);
    navigate('/app/cities')
  }

  if (isLoadingGeocoding) return <Spinner />

  if (!lat && !lng) return <Message message={'Start by clicking somewhere on the map'} />

  if (geocodingError) return <Message message={geocodingError} />

  return (
    <form className={`${styles.form} ${isLoading ? styles.loading : ''}`} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <ReactDatePicker
          id="date"
          selected={date}
          onChange={date => setDate(date)}
          dateFormat={'dd/MM/yyy'} />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type='primary'>Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
