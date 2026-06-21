import { getFromCache, saveToCache } from '../utils/geocodeCache';
import i18n from '../i18n';
import { getAppLanguage } from '../utils/locale';

const getWeatherApiLanguage = (): string =>
  getAppLanguage() === 'en' ? 'en' : 'pl';

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

/** Prognoza od godziny wydarzenia do końca dnia — do wskazówek „Co zabrać”. */
export interface EventDayWeatherOutlook {
  atEventTime: WeatherData;
  periodHours: number;
  hasRain: boolean;
  hasSnow: boolean;
  hasThunderstorm: boolean;
  hasFog: boolean;
  rainHours: number;
  minTemp: number;
  maxTemp: number;
  maxWindSpeed: number;
}

export const OPEN_METEO_FORECAST_DAYS = 16;
export const OPENWEATHER_FORECAST_DAYS = 5;

export const getMaxForecastDays = (): number =>
  process.env.REACT_APP_OPENWEATHER_API_KEY
    ? OPENWEATHER_FORECAST_DAYS
    : OPEN_METEO_FORECAST_DAYS;

export const getDaysUntilEvent = (eventDate: Date | string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);
  return Math.ceil(
    (eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

export interface WeatherResult {
  current: WeatherData | null;
  forecast: WeatherData | null;
  eventDayOutlook: EventDayWeatherOutlook | null;
}

const wmoToDescription = (code: number): string =>
  i18n.t(`weather.wmo.${code}`, { defaultValue: i18n.t('weather.wmo.default') });

const wmoToIcon = (code: number): string => {
  if (code === 0) return '01d';
  if (code <= 3) return '02d';
  if (code === 45 || code === 48) return '50d';
  if (code >= 51 && code <= 67) return '10d';
  if (code >= 71 && code <= 77) return '13d';
  if (code >= 80 && code <= 82) return '09d';
  if (code >= 85 && code <= 86) return '13d';
  if (code >= 95) return '11d';
  return '03d';
};

const isRainWmoCode = (code: number): boolean =>
  (code >= 51 && code <= 67) ||
  (code >= 80 && code <= 82) ||
  code >= 95;

const isSnowWmoCode = (code: number): boolean =>
  (code >= 71 && code <= 77) || (code >= 85 && code <= 86);

const isThunderWmoCode = (code: number): boolean => code >= 95;

const isFogWmoCode = (code: number): boolean => code === 45 || code === 48;

const weatherDataFromWmo = (
  code: number,
  temp: number,
  humidity: number,
  windSpeed: number
): WeatherData => ({
  temp: Math.round(temp),
  description: wmoToDescription(code),
  icon: wmoToIcon(code),
  humidity: Math.round(humidity),
  windSpeed: Math.round(windSpeed),
});

const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getHourlyIndicesUntilDayEnd = (
  times: string[],
  eventDate: Date
): number[] => {
  const eventStart = new Date(eventDate);
  const dayEnd = getEndOfDay(eventDate);

  return times.reduce<number[]>((indices, time, index) => {
    const hour = new Date(time);
    if (hour.getTime() >= eventStart.getTime() && hour.getTime() <= dayEnd.getTime()) {
      indices.push(index);
    }
    return indices;
  }, []);
};

interface OpenMeteoHourly {
  time: string[];
  weather_code: number[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  wind_speed_10m: number[];
  precipitation_probability?: number[];
  precipitation?: number[];
}

const buildOutlookFromOpenMeteoHourly = (
  hourly: OpenMeteoHourly,
  eventDate: Date
): EventDayWeatherOutlook | null => {
  if (!hourly.time?.length) return null;

  const atEventIndex = findClosestHourlyIndex(hourly.time, eventDate);
  const periodIndices = getHourlyIndicesUntilDayEnd(hourly.time, eventDate);

  if (periodIndices.length === 0) {
    const code = hourly.weather_code[atEventIndex] ?? 0;
    const snapshot = weatherDataFromWmo(
      code,
      hourly.temperature_2m[atEventIndex],
      hourly.relative_humidity_2m[atEventIndex],
      hourly.wind_speed_10m[atEventIndex]
    );
    return {
      atEventTime: snapshot,
      periodHours: 1,
      hasRain: isRainWmoCode(code),
      hasSnow: isSnowWmoCode(code),
      hasThunderstorm: isThunderWmoCode(code),
      hasFog: isFogWmoCode(code),
      rainHours: isRainWmoCode(code) ? 1 : 0,
      minTemp: snapshot.temp,
      maxTemp: snapshot.temp,
      maxWindSpeed: snapshot.windSpeed,
    };
  }

  let rainHours = 0;
  let hasRain = false;
  let hasSnow = false;
  let hasThunderstorm = false;
  let hasFog = false;
  let minTemp = Infinity;
  let maxTemp = -Infinity;
  let maxWindSpeed = 0;

  for (const index of periodIndices) {
    const code = hourly.weather_code[index] ?? 0;
    const precipProb = hourly.precipitation_probability?.[index] ?? 0;
    const precip = hourly.precipitation?.[index] ?? 0;
    const hourRain =
      isRainWmoCode(code) || precipProb >= 50 || precip > 0.2;

    if (hourRain) {
      hasRain = true;
      rainHours += 1;
    }
    if (isSnowWmoCode(code)) hasSnow = true;
    if (isThunderWmoCode(code)) hasThunderstorm = true;
    if (isFogWmoCode(code)) hasFog = true;

    const temp = hourly.temperature_2m[index];
    minTemp = Math.min(minTemp, temp);
    maxTemp = Math.max(maxTemp, temp);
    maxWindSpeed = Math.max(maxWindSpeed, hourly.wind_speed_10m[index]);
  }

  const atEventCode = hourly.weather_code[atEventIndex] ?? 0;
  const atEventTime = weatherDataFromWmo(
    atEventCode,
    hourly.temperature_2m[atEventIndex],
    hourly.relative_humidity_2m[atEventIndex],
    hourly.wind_speed_10m[atEventIndex]
  );

  return {
    atEventTime,
    periodHours: periodIndices.length,
    hasRain,
    hasSnow,
    hasThunderstorm,
    hasFog,
    rainHours,
    minTemp: Math.round(minTemp),
    maxTemp: Math.round(maxTemp),
    maxWindSpeed: Math.round(maxWindSpeed),
  };
};

const isRainOpenWeatherId = (id: number): boolean =>
  (id >= 200 && id <= 232) ||
  (id >= 300 && id <= 321) ||
  (id >= 500 && id <= 531);

const isSnowOpenWeatherId = (id: number): boolean => id >= 600 && id <= 622;

const isThunderOpenWeatherId = (id: number): boolean =>
  id >= 200 && id <= 232;

const buildOutlookFromOpenWeatherList = (
  list: Array<{
    dt: number;
    main: { temp: number; humidity: number };
    weather: Array<{ id: number; description: string; icon: string }>;
    wind: { speed: number };
    pop?: number;
  }>,
  eventDate: Date
): EventDayWeatherOutlook | null => {
  if (!list.length) return null;

  const eventStart = eventDate.getTime();
  const dayEnd = getEndOfDay(eventDate).getTime();

  const periodItems = list.filter(item => {
    const ts = item.dt * 1000;
    return ts >= eventStart && ts <= dayEnd;
  });

  const atEventItem = list.reduce((closest, item) => {
    const diff = Math.abs(item.dt * 1000 - eventStart);
    const closestDiff = Math.abs(closest.dt * 1000 - eventStart);
    return diff < closestDiff ? item : closest;
  });

  const snapshotFromItem = (item: (typeof list)[0]): WeatherData => ({
    temp: Math.round(item.main.temp),
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed * 3.6),
  });

  if (periodItems.length === 0) {
    const snapshot = snapshotFromItem(atEventItem);
    const weatherId = atEventItem.weather[0].id;
    const rain =
      isRainOpenWeatherId(weatherId) || (atEventItem.pop ?? 0) >= 0.5;
    return {
      atEventTime: snapshot,
      periodHours: 1,
      hasRain: rain,
      hasSnow: isSnowOpenWeatherId(weatherId),
      hasThunderstorm: isThunderOpenWeatherId(weatherId),
      hasFog: false,
      rainHours: rain ? 1 : 0,
      minTemp: snapshot.temp,
      maxTemp: snapshot.temp,
      maxWindSpeed: snapshot.windSpeed,
    };
  }

  let rainHours = 0;
  let hasRain = false;
  let hasSnow = false;
  let hasThunderstorm = false;
  let minTemp = Infinity;
  let maxTemp = -Infinity;
  let maxWindSpeed = 0;

  for (const item of periodItems) {
    const weatherId = item.weather[0].id;
    const hourRain =
      isRainOpenWeatherId(weatherId) || (item.pop ?? 0) >= 0.5;

    if (hourRain) {
      hasRain = true;
      rainHours += 1;
    }
    if (isSnowOpenWeatherId(weatherId)) hasSnow = true;
    if (isThunderOpenWeatherId(weatherId)) hasThunderstorm = true;

    minTemp = Math.min(minTemp, item.main.temp);
    maxTemp = Math.max(maxTemp, item.main.temp);
    maxWindSpeed = Math.max(maxWindSpeed, item.wind.speed * 3.6);
  }

  return {
    atEventTime: snapshotFromItem(atEventItem),
    periodHours: periodItems.length,
    hasRain,
    hasSnow,
    hasThunderstorm,
    hasFog: false,
    rainHours,
    minTemp: Math.round(minTemp),
    maxTemp: Math.round(maxTemp),
    maxWindSpeed: Math.round(maxWindSpeed),
  };
};

export const resolveEventCoordinates = async (
  location: string,
  latitude?: number,
  longitude?: number
): Promise<{ lat: number; lon: number } | null> => {
  if (latitude != null && longitude != null) {
    return { lat: latitude, lon: longitude };
  }

  const cached = getFromCache(location);
  if (cached) {
    return { lat: cached.lat, lon: cached.lng };
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  try {
    const response = await fetch(nominatimUrl, {
      headers: { 'User-Agent': 'PartyPass/1.0' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        saveToCache(location, lat, lon);
        return { lat, lon };
      }
    }
  } catch {
    // fall through to Open-Meteo geocoding
  }

  try {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=${getWeatherApiLanguage()}&format=json`;
    const response = await fetch(geocodeUrl);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.results?.length) return null;

    const lat = data.results[0].latitude;
    const lon = data.results[0].longitude;
    saveToCache(location, lat, lon);
    return { lat, lon };
  } catch {
    return null;
  }
};

const findClosestHourlyIndex = (
  times: string[],
  targetDate: Date
): number => {
  const target = targetDate.getTime();
  let closestIndex = 0;
  let smallestDiff = Math.abs(new Date(times[0]).getTime() - target);

  for (let i = 1; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - target);
    const hour = new Date(times[i]).getHours();
    const isMidday = hour >= 12 && hour <= 15;

    if (
      diff < smallestDiff ||
      (diff === smallestDiff && isMidday)
    ) {
      smallestDiff = diff;
      closestIndex = i;
    }
  }

  return closestIndex;
};

export const fetchOpenMeteoWeather = async (
  lat: number,
  lon: number,
  eventDate?: Date
): Promise<WeatherResult> => {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
  );
  url.searchParams.set(
    'hourly',
    'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation_probability,precipitation'
  );
  url.searchParams.set('forecast_days', '16');
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url);
  if (!response.ok) {
    return { current: null, forecast: null, eventDayOutlook: null };
  }

  const data = await response.json();
  const currentCode = data.current?.weather_code ?? 0;

  const current: WeatherData = {
    temp: Math.round(data.current.temperature_2m),
    description: wmoToDescription(currentCode),
    icon: wmoToIcon(currentCode),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
  };

  let forecast: WeatherData | null = null;
  let eventDayOutlook: EventDayWeatherOutlook | null = null;

  if (eventDate && data.hourly?.time?.length) {
    const daysUntilEvent = getDaysUntilEvent(eventDate);

    if (daysUntilEvent >= 0 && daysUntilEvent <= OPEN_METEO_FORECAST_DAYS) {
      eventDayOutlook = buildOutlookFromOpenMeteoHourly(
        data.hourly as OpenMeteoHourly,
        eventDate
      );
      forecast = eventDayOutlook?.atEventTime ?? null;
    }
  }

  return { current, forecast, eventDayOutlook };
};

export const fetchOpenWeatherWeather = async (
  lat: number,
  lon: number,
  eventDate: Date,
  apiKey: string
): Promise<WeatherResult> => {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${getWeatherApiLanguage()}`;
  const currentResponse = await fetch(currentUrl);

  let current: WeatherData | null = null;
  if (currentResponse.ok) {
    const currentData = await currentResponse.json();
    current = {
      temp: Math.round(currentData.main.temp),
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6),
    };
  }

  let forecast: WeatherData | null = null;
  let eventDayOutlook: EventDayWeatherOutlook | null = null;
  const daysUntilEvent = getDaysUntilEvent(eventDate);

  if (daysUntilEvent >= 0 && daysUntilEvent <= OPENWEATHER_FORECAST_DAYS) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${getWeatherApiLanguage()}`;
    const forecastResponse = await fetch(forecastUrl);

    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json();
      eventDayOutlook = buildOutlookFromOpenWeatherList(
        forecastData.list,
        eventDate
      );
      forecast = eventDayOutlook?.atEventTime ?? null;
    }
  }

  return { current, forecast, eventDayOutlook };
};

export const fetchEventWeather = async (params: {
  location: string;
  latitude?: number;
  longitude?: number;
  eventDate: Date;
}): Promise<WeatherResult> => {
  const coords = await resolveEventCoordinates(
    params.location,
    params.latitude,
    params.longitude
  );

  if (!coords) {
    return { current: null, forecast: null, eventDayOutlook: null };
  }

  const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;

  if (apiKey) {
    return fetchOpenWeatherWeather(
      coords.lat,
      coords.lon,
      params.eventDate,
      apiKey
    );
  }

  return fetchOpenMeteoWeather(coords.lat, coords.lon, params.eventDate);
};
