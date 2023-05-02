// @ts-expect-error - no types
import weather from 'weather-js';
import { promisify } from 'util';

export interface WeatherResponse {
  location: Location;
  current: { [key: string]: string };
  forecast: Forecast[];
}

export interface Forecast {
  low: string;
  high: string;
  skycodeday: string;
  skytextday: string;
  date: string;
  day: string;
  shortday: string;
  precip: string;
}

export interface Location {
  name: string;
  lat: string;
  long: string;
  timezone: string;
  alert: string;
  degreetype: string;
  imagerelativeurl: string;
}

const findWeather = promisify(weather.find);

export async function getWeather(location: string): Promise<WeatherResponse> {
  const result = await findWeather({ search: location, degreeType: 'C' });
  return result[0];
}
