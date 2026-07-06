import React, { useState } from "react";
import { Calendar, Sun, Droplets, Wind, AlertCircle } from "lucide-react";
import { DailyForecastItem } from "../types";
import { getWeatherDetails } from "../utils/weatherHelpers";

interface ForecastSectionProps {
  daily: DailyForecastItem[];
}

export default function ForecastSection({ daily }: ForecastSectionProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  // Find absolute max and min temperatures for the week to draw scale bars
  const weekTempMax = Math.max(...daily.map((d) => d.tempMax));
  const weekTempMin = Math.min(...daily.map((d) => d.tempMin));
  const weekRange = weekTempMax - weekTempMin || 1;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    const dayNum = date.getUTCDate();
    const monthName = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    return { dayName, dateStr: `${monthName} ${dayNum}` };
  };

  const getUVBadgeColor = (uv: number) => {
    if (uv <= 2) return "bg-green-50 text-green-700 border-green-200";
    if (uv <= 5) return "bg-amber-50 text-amber-700 border-amber-200";
    if (uv <= 7) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const activeDay = daily[selectedDayIdx] || daily[0];
  const activeWeather = getWeatherDetails(activeDay.weatherCode);
  const ActiveWeatherIcon = activeWeather.icon;

  return (
    <div className="bg-white border border-gray-100 rounded-none overflow-hidden flex flex-col h-full" id="forecast-section">
      {/* section header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Atmospheric Outlook / 7-Day Intervals
        </span>
        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
          INSPECT TO ARREST VARIABILITY
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
        {/* Day selection list */}
        <div className="lg:col-span-2 space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {daily.map((day, idx) => {
            const { dayName, dateStr } = formatDate(day.date);
            const details = getWeatherDetails(day.weatherCode);
            const Icon = details.icon;

            // Calculate progress bar offsets
            const minPercent = ((day.tempMin - weekTempMin) / weekRange) * 100;
            const maxPercent = ((day.tempMax - weekTempMin) / weekRange) * 100;

            const isSelected = selectedDayIdx === idx;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                className={`w-full text-left p-3.5 rounded-none border flex items-center justify-between gap-4 transition duration-150 group ${
                  isSelected
                    ? "bg-orange-50 border-orange-500 border-l-4"
                    : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                {/* Date & Weekday */}
                <div className="w-16 shrink-0">
                  <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{dayName}</p>
                  <p className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">{dateStr}</p>
                </div>

                {/* Weather icon & label */}
                <div className="flex items-center gap-2.5 w-28 md:w-36 shrink-0">
                  <div className={`p-1 rounded-none border ${details.bgColor}`}>
                    <Icon className={`h-3.5 w-3.5 ${details.textColor}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate group-hover:text-slate-900 transition">
                    {details.label}
                  </span>
                </div>

                {/* Temp slider range visualization */}
                <div className="hidden md:flex flex-grow items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono font-bold w-6 text-right">
                    {Math.round(day.tempMin)}°
                  </span>
                  <div className="relative flex-grow h-1.5 bg-gray-100 rounded-none overflow-hidden">
                    <div
                      className="absolute h-full bg-orange-500"
                      style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-800 font-mono font-black w-6">
                    {Math.round(day.tempMax)}°
                  </span>
                </div>

                {/* Mobile temp simple print */}
                <div className="flex md:hidden text-right flex-col justify-center">
                  <span className="text-xs font-black text-slate-900">
                    {Math.round(day.tempMax)}°
                  </span>
                  <span className="text-[9px] text-gray-400 font-mono">
                    {Math.round(day.tempMin)}°
                  </span>
                </div>

                {/* Precip Prob badge */}
                <div className="w-12 text-right shrink-0">
                  {day.precipitationProbability > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-xs font-mono font-black text-orange-600">
                      <Droplets className="h-3 w-3 text-orange-500" />
                      {day.precipitationProbability}%
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-gray-300">-</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed inspection card for selected day */}
        <div className="bg-gray-50 border border-gray-100 rounded-none p-5 flex flex-col justify-between h-full min-h-[300px]">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">Atmospheric Outlook</p>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {new Date(activeDay.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC"
                  })}
                </h3>
              </div>
              <div className={`p-1.5 rounded-none border ${activeWeather.bgColor}`}>
                <ActiveWeatherIcon className={`h-4 w-4 ${activeWeather.textColor}`} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thermal Bounds</span>
                <span className="text-xs font-mono font-black text-slate-800">
                  {Math.round(activeDay.tempMin)}°C TO {Math.round(activeDay.tempMax)}°C
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Felt Thermal Bounds</span>
                <span className="text-xs font-mono font-bold text-gray-600">
                  {Math.round(activeDay.apparentMin)}°C TO {Math.round(activeDay.apparentMax)}°C
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Precipitation Sum</span>
                <span className="text-xs font-mono font-black text-slate-800">
                  {activeDay.precipitationSum > 0 ? `${activeDay.precipitationSum.toFixed(1)} MM` : "NONE"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Precipitation Risk</span>
                <span className="text-xs font-mono font-black text-slate-800">
                  {activeDay.precipitationProbability}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Peak Wind Speed</span>
                <span className="text-xs font-mono font-black text-slate-800">
                  {activeDay.windSpeedMax} KM/H
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Peak UV Index</span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-none border ${getUVBadgeColor(activeDay.uvIndexMax)}`}>
                  UV {activeDay.uvIndexMax.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4 text-center">
            {activeDay.uvIndexMax > 6 && (
              <div className="border-l-4 border-orange-500 bg-white p-3 shadow-sm text-left flex gap-2.5">
                <Sun className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-[10px] font-bold tracking-tight text-slate-700 uppercase">
                  HIGH ULTRAVIOLET THRESHOLD BREACHED. WEAR PROTECTIVE SCREENING.
                </span>
              </div>
            )}
            {activeDay.precipitationSum > 10 && (
              <div className="border-l-4 border-orange-500 bg-white p-3 shadow-sm text-left flex gap-2.5">
                <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-[10px] font-bold tracking-tight text-slate-700 uppercase">
                  HEAVY ACCUMULATION PREDICTED. CHECK SURFACE DISCHARGE ALERTS.
                </span>
              </div>
            )}
            {activeDay.uvIndexMax <= 6 && activeDay.precipitationSum <= 10 && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">
                Normal range boundaries. Safe outdoor scheduling parameters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
