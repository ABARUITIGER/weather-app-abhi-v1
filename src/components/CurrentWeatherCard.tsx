import { Wind, Droplets, Thermometer, Cloud, Compass, Navigation } from "lucide-react";
import { CurrentWeatherData, CityCoordinates } from "../types";
import { getWeatherDetails, getWindDirection } from "../utils/weatherHelpers";

interface CurrentWeatherCardProps {
  current: CurrentWeatherData;
  city: CityCoordinates;
}

export default function CurrentWeatherCard({ current, city }: CurrentWeatherCardProps) {
  const weatherDetails = getWeatherDetails(current.weatherCode);
  const WeatherIcon = weatherDetails.icon;

  const localTimeStr = new Date(current.time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-white border border-gray-100 rounded-none overflow-hidden flex flex-col h-full" id="current-weather-card">
      {/* Accent Card Header with Minimalist Styling */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase">
          Current Intelligence / Profile
        </span>
        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
          SYNC: {localTimeStr}
        </span>
      </div>

      <div className="p-6 md:p-8 flex flex-col justify-between flex-grow">
        {/* Main Temperature Hero */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="text-5xl md:text-6xl font-black leading-none tracking-tighter text-slate-900 uppercase">
              {city.name}
            </h2>
            <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mt-1">
              {city.country || "Detected Coordinates"}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-black tracking-wider uppercase border ${weatherDetails.bgColor} ${weatherDetails.textColor}`}>
                <WeatherIcon className="h-3.5 w-3.5" />
                {weatherDetails.label.toUpperCase()}
              </span>
              {current.isDay ? (
                <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-none text-[9px] font-black tracking-widest uppercase">
                  Daylight
                </span>
              ) : (
                <span className="bg-slate-900 text-white px-2.5 py-1 rounded-none text-[9px] font-black tracking-widest uppercase">
                  Night
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-8xl md:text-[110px] font-black leading-none tracking-tighter text-slate-900">
              {Math.round(current.temperature)}°
            </span>
            <span className="text-2xl font-black text-orange-600">C</span>
          </div>
        </div>

        {/* Feels like baseline */}
        <div className="mb-6 p-4 bg-gray-50 border-l-4 border-orange-500 rounded-none flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Thermal Index Correction
          </span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
            Feels Like: {Math.round(current.apparentTemperature)}°C
          </span>
        </div>

        {/* Bento stats grid with sharp borders */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-gray-100 pt-6">
          <div className="bg-gray-50/50 p-3 rounded-none border border-gray-100 flex items-center gap-3">
            <Thermometer className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Apparent</p>
              <p className="text-xs font-black text-slate-800">{current.apparentTemperature}°C</p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-none border border-gray-100 flex items-center gap-3">
            <Droplets className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Humidity</p>
              <p className="text-xs font-black text-slate-800">{current.relativeHumidity}%</p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-none border border-gray-100 flex items-center gap-3">
            <Wind className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Wind Velocity</p>
              <p className="text-xs font-black text-slate-800">{current.windSpeed} km/h</p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-none border border-gray-100 flex items-center gap-3">
            <Compass className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Wind Bearing</p>
              <p className="text-xs font-black text-slate-800 flex items-center gap-1">
                {current.windDirection}° ({getWindDirection(current.windDirection).toUpperCase()})
              </p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-none border border-gray-100 flex items-center gap-3">
            <Cloud className="h-4 w-4 text-orange-500 shrink-0" />
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Cloud Cover</p>
              <p className="text-xs font-black text-slate-800">{current.cloudCover}%</p>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3 rounded-none border border-gray-100 flex items-center gap-3">
            <Navigation className="h-3.5 w-3.5 text-orange-500 shrink-0 rotate-45" />
            <div>
              <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Barometric MSL</p>
              <p className="text-xs font-black text-slate-800">{current.pressure} hPa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
