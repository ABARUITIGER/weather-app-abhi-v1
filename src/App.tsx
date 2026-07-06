import React, { useState, useEffect } from "react";
import { CloudRain, Sparkles, MapPin, Star, Sun, ShieldAlert, RefreshCw, AlertTriangle } from "lucide-react";
import { CityCoordinates, WeatherPayload, PlanningRecommendationPayload, ClimateTrendsPayload, AlertThresholds } from "./types";
import SearchHeader from "./components/SearchHeader";
import CurrentWeatherCard from "./components/CurrentWeatherCard";
import ForecastSection from "./components/ForecastSection";
import ClimateTrends from "./components/ClimateTrends";
import PlanningRecommendations from "./components/PlanningRecommendations";
import AlertSettings from "./components/AlertSettings";

// Default threshold settings
const DEFAULT_THRESHOLDS: AlertThresholds = {
  tempMax: 35,
  tempMin: 3,
  windSpeedMax: 25,
  precipProbMax: 70,
  uvIndexMax: 6,
  enabledAlerts: {
    tempMax: true,
    tempMin: true,
    windSpeedMax: true,
    precipProbMax: true,
    uvIndexMax: true,
  },
};

// Start default city is London, UK
const DEFAULT_CITY: CityCoordinates = {
  name: "London",
  latitude: 51.5074,
  longitude: -0.1278,
  country: "United Kingdom",
};

export default function App() {
  const [currentCity, setCurrentCity] = useState<CityCoordinates>(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
  const [recommendations, setRecommendations] = useState<PlanningRecommendationPayload | null>(null);
  const [trendsData, setTrendsData] = useState<ClimateTrendsPayload | null>(null);

  // Loading States
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);

  // Errors
  const [weatherError, setWeatherError] = useState("");
  const [trendsError, setTrendsError] = useState("");
  const [recsError, setRecsError] = useState("");

  // Favorites & Alerts Thresholds Persisted
  const [savedCities, setSavedCities] = useState<CityCoordinates[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);

  // 1. Initial Load of Saved Cities and Custom Thresholds
  useEffect(() => {
    try {
      const storedCities = localStorage.getItem("weather_intel_favorites");
      if (storedCities) {
        setSavedCities(JSON.parse(storedCities));
      } else {
        // Hydrate with some default standard favorites (Paris, Tokyo, New York)
        const initialFavs: CityCoordinates[] = [
          { name: "Tokyo", latitude: 35.6895, longitude: 139.6917, country: "Japan" },
          { name: "New York", latitude: 40.7128, longitude: -74.006, country: "United States" },
          { name: "London", latitude: 51.5074, longitude: -0.1278, country: "United Kingdom" },
        ];
        setSavedCities(initialFavs);
        localStorage.setItem("weather_intel_favorites", JSON.stringify(initialFavs));
      }

      const storedThresholds = localStorage.getItem("weather_intel_thresholds");
      if (storedThresholds) {
        setThresholds(JSON.parse(storedThresholds));
      }
    } catch (e) {
      console.error("Failed to read localStorage:", e);
    }
  }, []);

  // Sync thresholds to local storage
  const handleUpdateThresholds = (newThresholds: AlertThresholds) => {
    setThresholds(newThresholds);
    localStorage.setItem("weather_intel_thresholds", JSON.stringify(newThresholds));
  };

  // Favorite toggle function
  const handleToggleFavorite = (city: CityCoordinates) => {
    setSavedCities((prev) => {
      const exists = prev.some(
        (c) => c.latitude === city.latitude && c.longitude === city.longitude
      );
      let updated;
      if (exists) {
        updated = prev.filter(
          (c) => !(c.latitude === city.latitude && c.longitude === city.longitude)
        );
      } else {
        updated = [...prev, city];
      }
      localStorage.setItem("weather_intel_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = savedCities.some(
    (c) => c.latitude === currentCity.latitude && c.longitude === currentCity.longitude
  );

  // 2. Fetcher Orchestrator
  const loadWeatherData = async (city: CityCoordinates) => {
    setWeatherLoading(true);
    setWeatherError("");
    setRecommendations(null); // Clear previous
    setTrendsData(null); // Clear previous

    try {
      const nameEnc = encodeURIComponent(city.name);
      const countryEnc = encodeURIComponent(city.country || "");
      const res = await fetch(
        `/api/weather?lat=${city.latitude}&lon=${city.longitude}&name=${nameEnc}&country=${countryEnc}`
      );
      if (!res.ok) throw new Error("Failed to load real-time forecast data");
      const data: WeatherPayload = await res.json();
      setWeatherData(data);

      // Trigger dependent queries (AI Recs and Climate Trends) asynchronously & in parallel
      triggerDependentFetches(data);
    } catch (err: any) {
      console.error(err);
      setWeatherError(err.message || "Failed to load forecast stream. Please try again.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const triggerDependentFetches = (wPayload: WeatherPayload) => {
    // A. Fetch Decadal Trends
    setTrendsLoading(true);
    setTrendsError("");
    const nameEnc = encodeURIComponent(wPayload.city.name);
    fetch(`/api/trends?lat=${wPayload.city.latitude}&lon=${wPayload.city.longitude}&name=${nameEnc}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Historical data baseline unavailable");
        const data = await res.json();
        setTrendsData(data);
      })
      .catch((err) => {
        console.error(err);
        setTrendsError("Historical dataset currently unavailable for these coordinates.");
      })
      .finally(() => {
        setTrendsLoading(false);
      });

    // B. Fetch AI Recommendations
    setRecsLoading(true);
    setRecsError("");
    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weatherData: wPayload }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Weather intelligence engine offline");
        const data = await res.json();
        setRecommendations(data);
      })
      .catch((err) => {
        console.error(err);
        setRecsError("Failed to generate custom AI activity report.");
      })
      .finally(() => {
        setRecsLoading(false);
      });
  };

  // Re-fetch everything on city state change
  useEffect(() => {
    loadWeatherData(currentCity);
  }, [currentCity]);

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans flex flex-col justify-between" id="app-container">
      <div>
        {/* Modular Search Header */}
        <SearchHeader
          currentCity={currentCity}
          onSelectCity={setCurrentCity}
          savedCities={savedCities}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
        />

        {/* Primary Dashboard Panel */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {weatherLoading ? (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-none animate-spin mb-4" />
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Synchronizing atmospheric channels...</p>
            </div>
          ) : weatherError ? (
            <div className="bg-white border border-gray-100 rounded-none p-10 text-center max-w-lg mx-auto my-12">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-4" />
              <h3 className="text-sm font-black tracking-widest uppercase text-slate-800">Atmospheric Sync Failed</h3>
              <p className="text-xs font-bold text-gray-400 uppercase mt-2">{weatherError}</p>
              <button
                type="button"
                onClick={() => loadWeatherData(currentCity)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-none text-xs font-black tracking-widest uppercase transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry connection
              </button>
            </div>
          ) : weatherData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left bento stream (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* 1. Current stats */}
                <div className="h-full">
                  <CurrentWeatherCard current={weatherData.current} city={weatherData.city} />
                </div>

                {/* 2. 7-Day intervals */}
                <div className="h-full">
                  <ForecastSection daily={weatherData.daily} />
                </div>

                {/* 3. Decadal Climate graph */}
                <div className="h-full">
                  <ClimateTrends trendsData={trendsData} loading={trendsLoading} error={trendsError} />
                </div>
              </div>

              {/* Right bento stream (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* 1. Customizable Alert thresholds */}
                <div>
                  <AlertSettings
                    thresholds={thresholds}
                    onUpdateThresholds={handleUpdateThresholds}
                    weatherData={weatherData}
                  />
                </div>

                {/* 2. AI recommendations */}
                <div className="h-full">
                  <PlanningRecommendations
                    recommendations={recommendations}
                    loading={recsLoading}
                    error={recsError}
                    onRefresh={() => triggerDependentFetches(weatherData)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 italic">Search for a city to launch weather intelligence.</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-100 mt-12 py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">
            Weather Intelligence / Decadal Climate Analytics
          </p>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            Open-Meteo Archives &amp; Gemini Synthesizer
          </p>
        </div>
      </footer>
    </div>
  );
}
