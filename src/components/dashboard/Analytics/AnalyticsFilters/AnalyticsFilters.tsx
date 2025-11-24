// components/dashboard/Analytics/AnalyticsFilters/AnalyticsFilters.tsx
import React, { useState } from 'react';
import {
  Filter,
  Calendar,
  MapPin,
  Users,
  X,
  Search,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import './AnalyticsFilters.scss';

export interface AnalyticsFiltersData {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  eventTypes: string[];
  locations: string[];
  guestCountRange: {
    min: number;
    max: number;
  };
  status: string[];
  searchQuery: string;
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersData;
  onFiltersChange: (filters: AnalyticsFiltersData) => void;
  availableEventTypes: string[];
  availableLocations: string[];
  className?: string;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  availableEventTypes,
  availableLocations,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<
    'date' | 'type' | 'location' | 'guests' | 'status'
  >('date');

  const updateFilters = (updates: Partial<AnalyticsFiltersData>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      eventTypes: [],
      locations: [],
      guestCountRange: { min: 0, max: 1000 },
      status: [],
      searchQuery: '',
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.eventTypes.length > 0 ||
      filters.locations.length > 0 ||
      filters.guestCountRange.min > 0 ||
      filters.guestCountRange.max < 1000 ||
      filters.status.length > 0 ||
      filters.searchQuery.length > 0
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.eventTypes.length > 0) count++;
    if (filters.locations.length > 0) count++;
    if (filters.guestCountRange.min > 0 || filters.guestCountRange.max < 1000)
      count++;
    if (filters.status.length > 0) count++;
    if (filters.searchQuery.length > 0) count++;
    return count;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('pl-PL');
  };

  const toggleEventType = (type: string) => {
    const newTypes = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter(t => t !== type)
      : [...filters.eventTypes, type];
    updateFilters({ eventTypes: newTypes });
  };

  const toggleLocation = (location: string) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    updateFilters({ locations: newLocations });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatuses });
  };

  const FilterTab: React.FC<{
    id: 'date' | 'type' | 'location' | 'guests' | 'status';
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ id, label, icon, children }) => (
    <div
      className={`analytics-filters__tab ${activeFilterTab === id ? 'active' : ''}`}
    >
      <button
        className="analytics-filters__tab-header"
        onClick={() => setActiveFilterTab(activeFilterTab === id ? 'date' : id)}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown
          className={`analytics-filters__tab-chevron ${activeFilterTab === id ? 'rotated' : ''}`}
        />
      </button>
      {activeFilterTab === id && (
        <div className="analytics-filters__tab-content">{children}</div>
      )}
    </div>
  );

  return (
    <div className={`analytics-filters ${className}`}>
      {/* Filter Toggle */}
      <div className="analytics-filters__header">
        <button
          className={`analytics-filters__toggle ${isExpanded ? 'active' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={18} />
          <span>Filtry</span>
          {hasActiveFilters() && (
            <span className="analytics-filters__count">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown
            className={`analytics-filters__chevron ${isExpanded ? 'rotated' : ''}`}
          />
        </button>

        {hasActiveFilters() && (
          <button
            className="analytics-filters__reset"
            onClick={resetFilters}
            title="Resetuj filtry"
          >
            <RotateCcw size={16} />
            <span>Resetuj</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="analytics-filters__search">
        <Search size={18} className="analytics-filters__search-icon" />
        <input
          type="text"
          placeholder="Szukaj wydarzeń, lokalizacji..."
          value={filters.searchQuery}
          onChange={e => updateFilters({ searchQuery: e.target.value })}
          className="analytics-filters__search-input"
        />
        {filters.searchQuery && (
          <button
            className="analytics-filters__search-clear"
            onClick={() => updateFilters({ searchQuery: '' })}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="analytics-filters__expanded">
          <div className="analytics-filters__tabs">
            <FilterTab id="date" label="Data" icon={<Calendar size={16} />}>
              <div className="analytics-filters__date-range">
                <div className="analytics-filters__date-field">
                  <label>Od:</label>
                  <input
                    type="date"
                    value={
                      filters.dateRange.start
                        ? filters.dateRange.start.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={e =>
                      updateFilters({
                        dateRange: {
                          ...filters.dateRange,
                          start: e.target.value
                            ? new Date(e.target.value)
                            : null,
                        },
                      })
                    }
                  />
                </div>
                <div className="analytics-filters__date-field">
                  <label>Do:</label>
                  <input
                    type="date"
                    value={
                      filters.dateRange.end
                        ? filters.dateRange.end.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={e =>
                      updateFilters({
                        dateRange: {
                          ...filters.dateRange,
                          end: e.target.value ? new Date(e.target.value) : null,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </FilterTab>

            <FilterTab
              id="type"
              label="Typ wydarzenia"
              icon={<Calendar size={16} />}
            >
              <div className="analytics-filters__checkbox-group">
                {availableEventTypes.map(type => (
                  <label key={type} className="analytics-filters__checkbox">
                    <input
                      type="checkbox"
                      checked={filters.eventTypes.includes(type)}
                      onChange={() => toggleEventType(type)}
                    />
                    <span className="analytics-filters__checkbox-label">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </FilterTab>

            <FilterTab
              id="location"
              label="Lokalizacja"
              icon={<MapPin size={16} />}
            >
              <div className="analytics-filters__checkbox-group">
                {availableLocations.map(location => (
                  <label key={location} className="analytics-filters__checkbox">
                    <input
                      type="checkbox"
                      checked={filters.locations.includes(location)}
                      onChange={() => toggleLocation(location)}
                    />
                    <span className="analytics-filters__checkbox-label">
                      {location}
                    </span>
                  </label>
                ))}
              </div>
            </FilterTab>

            <FilterTab
              id="guests"
              label="Liczba gości"
              icon={<Users size={16} />}
            >
              <div className="analytics-filters__range">
                <div className="analytics-filters__range-field">
                  <label>Min:</label>
                  <input
                    type="number"
                    value={filters.guestCountRange.min}
                    onChange={e =>
                      updateFilters({
                        guestCountRange: {
                          ...filters.guestCountRange,
                          min: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    min="0"
                  />
                </div>
                <div className="analytics-filters__range-field">
                  <label>Max:</label>
                  <input
                    type="number"
                    value={filters.guestCountRange.max}
                    onChange={e =>
                      updateFilters({
                        guestCountRange: {
                          ...filters.guestCountRange,
                          max: parseInt(e.target.value) || 1000,
                        },
                      })
                    }
                    min="0"
                  />
                </div>
              </div>
            </FilterTab>

            <FilterTab id="status" label="Status" icon={<Users size={16} />}>
              <div className="analytics-filters__checkbox-group">
                {['active', 'completed', 'cancelled', 'draft'].map(status => (
                  <label key={status} className="analytics-filters__checkbox">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleStatus(status)}
                    />
                    <span className="analytics-filters__checkbox-label">
                      {status === 'active'
                        ? 'Aktywne'
                        : status === 'completed'
                          ? 'Zakończone'
                          : status === 'cancelled'
                            ? 'Anulowane'
                            : 'Planowane'}
                    </span>
                  </label>
                ))}
              </div>
            </FilterTab>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="analytics-filters__active">
          <h4>Aktywne filtry:</h4>
          <div className="analytics-filters__active-list">
            {filters.dateRange.start && (
              <span className="analytics-filters__active-filter">
                Od: {formatDate(filters.dateRange.start)}
                <button
                  onClick={() =>
                    updateFilters({
                      dateRange: { ...filters.dateRange, start: null },
                    })
                  }
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.dateRange.end && (
              <span className="analytics-filters__active-filter">
                Do: {formatDate(filters.dateRange.end)}
                <button
                  onClick={() =>
                    updateFilters({
                      dateRange: { ...filters.dateRange, end: null },
                    })
                  }
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filters.eventTypes.map(type => (
              <span key={type} className="analytics-filters__active-filter">
                Typ: {type}
                <button onClick={() => toggleEventType(type)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.locations.map(location => (
              <span key={location} className="analytics-filters__active-filter">
                Lokalizacja: {location}
                <button onClick={() => toggleLocation(location)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            {filters.status.map(status => (
              <span key={status} className="analytics-filters__active-filter">
                Status: {status}
                <button onClick={() => toggleStatus(status)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
