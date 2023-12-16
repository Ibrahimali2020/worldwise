import { useCities } from '../Contexts/CitiesContext'
import CityItem from './CityItem'
import styles from './CityList.module.css'
import Spinner from './Spinner'
// import Message from './Message'

export default function CityList() {
  const { cities, isLoading } = useCities()

  if (isLoading) return <Spinner />

  // if (!cities.lenght) return <Message message='Add your first city by clicking on a city on the map' />

  return <ul className={styles.cityList}>
    {cities.map(city => <CityItem city={city} key={city.id} />)}
  </ul>
}

