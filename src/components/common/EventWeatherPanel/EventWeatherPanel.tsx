import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react';
import {
  fetchEventWeather,
  getDaysUntilEvent,
  getMaxForecastDays,
  type EventDayWeatherOutlook,
  type WeatherData,
} from '../../../services/weatherService';
import { getWeatherPackingTips } from '../../../utils/rsvpEventHelpers';
import './EventWeatherPanel.scss';

export interface EventWeatherPanelProps {
  location: string;
  latitude?: number;
  longitude?: number;
  eventDate: Date | string;
  className?: string;
  variant?: 'default' | 'rsvp';
  showPackingTips?: boolean;
  showLocation?: boolean;
}

const getWeatherIcon = (iconCode?: string) => {
  if (!iconCode) return <Cloud size={28} />;

  if (iconCode.includes('01')) return <Sun size={28} />;
  if (iconCode.includes('09') || iconCode.includes('10')) {
    return <CloudRain size={28} />;
  }
  if (iconCode.includes('13')) return <CloudSnow size={28} />;
  if (iconCode.includes('50')) return <Wind size={28} />;
  return <Cloud size={28} />;
};

const EventWeatherPanel: React.FC<EventWeatherPanelProps> = ({
  location,
  latitude,
  longitude,
  eventDate,
  className = '',
  variant = 'default',
  showPackingTips = false,
  showLocation = true,
}) => {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherData | null>(null);
  const [eventDayOutlook, setEventDayOutlook] =
    useState<EventDayWeatherOutlook | null>(null);
  const [loading, setLoading] = useState(false);

  const maxForecastDays = getMaxForecastDays();
  const daysUntilEvent = useMemo(
    () => getDaysUntilEvent(eventDate),
    [eventDate]
  );

  const getForecastUnavailableMessage = (): string => {
    if (daysUntilEvent < 0) {
      return t('weather.eventPassed');
    }
    if (daysUntilEvent > maxForecastDays) {
      return t('weather.eventTooFar', { days: maxForecastDays });
    }
    return t('weather.forecastFetchFailed');
  };

  const currentLabel =
    variant === 'rsvp' ? t('weather.currentRsvp') : t('weather.currentDefault');
  const forecastLabel =
    variant === 'rsvp' ? t('weather.forecastRsvp') : t('weather.forecastDefault');

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async () => {
      setLoading(true);
      setWeather(null);
      setWeatherForecast(null);
      setEventDayOutlook(null);

      try {
        const result = await fetchEventWeather({
          location,
          latitude,
          longitude,
          eventDate: new Date(eventDate),
        });

        if (!cancelled) {
          setWeather(result.current);
          setWeatherForecast(result.forecast);
          setEventDayOutlook(result.eventDayOutlook);
        }
      } catch {
        if (!cancelled) {
          setWeather(null);
          setWeatherForecast(null);
          setEventDayOutlook(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [location, latitude, longitude, eventDate, i18n.language]);

  const rootClass = [
    'event-weather',
    variant === 'rsvp' ? 'event-weather--rsvp' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (loading) {
    return (
      <div className={rootClass}>
        <div className="event-weather__state">
          <Cloud size={32} opacity={0.3} />
          <p>{t('weather.loading')}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={rootClass}>
        <div className="event-weather__state">
          <Cloud size={32} opacity={0.3} />
          <p>{t('weather.unavailable')}</p>
        </div>
      </div>
    );
  }

  const locationLabel = location.split(',')[0]?.trim() || location;
  const packingTips =
    showPackingTips && eventDayOutlook
      ? getWeatherPackingTips(eventDayOutlook)
      : [];
  const packingUnavailable =
    showPackingTips && !eventDayOutlook && weather != null;

  return (
    <div className={rootClass}>
      {showLocation && (
        <p className="event-weather__location">{locationLabel}</p>
      )}

      {showPackingTips && (
        <div className="event-weather__packing">
          <span className="event-weather__packing-label">
            {t('weather.packingLabel')}
          </span>
          {packingTips.length > 0 ? (
            <ul className="event-weather__packing-list">
              {packingTips.map(tip => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          ) : packingUnavailable ? (
            <p className="event-weather__packing-hint">
              {getForecastUnavailableMessage()}
            </p>
          ) : null}
        </div>
      )}

      <div className="event-weather__grid">
        <div className="event-weather__block">
          <h3 className="event-weather__label">{currentLabel}</h3>
          <div className="event-weather__main">
            <div className="event-weather__icon">{getWeatherIcon(weather.icon)}</div>
            <span className="event-weather__temp">{weather.temp}°C</span>
          </div>
          <p className="event-weather__desc">{weather.description}</p>
          <div className="event-weather__stats">
            <span>💧 {weather.humidity}%</span>
            <span>💨 {weather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="event-weather__block">
          <h3 className="event-weather__label">{forecastLabel}</h3>
          {weatherForecast ? (
            <>
              <div className="event-weather__main">
                <div className="event-weather__icon">
                  {getWeatherIcon(weatherForecast.icon)}
                </div>
                <span className="event-weather__temp">{weatherForecast.temp}°C</span>
              </div>
              <p className="event-weather__desc">{weatherForecast.description}</p>
              <div className="event-weather__stats">
                <span>💧 {weatherForecast.humidity}%</span>
                <span>💨 {weatherForecast.windSpeed} km/h</span>
              </div>
            </>
          ) : (
            <div className="event-weather__forecast-empty">
              <Cloud size={28} opacity={0.3} />
              <p>{getForecastUnavailableMessage()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventWeatherPanel;
