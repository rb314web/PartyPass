// components/dashboard/DashboardHome/ActivityWeather.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity as ActivityIcon, Cloud, MapPin, Calendar, Users, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { getFromCache, saveToCache } from '../../../utils/geocodeCache';
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
}

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const ActivityWeather: React.FC<ActivityWeatherProps> = ({ lastActivity, nextEvent }) => {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const formatEventDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEventClick = () => {
    if (nextEvent?.id) {
      navigate(`/dashboard/events/${nextEvent.id}`);
    }
  };

  // Pobieranie pogody
  useEffect(() => {
    const fetchWeather = async () => {
      if (!nextEvent?.location) return;

      setLoadingWeather(true);
      try {
        const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
        
        if (!API_KEY) {
          setLoadingWeather(false);
          return;
        }

        let lat: number;
        let lon: number;
        
        // PRIORYTET 1: Użyj zapisanych współrzędnych
        if (nextEvent.latitude && nextEvent.longitude) {
          lat = nextEvent.latitude;
          lon = nextEvent.longitude;
        } 
        // PRIORYTET 2: Sprawdź cache
        else {
          const cached = getFromCache(nextEvent.location);
          if (cached) {
            lat = cached.lat;
            lon = cached.lng;
          }
          // PRIORYTET 3: Geokoduj przez Nominatim
          else {
            try {
              const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nextEvent.location)}&format=json&limit=1`;
              
              const geocodeResponse = await fetch(geocodeUrl, {
                headers: {
                  'User-Agent': 'PartyPass/1.0'
                }
              });
              
              if (!geocodeResponse.ok) {
                setLoadingWeather(false);
                return;
              }
              
              const geocodeData = await geocodeResponse.json();
              
              if (!geocodeData || geocodeData.length === 0) {
                setLoadingWeather(false);
                return;
              }
              
              lat = parseFloat(geocodeData[0].lat);
              lon = parseFloat(geocodeData[0].lon);

              // Zapisz do cache
              saveToCache(nextEvent.location, lat, lon);
            } catch (error) {
              // Geocoding failed (network error, rate limit, connection refused) - silent fail
              setLoadingWeather(false);
              return;
            }
          }
        }
        
        // Oblicz ile dni do wydarzenia
        const eventDate = new Date(nextEvent.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // ZAWSZE pobierz aktualną pogodę
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pl`;
        const currentResponse = await fetch(currentUrl);
        
        if (currentResponse.ok) {
          const currentData = await currentResponse.json();
          setWeather({
            temp: Math.round(currentData.main.temp),
            description: currentData.weather[0].description,
            icon: currentData.weather[0].icon,
            humidity: currentData.main.humidity,
            windSpeed: Math.round(currentData.wind.speed * 3.6),
          });
        }
        
        // Jeśli wydarzenie jest 0-5 dni w przyszłości, pobierz też prognozę
        if (daysUntilEvent >= 0 && daysUntilEvent <= 5) {
          const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pl`;
          
          const forecastResponse = await fetch(forecastUrl);
          
          if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            
            // Znajdź prognozę najbliższą dacie wydarzenia (preferuj południe 12:00)
            const targetTimestamp = eventDate.getTime();
            let closestForecast = forecastData.list[0];
            let smallestDiff = Math.abs(new Date(closestForecast.dt * 1000).getTime() - targetTimestamp);
            
            for (const forecast of forecastData.list) {
              const forecastDate = new Date(forecast.dt * 1000);
              const diff = Math.abs(forecastDate.getTime() - targetTimestamp);
              
              // Preferuj prognozy z godzin 12:00-15:00 (środek dnia)
              const hour = forecastDate.getHours();
              const isMidday = hour >= 12 && hour <= 15;
              
              if (diff < smallestDiff || (diff === smallestDiff && isMidday)) {
                smallestDiff = diff;
                closestForecast = forecast;
              }
            }
            
            setWeatherForecast({
              temp: Math.round(closestForecast.main.temp),
              description: closestForecast.weather[0].description,
              icon: closestForecast.weather[0].icon,
              humidity: closestForecast.main.humidity,
              windSpeed: Math.round(closestForecast.wind.speed * 3.6),
            });
          }
        } else {
          // Wyczyść prognozę jeśli wydarzenie dzisiaj lub za daleko
          setWeatherForecast(null);
        }
      } catch (error) {
        // Weather fetch failed, silent fail
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [nextEvent?.location, nextEvent?.latitude, nextEvent?.longitude]);

  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return <Cloud size={32} />;
    
    if (iconCode.includes('01')) return <Sun size={32} />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain size={32} />;
    if (iconCode.includes('13')) return <CloudSnow size={32} />;
    if (iconCode.includes('50')) return <Wind size={32} />;
    return <Cloud size={32} />;
  };

  return (
    <div className="activity-weather">
      {/* Ostatnia aktywność */}
      <div className="activity-weather__card activity-weather__card--activity">
        <div className="activity-weather__header">
          <div className="activity-weather__header-content">
            <div className="activity-weather__icon activity-weather__icon--purple">
              <ActivityIcon size={18} />
            </div>
            <span className="activity-weather__title">Ostatnia aktywność</span>
          </div>
        </div>

        {lastActivity ? (
          <div className="activity-weather__content">
            <p className="activity-weather__message">{lastActivity.message}</p>
            <span className="activity-weather__time">
              {formatDistanceToNow(new Date(lastActivity.timestamp), { 
                addSuffix: true,
                locale: pl 
              })}
            </span>
          </div>
        ) : (
          <div className="activity-weather__empty">
            <ActivityIcon size={32} opacity={0.3} />
            <p>Brak ostatnich aktywności</p>
          </div>
        )}
      </div>

      {/* Pogoda dla najbliższego wydarzenia */}
      <div className="activity-weather__card activity-weather__card--weather">
        <div className="activity-weather__header">
          <div className="activity-weather__header-content">
            <div className="activity-weather__icon activity-weather__icon--blue">
              <Cloud size={18} />
            </div>
            <span className="activity-weather__title">Pogoda - Następne wydarzenie</span>
          </div>
        </div>

        {nextEvent && nextEvent.location ? (
          <div className="activity-weather__content">
            <h4 className="activity-weather__event-title">{nextEvent.title}</h4>
            
            <div 
              className="activity-weather__event-info activity-weather__event-info--clickable"
              onClick={handleEventClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleEventClick()}
            >
              <div className="activity-weather__event-detail">
                <Calendar size={14} />
                <span>{formatEventDate(nextEvent.date)}</span>
              </div>
              <div className="activity-weather__event-detail">
                <MapPin size={14} />
                <span>{nextEvent.location.split(',')[0]}</span>
              </div>
              <div className="activity-weather__event-detail">
                <Users size={14} />
                <span>{nextEvent.guestCount} gości</span>
              </div>
            </div>

            {/* Pogoda */}
            <div className="activity-weather__weather-info">
              {loadingWeather ? (
                <div className="activity-weather__weather-loading">
                  <Cloud size={32} opacity={0.3} />
                  <p>Ładowanie pogody...</p>
                </div>
              ) : weather ? (
                <>
                  {/* Nazwa miejscowości */}
                  <div className="activity-weather__weather-location">
                    <MapPin size={16} />
                    <span>{nextEvent.location.split(',')[0]}</span>
                  </div>
                  
                  <div className="activity-weather__weather-container">
                    {/* Aktualna pogoda */}
                    <div className="activity-weather__weather-data">
                      <h5 className="activity-weather__weather-label">Aktualna</h5>
                    <div className="activity-weather__weather-main">
                      <div className="activity-weather__weather-icon">
                        {getWeatherIcon(weather.icon)}
                      </div>
                      <div className="activity-weather__weather-temp">
                        {weather.temp}°C
                      </div>
                    </div>
                    <div className="activity-weather__weather-details">
                      <p className="activity-weather__weather-desc">{weather.description}</p>
                      <div className="activity-weather__weather-stats">
                        <span>💧 {weather.humidity}%</span>
                        <span>💨 {weather.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Prognoza w trakcie wydarzenia (zawsze pokazuj box) */}
                  <div className="activity-weather__weather-data">
                    <h5 className="activity-weather__weather-label">W trakcie</h5>
                    {weatherForecast ? (
                      <>
                        <div className="activity-weather__weather-main">
                          <div className="activity-weather__weather-icon">
                            {getWeatherIcon(weatherForecast.icon)}
                          </div>
                          <div className="activity-weather__weather-temp">
                            {weatherForecast.temp}°C
                          </div>
                        </div>
                        <div className="activity-weather__weather-details">
                          <p className="activity-weather__weather-desc">{weatherForecast.description}</p>
                          <div className="activity-weather__weather-stats">
                            <span>💧 {weatherForecast.humidity}%</span>
                            <span>💨 {weatherForecast.windSpeed} km/h</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="activity-weather__weather-unavailable-inline">
                        <Cloud size={32} opacity={0.3} />
                        <p>Prognoza będzie dostępna bliżej daty wydarzenia</p>
                      </div>
                    )}
                  </div>
                </div>
                </>
              ) : (
                <div className="activity-weather__weather-placeholder">
                  <Cloud size={32} opacity={0.3} />
                  <p>Pogoda niedostępna</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="activity-weather__empty">
            <Cloud size={32} opacity={0.3} />
            <p>Brak nadchodzących wydarzeń z lokalizacją</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityWeather;
