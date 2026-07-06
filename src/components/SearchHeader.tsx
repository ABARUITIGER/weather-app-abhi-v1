import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Star, X, Loader2 } from "lucide-react";
import { CityCoordinates } from "../types";

interface SearchHeaderProps {
  currentCity: CityCoordinates | null;
  onSelectCity: (city: CityCoordinates) => void;
  savedCities: CityCoordinates[];
  onToggleFavorite: (city: CityCoordinates) => void;
  isFavorite: boolean;
}

export default function SearchHeader({
  currentCity,
  onSelectCity,
  savedCities,
  onToggleFavorite,
  isFavorite,
}: SearchHeaderProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CityCoordinates[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search suggestions
  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to load search results");
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error searching for location.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger or direct search on submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      fetchSuggestions(query);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        fetchSuggestions(val);
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
    }
  };

  // Use browser geolocation to detect coordinates and reverse lookup (or query open-meteo using coordinates)
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Open-Meteo geocoding doesn't support reverse geocoding directly via /search,
          // but we can query weather directly or map a default "My Location" tag.
          // Let's call a simple reverse geocoding fallback or set coordinates directly.
          // To make it beautiful, we can use a free reverse-geo API, or simply set it as "My Location"
          const cityPayload: CityCoordinates = {
            name: "My Location",
            latitude: parseFloat(latitude.toFixed(4)),
            longitude: parseFloat(longitude.toFixed(4)),
            country: "Detected Coordinates",
          };
          onSelectCity(cityPayload);
        } catch (err) {
          console.error(err);
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.error(error);
        alert(`Location access denied or unavailable: ${error.message}`);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSelectSuggestion = (city: CityCoordinates) => {
    onSelectCity(city);
    setQuery("");
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <header className="w-full bg-white text-slate-800 border-b border-gray-100" id="app-search-header">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-5 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and Minimal Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
            <div className="w-3 h-3 bg-white"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-orange-600 leading-none">
              WEATHER.INTEL
            </h1>
            <p className="text-gray-400 text-[9px] font-bold tracking-widest mt-1 uppercase">
              REAL-TIME CLIMATE INSIGHTS &amp; OUTDOOR PLANNING
            </p>
          </div>
        </div>

        {/* Search Input and Geolocation Control */}
        <div className="relative flex flex-col gap-2 w-full max-w-md" ref={dropdownRef}>
          <form onSubmit={handleFormSubmit} className="relative flex w-full gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="SEARCH LOCATION..."
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                className="w-full bg-gray-50 text-slate-800 rounded-none py-2 px-4 pl-10 text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 border border-gray-200 transition-shadow placeholder:text-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 text-orange-600 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Quick detect current coordinates */}
            <button
              type="button"
              onClick={handleGeolocation}
              disabled={geoLoading}
              title="Use current location"
              className="bg-gray-50 hover:bg-gray-100 text-slate-800 p-2.5 rounded-none border border-gray-200 transition duration-150 flex items-center justify-center disabled:opacity-50"
            >
              {geoLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
              ) : (
                <MapPin className="h-3.5 w-3.5 text-orange-600" />
              )}
            </button>

            {/* Favorite button for current city */}
            {currentCity && (
              <button
                type="button"
                onClick={() => onToggleFavorite(currentCity)}
                title={isFavorite ? "Remove from favorites" : "Save as favorite"}
                className={`p-2.5 rounded-none border transition duration-150 flex items-center justify-center ${
                  isFavorite
                    ? "bg-orange-500 border-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            )}
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white text-slate-800 shadow-xl rounded-none border border-gray-200 z-50 max-h-60 overflow-y-auto">
              {suggestions.map((city, idx) => (
                <button
                  key={`${city.name}-${city.latitude}-${idx}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(city)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 font-bold tracking-wider text-[10px] uppercase flex items-center justify-between"
                >
                  <div>
                    <span className="font-black text-slate-900">{city.name}</span>
                    {city.admin1 && (
                      <span className="text-gray-500 pl-1">, {city.admin1}</span>
                    )}
                    {city.country && (
                      <span className="text-gray-400 pl-1">({city.country})</span>
                    )}
                  </div>
                  <span className="font-mono text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5">
                    {city.latitude.toFixed(2)}N, {city.longitude.toFixed(2)}E
                  </span>
                </button>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-none border border-red-200 text-[10px] font-bold tracking-wider uppercase">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Global Network indicators */}
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Global Network / Live</p>
          <p className="text-xs font-black text-slate-800">
            {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: false })} GMT
          </p>
        </div>
      </div>

      {/* Quick Access saved favorites bar (Minimal White and Orange Accent) */}
      {savedCities.length > 0 && (
        <div className="bg-gray-50 border-t border-b border-gray-100 px-4 md:px-10 py-2 overflow-x-auto scrollbar-none flex items-center gap-3">
          <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400 shrink-0">
            Favorites /
          </span>
          <div className="flex items-center gap-2">
            {savedCities.map((city) => (
              <button
                key={`${city.name}-${city.latitude}`}
                type="button"
                onClick={() => onSelectCity(city)}
                className={`text-[10px] px-3 py-1 rounded-none font-bold tracking-wider uppercase transition duration-150 shrink-0 flex items-center gap-1.5 border ${
                  currentCity?.name === city.name && currentCity?.latitude === city.latitude
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-700 border-gray-200 hover:border-slate-800 hover:text-slate-900"
                }`}
              >
                <Star className={`h-2.5 w-2.5 ${currentCity?.name === city.name && currentCity?.latitude === city.latitude ? "fill-current" : ""}`} />
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
