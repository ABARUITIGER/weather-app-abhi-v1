import React, { useState } from "react";
import {
  TrendingUp,
  Thermometer,
  CloudRain,
  HelpCircle,
  TrendingDown,
  Info
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { ClimateTrendsPayload } from "../types";

interface ClimateTrendsProps {
  trendsData: ClimateTrendsPayload | null;
  loading: boolean;
  error: string;
}

export default function ClimateTrends({ trendsData, loading, error }: ClimateTrendsProps) {
  const [activeTab, setActiveTab] = useState<"temperature" | "precipitation">("temperature");

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-none p-10 flex flex-col items-center justify-center min-h-[350px]">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-none animate-spin mb-4" />
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400">RECONSTRUCTING DECADAL CLIMATE BASELINE...</p>
      </div>
    );
  }

  if (error || !trendsData) {
    return (
      <div className="bg-white border border-gray-100 rounded-none p-10 flex flex-col items-center justify-center min-h-[350px] text-center">
        <Info className="h-8 w-8 text-orange-500 mb-3" />
        <p className="text-xs font-black tracking-widest uppercase text-slate-800">Historical Archive Unavailable</p>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-2 max-w-sm">
          {error || "Could not retrieve historical data. Open-Meteo Archive has limited region depth."}
        </p>
      </div>
    );
  }

  const { trends, summary, periodThisYear, periodHistorical } = trendsData;

  const isTempWarmAnomaly = summary.tempAnomaly > 0;
  const isPrecipWetAnomaly = summary.precipAnomaly > 0;

  return (
    <div className="bg-white border border-gray-100 rounded-none overflow-hidden flex flex-col h-full" id="climate-trends-card">
      {/* Card Header with tabs */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Historical Anomaly Trends
        </span>
        <div className="flex border border-gray-200 rounded-none p-0.5 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("temperature")}
            className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-none transition ${
              activeTab === "temperature"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-slate-800"
            }`}
          >
            Temperature
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("precipitation")}
            className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-none transition ${
              activeTab === "precipitation"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-slate-800"
            }`}
          >
            Precipitation
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between gap-6">
        {/* Core Climate Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50/50 p-4 rounded-none border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">Comparing Periods</p>
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider mt-1.5">
                {periodThisYear} vs {periodHistorical}
              </p>
            </div>
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase mt-4 leading-normal">
              Analyzing daily maximum temperatures and precipitation totals over the past month.
            </p>
          </div>

          {/* Temperature anomaly */}
          <div className="bg-gray-50/50 p-4 rounded-none border border-gray-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">Mean Max Temp</p>
                <p className="text-lg font-black text-slate-800 mt-1.5">
                  {summary.avgTempThisYear}°C <span className="text-xs font-bold text-gray-400">({summary.avgTempHistorical}°C Hist)</span>
                </p>
              </div>
              <Thermometer className="h-4 w-4 text-orange-500" />
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              {isTempWarmAnomaly ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-none bg-orange-500 text-white text-[9px] font-black tracking-widest uppercase">
                  +{summary.tempAnomaly}°C Warm Anomaly
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-none bg-blue-600 text-white text-[9px] font-black tracking-widest uppercase">
                  {summary.tempAnomaly}°C Cool Anomaly
                </span>
              )}
            </div>
          </div>

          {/* Precipitation anomaly */}
          <div className="bg-gray-50/50 p-4 rounded-none border border-gray-100 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-gray-400">Precipitation Sum</p>
                <p className="text-lg font-black text-slate-800 mt-1.5">
                  {summary.totalPrecipThisYear} mm <span className="text-xs font-bold text-gray-400">({summary.totalPrecipHistorical} mm Hist)</span>
                </p>
              </div>
              <CloudRain className="h-4 w-4 text-orange-500" />
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              {isPrecipWetAnomaly ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-none bg-orange-500 text-white text-[9px] font-black tracking-widest uppercase">
                  +{summary.precipAnomaly} mm Wetter
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-none bg-amber-600 text-white text-[9px] font-black tracking-widest uppercase">
                  {summary.precipAnomaly} mm Drier
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 w-full mt-2">
          {activeTab === "temperature" ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `DAY ${val}`}
                  label={{ value: "DAY OF MONTH", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 9, fontWeight: "900", letterSpacing: "0.1em" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                  unit="°"
                />
                <Tooltip
                  contentStyle={{ background: "#ffffff", borderRadius: "0px", border: "1px solid #111111", fontFamily: "monospace" }}
                  labelFormatter={(value) => `DAY ${value}`}
                  formatter={(value: any) => [`${value}°C`]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" }}
                />
                <Line
                  type="monotone"
                  dataKey="tempMaxThisYear"
                  name={`${periodThisYear}`}
                  stroke="#ea580c"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="tempMaxHistorical"
                  name={`${periodHistorical}`}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `DAY ${val}`}
                  label={{ value: "DAY OF MONTH", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 9, fontWeight: "900", letterSpacing: "0.1em" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                  unit="mm"
                />
                <Tooltip
                  contentStyle={{ background: "#ffffff", borderRadius: "0px", border: "1px solid #111111", fontFamily: "monospace" }}
                  labelFormatter={(value) => `DAY ${value}`}
                  formatter={(value: any) => [`${value} mm`]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em" }}
                />
                <Bar
                  dataKey="precipThisYear"
                  name={`${periodThisYear}`}
                  fill="#ea580c"
                  maxBarSize={15}
                />
                <Bar
                  dataKey="precipHistorical"
                  name={`${periodHistorical}`}
                  fill="#94a3b8"
                  maxBarSize={15}
                  opacity={0.5}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
