import React, { useState } from "react";
import { AlertTriangle, Bell, BellOff, Info, Check, ShieldAlert } from "lucide-react";
import { AlertThresholds, WeatherPayload } from "../types";
import { evaluateAlerts } from "../utils/weatherHelpers";

interface AlertSettingsProps {
  thresholds: AlertThresholds;
  onUpdateThresholds: (thresholds: AlertThresholds) => void;
  weatherData: WeatherPayload | null;
}

export default function AlertSettings({
  thresholds,
  onUpdateThresholds,
  weatherData,
}: AlertSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMax, setTempMax] = useState(thresholds.tempMax);
  const [tempMin, setTempMin] = useState(thresholds.tempMin);
  const [windSpeedMax, setWindSpeedMax] = useState(thresholds.windSpeedMax);
  const [precipProbMax, setPrecipProbMax] = useState(thresholds.precipProbMax);
  const [uvIndexMax, setUvIndexMax] = useState(thresholds.uvIndexMax);

  const [enabledAlerts, setEnabledAlerts] = useState(thresholds.enabledAlerts);

  const handleToggleAlert = (key: keyof AlertThresholds["enabledAlerts"]) => {
    setEnabledAlerts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onUpdateThresholds({
      tempMax,
      tempMin,
      windSpeedMax,
      precipProbMax,
      uvIndexMax,
      enabledAlerts,
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    setTempMax(35);
    setTempMin(3);
    setWindSpeedMax(25);
    setPrecipProbMax(70);
    setUvIndexMax(6);
    setEnabledAlerts({
      tempMax: true,
      tempMin: true,
      windSpeedMax: true,
      precipProbMax: true,
      uvIndexMax: true,
    });
  };

  // Evaluate current alerts
  const activeAlerts =
    weatherData && weatherData.current && weatherData.daily && weatherData.daily[0]
      ? evaluateAlerts(
          {
            temperature: weatherData.current.temperature,
            windSpeed: weatherData.current.windSpeed,
          },
          {
            precipitationProbability: weatherData.daily[0].precipitationProbability,
            uvIndexMax: weatherData.daily[0].uvIndexMax,
          },
          {
            tempMax,
            tempMin,
            windSpeedMax,
            precipProbMax,
            uvIndexMax,
            enabledAlerts,
          }
        )
      : [];

  return (
    <div className="bg-white border border-gray-100 rounded-none overflow-hidden flex flex-col h-full" id="alert-settings-card">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Alert Threshold Controls
        </span>
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-none border transition ${
            isEditing
              ? "bg-orange-500 border-orange-500 text-white hover:bg-orange-600"
              : "bg-white border-gray-200 text-slate-800 hover:text-orange-600 hover:border-orange-500"
          }`}
        >
          {isEditing ? "Apply Settings" : "Configure Thresholds"}
        </button>
      </div>

      <div className="p-5 flex flex-col gap-5 flex-grow justify-between">
        {/* Real-time Alert Banner Display */}
        <div>
          <h4 className="text-[9px] font-black tracking-widest uppercase text-gray-400 mb-2.5">
            Real-Time Anomaly Audit
          </h4>
          {activeAlerts.length > 0 ? (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {activeAlerts.map((alert) => {
                const isCritical = alert.severity === "critical";
                const isWarning = alert.severity === "warning";
                
                let borderStyle = "border-l-4 border-l-blue-500 border-blue-200 bg-blue-50/40 text-blue-800";
                if (isCritical) {
                  borderStyle = "border-l-4 border-l-red-600 border-red-200 bg-red-50/40 text-red-900";
                } else if (isWarning) {
                  borderStyle = "border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/40 text-amber-900";
                }

                return (
                  <div
                    key={alert.type}
                    className={`p-3.5 border rounded-none flex gap-2.5 items-start ${borderStyle}`}
                  >
                    <ShieldAlert className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${
                      isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-blue-600"
                    }`} />
                    <div>
                      <h5 className="text-xs font-black tracking-tight uppercase">
                        {alert.title} {isCritical ? "(CRITICAL)" : ""}
                      </h5>
                      <p className="text-[11px] font-bold text-slate-700 uppercase mt-0.5 leading-relaxed">
                        {alert.description}
                      </p>
                      <p className="text-[9px] font-mono font-bold text-gray-400 mt-1 uppercase">
                        Measured: {alert.currentValue} | Threshold: {alert.thresholdValue}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-orange-50/30 border border-orange-100 rounded-none p-4 flex gap-3 items-center">
              <div className="h-6 w-6 bg-orange-150 rounded-none flex items-center justify-center text-orange-600 shrink-0">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div>
                <h5 className="text-xs font-black tracking-wide text-orange-800 uppercase">
                  All Systems Operating Normally
                </h5>
                <p className="text-[11px] text-gray-500 font-bold uppercase mt-0.5">
                  No atmospheric indices exceed your custom limits.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Configurations list */}
        <div className="border-t border-gray-100 pt-4 flex-grow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[9px] font-black tracking-widest uppercase text-gray-400">
              Trigger Definitions
            </h4>
            {isEditing && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[9px] font-black tracking-widest uppercase text-gray-400 hover:text-orange-600"
              >
                Reset Defaults
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Max Temp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-none hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleToggleAlert("tempMax")}
                  className={`p-1 rounded-none border ${
                    enabledAlerts.tempMax
                      ? "text-orange-600 border-orange-200 bg-orange-50"
                      : "text-gray-300 border-gray-100 bg-gray-50"
                  }`}
                >
                  {enabledAlerts.tempMax ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <span className="text-xs font-black text-slate-800 block uppercase tracking-tight">
                    Excessive Temperature Threshold
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    Flags conditions breaching maximum safe values.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <input
                  type="number"
                  disabled={!isEditing || !enabledAlerts.tempMax}
                  value={tempMax}
                  onChange={(e) => setTempMax(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-gray-200 text-center rounded-none py-1 px-1.5 text-xs font-mono disabled:opacity-55 focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-800 font-mono font-black">°C</span>
              </div>
            </div>

            {/* Min Temp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-none hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleToggleAlert("tempMin")}
                  className={`p-1 rounded-none border ${
                    enabledAlerts.tempMin
                      ? "text-orange-600 border-orange-200 bg-orange-50"
                      : "text-gray-300 border-gray-100 bg-gray-50"
                  }`}
                >
                  {enabledAlerts.tempMin ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <span className="text-xs font-black text-slate-800 block uppercase tracking-tight">
                    Freezing Temperature Threshold
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    Alerts on low frost indices or subzero plunge.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <input
                  type="number"
                  disabled={!isEditing || !enabledAlerts.tempMin}
                  value={tempMin}
                  onChange={(e) => setTempMin(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-gray-200 text-center rounded-none py-1 px-1.5 text-xs font-mono disabled:opacity-55 focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-800 font-mono font-black">°C</span>
              </div>
            </div>

            {/* Wind velocity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-none hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleToggleAlert("windSpeedMax")}
                  className={`p-1 rounded-none border ${
                    enabledAlerts.windSpeedMax
                      ? "text-orange-600 border-orange-200 bg-orange-50"
                      : "text-gray-300 border-gray-100 bg-gray-50"
                  }`}
                >
                  {enabledAlerts.windSpeedMax ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <span className="text-xs font-black text-slate-800 block uppercase tracking-tight">
                    High Wind Velocity Limit
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    Flags wind limits threatening external safe activities.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <input
                  type="number"
                  disabled={!isEditing || !enabledAlerts.windSpeedMax}
                  value={windSpeedMax}
                  onChange={(e) => setWindSpeedMax(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-gray-200 text-center rounded-none py-1 px-1.5 text-xs font-mono disabled:opacity-55 focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-800 font-mono font-black">KM/H</span>
              </div>
            </div>

            {/* Precipitation probability */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-none hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleToggleAlert("precipProbMax")}
                  className={`p-1 rounded-none border ${
                    enabledAlerts.precipProbMax
                      ? "text-orange-600 border-orange-200 bg-orange-50"
                      : "text-gray-300 border-gray-100 bg-gray-50"
                  }`}
                >
                  {enabledAlerts.precipProbMax ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <span className="text-xs font-black text-slate-800 block uppercase tracking-tight">
                    Precipitation Probability Cap
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    Triggers warning if rainfall risk climbs above values.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <input
                  type="number"
                  disabled={!isEditing || !enabledAlerts.precipProbMax}
                  value={precipProbMax}
                  onChange={(e) => setPrecipProbMax(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-gray-200 text-center rounded-none py-1 px-1.5 text-xs font-mono disabled:opacity-55 focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-800 font-mono font-black">%</span>
              </div>
            </div>

            {/* UV Index */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-none hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleToggleAlert("uvIndexMax")}
                  className={`p-1 rounded-none border ${
                    enabledAlerts.uvIndexMax
                      ? "text-orange-600 border-orange-200 bg-orange-50"
                      : "text-gray-300 border-gray-100 bg-gray-50"
                  }`}
                >
                  {enabledAlerts.uvIndexMax ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
                <div>
                  <span className="text-xs font-black text-slate-800 block uppercase tracking-tight">
                    Peak Ultraviolet Cap
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                    Flags UV ranges requiring defensive screening.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <input
                  type="number"
                  disabled={!isEditing || !enabledAlerts.uvIndexMax}
                  value={uvIndexMax}
                  onChange={(e) => setUvIndexMax(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-white border border-gray-200 text-center rounded-none py-1 px-1.5 text-xs font-mono disabled:opacity-55 focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-800 font-mono font-black">UV</span>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-gray-100 border border-gray-200 p-2.5 rounded-none text-[9px] font-bold uppercase tracking-wider text-gray-500 flex gap-1.5">
            <Info className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
            <span>Apply settings to commit thresholds. Anomalies evaluate automatically against forecasts.</span>
          </div>
        )}
      </div>
    </div>
  );
}
