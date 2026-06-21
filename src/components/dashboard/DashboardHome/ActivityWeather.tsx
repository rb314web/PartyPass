// components/dashboard/DashboardHome/ActivityWeather.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity as ActivityIcon,
  Cloud,
  MapPin,
  Calendar,
  Users,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Droplets,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl, enGB } from 'date-fns/locale';
import {
  fetchEventWeather,
  getDaysUntilEvent,
  getMaxForecastDays,
  type WeatherData,
} from '../../../services/weatherService';
import './ActivityWeather.scss';

interface LastActivity {
  type: string;
  message: string;
  timestamp: Date | string;
}

interface NextEvent {
  id: string;
  title: string;
  date: Date | string;
  location?: string;
  latitude?: number;
  longitude?: number;
  guestCount: number;
}

interface ActivityWeatherProps {
  lastActivity?: LastActivity;
  nextEvent?: NextEvent | null;
  /** Pobierz prognozę dopiero gdy sekcja jest widoczna */
  fetchWeather?: boolean;
}

const getDateLocale = (language: string) =>
  language.startsWith('en') ? 'en-GB' : 'pl-PL';

const ActivityWeather: React.FC<ActivityWeatherProps> = ({
  lastActivity,
  nextEvent,
  fetchWeather = true,
}) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);
  const dateFnsLocale = i18n.language.startsWith('en') ? enGB : pl;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherData | null>(
    null
  );
  const [loadingWeather, setLoadingWeather] = useState(false);

  const maxForecastDays = getMaxForecastDays();
  const daysUntilEvent = useMemo(
    () => (nextEvent?.date ? getDaysUntilEvent(nextEvent.date) : null),
    [nextEvent?.date]
  );

  const locationLabel = nextEvent?.location?.split(',')[0]?.trim() ?? '';

  const getForecastUnavailableMessage = (): string => {
    if (daysUntilEvent === null) {
      return t('dashboardHome.weatherForecastLater');
    }
    if (daysUntilEvent < 0) {
      return t('dashboardHome.weatherForecastPast');
    }
    if (daysUntilEvent > maxForecastDays) {
      return t('dashboardHome.weatherForecastTooFar', { days: maxForecastDays });
    }
    return t('dashboardHome.weatherForecastFailed');
  };

  const formatEventDateShort = (date: Date | string) =>
    new Date(date).toLocaleDateString(dateLocale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleEventClick = () => {
    if (nextEvent?.id) {
      navigate(`/dashboard/events/${nextEvent.id}`);
    }
  };

  useEffect(() => {
    if (!fetchWeather) return;

    const loadWeather = async () => {
      if (!nextEvent?.location) return;

      setLoadingWeather(true);
      setWeather(null);
      setWeatherForecast(null);

      try {
        const result = await fetchEventWeather({
          location: nextEvent.location,
          latitude: nextEvent.latitude,
          longitude: nextEvent.longitude,
          eventDate: new Date(nextEvent.date),
        });

        setWeather(result.current);
        setWeatherForecast(result.forecast);
      } catch {
        setWeather(null);
        setWeatherForecast(null);
      } finally {
        setLoadingWeather(false);
      }
    };

    loadWeather();
  }, [
    fetchWeather,
    nextEvent?.location,
    nextEvent?.latitude,
    nextEvent?.longitude,
    nextEvent?.date,
  ]);

  const getWeatherIcon = (iconCode?: string, size = 28) => {
    const props = { size };
    if (!iconCode) return <Cloud {...props} />;
    if (iconCode.includes('01')) return <Sun {...props} />;
    if (iconCode.includes('09') || iconCode.includes('10'))
      return <CloudRain {...props} />;
    if (iconCode.includes('13')) return <CloudSnow {...props} />;
    if (iconCode.includes('50')) return <Wind {...props} />;
    return <Cloud {...props} />;
  };

  const renderWeatherPanel = (
    label: string,
    data: WeatherData | null,
    unavailable?: boolean
  ) => (
    <div className="activity-weather__weather-panel">
      <span className="activity-weather__weather-label">{label}</span>
      {data ? (
        <>
          <div className="activity-weather__weather-main">
            <div className="activity-weather__weather-icon">
              {getWeatherIcon(data.icon)}
            </div>
            <div className="activity-weather__weather-temp">{data.temp}°C</div>
          </div>
          <p className="activity-weather__weather-desc">{data.description}</p>
          <div className="activity-weather__weather-stats">
            <span>
              <Droplets size={13} aria-hidden />
              {data.humidity}%
            </span>
            <span>
              <Wind size={13} aria-hidden />
              {data.windSpeed} km/h
            </span>
          </div>
        </>
      ) : (
        <div className="activity-weather__weather-unavailable-inline">
          <Cloud size={24} opacity={0.35} aria-hidden />
          <p>
            {unavailable
              ? getForecastUnavailableMessage()
              : t('dashboardHome.weatherNoData')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="activity-weather">
      <div className="activity-weather__card activity-weather__card--activity">
        <div className="activity-weather__header">
          <div className="activity-weather__header-content">
            <div className="activity-weather__icon activity-weather__icon--purple">
              <ActivityIcon size={16} />
            </div>
            <span className="activity-weather__title">
              {t('dashboardHome.activityTitle')}
            </span>
          </div>
          <Link to="/dashboard/activities" className="activity-weather__link">
            {t('dashboardHome.activityViewAll')}
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        {lastActivity ? (
          <div className="activity-weather__content activity-weather__content--activity">
            <p className="activity-weather__message">{lastActivity.message}</p>
            <span className="activity-weather__time">
              {formatDistanceToNow(new Date(lastActivity.timestamp), {
                addSuffix: true,
                locale: dateFnsLocale,
              })}
            </span>
          </div>
        ) : (
          <div className="activity-weather__empty activity-weather__empty--inline">
            <p>{t('dashboardHome.activityEmpty')}</p>
          </div>
        )}
      </div>

      <div className="activity-weather__card activity-weather__card--weather">
        <div className="activity-weather__header">
          <div className="activity-weather__header-content">
            <div className="activity-weather__icon activity-weather__icon--blue">
              <Cloud size={16} />
            </div>
            <div className="activity-weather__header-text">
              <span className="activity-weather__title">
                {t('dashboardHome.weatherTitle')}
              </span>
              {nextEvent?.title && (
                <span className="activity-weather__subtitle">
                  {nextEvent.title}
                </span>
              )}
            </div>
          </div>
        </div>

        {nextEvent && nextEvent.location ? (
          <div className="activity-weather__content">
            <div
              className="activity-weather__meta-chips"
              onClick={handleEventClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleEventClick()}
            >
              <span className="activity-weather__chip">
                <Calendar size={12} aria-hidden />
                {formatEventDateShort(nextEvent.date)}
              </span>
              <span className="activity-weather__chip">
                <MapPin size={12} aria-hidden />
                {locationLabel}
              </span>
              <span className="activity-weather__chip">
                <Users size={12} aria-hidden />
                {t('dashboardHome.guest', { count: nextEvent.guestCount })}
              </span>
            </div>

            <div className="activity-weather__weather-info">
              {loadingWeather ? (
                <div className="activity-weather__weather-loading">
                  <Cloud size={24} opacity={0.35} aria-hidden />
                  <p>{t('dashboardHome.weatherLoading')}</p>
                </div>
              ) : weather ? (
                <div className="activity-weather__weather-container">
                  {renderWeatherPanel(t('dashboardHome.weatherCurrent'), weather)}
                  {renderWeatherPanel(
                    t('dashboardHome.weatherDuring'),
                    weatherForecast,
                    true
                  )}
                </div>
              ) : (
                <div className="activity-weather__weather-placeholder">
                  <Cloud size={24} opacity={0.35} aria-hidden />
                  <p>{t('dashboardHome.weatherUnavailable')}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="activity-weather__empty activity-weather__empty--inline">
            <p>
              {nextEvent
                ? t('dashboardHome.weatherNoLocation')
                : t('dashboardHome.weatherNoUpcoming')}
            </p>
            <span className="activity-weather__empty-hint">
              {nextEvent
                ? t('dashboardHome.weatherAddLocationHint', {
                    title: nextEvent.title,
                  })
                : t('dashboardHome.weatherCreateEventHint')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityWeather;
