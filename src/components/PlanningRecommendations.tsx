import React, { useState } from "react";
import {
  Sparkles,
  CheckSquare,
  Square,
  ShieldAlert,
  Shirt,
  Compass,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { PlanningRecommendationPayload } from "../types";

interface RecommendationsProps {
  recommendations: PlanningRecommendationPayload | null;
  loading: boolean;
  error: string;
  onRefresh: () => void;
}

export default function PlanningRecommendations({
  recommendations,
  loading,
  error,
  onRefresh,
}: RecommendationsProps) {
  // Local state for checking off safety items
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheckItem = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getRatingStyle = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "excellent":
        return {
          badge: "bg-orange-600 text-white border-orange-600",
          ring: "border-l-4 border-l-orange-500",
        };
      case "good":
        return {
          badge: "bg-orange-100 text-orange-800 border-orange-200",
          ring: "border-l-4 border-l-orange-300",
        };
      case "caution":
        return {
          badge: "bg-gray-100 text-slate-800 border-gray-200",
          ring: "border-l-4 border-l-gray-400",
        };
      case "avoid":
        return {
          badge: "bg-red-600 text-white border-red-600",
          ring: "border-l-4 border-l-red-500",
        };
      default:
        return {
          badge: "bg-white text-slate-700 border-gray-200",
          ring: "border-l-4 border-l-gray-300",
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-none p-10 flex flex-col items-center justify-center min-h-[350px]">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-none animate-spin mb-4" />
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400">ANALYZING ATMOSPHERIC INTERVALS...</p>
      </div>
    );
  }

  if (error || !recommendations) {
    return (
      <div className="bg-white border border-gray-100 rounded-none p-10 flex flex-col items-center justify-center min-h-[350px] text-center">
        <Sparkles className="h-8 w-8 text-orange-500 mb-3" />
        <p className="text-xs font-black tracking-widest uppercase text-slate-800">Intelligence Engine Standby</p>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-2 max-w-sm">
          {error || "Could not generate AI planning recommendations."}
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-none text-xs font-black tracking-widest uppercase transition"
        >
          FORCE GENERATE ADVICE
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-none overflow-hidden flex flex-col h-full" id="weather-intelligence-recommendations">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          Planning Recommendations
        </span>
        <button
          type="button"
          onClick={onRefresh}
          className="text-[10px] font-black tracking-widest uppercase bg-white border border-gray-200 text-slate-800 hover:text-orange-600 hover:border-orange-500 px-3 py-1.5 rounded-none transition"
        >
          Recalculate
        </button>
      </div>

      <div className="p-5 flex flex-col gap-5 flex-grow justify-between">
        {/* General Advice */}
        <div className="bg-orange-50/50 border border-orange-150 rounded-none p-4 flex gap-3">
          <Lightbulb className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[10px] font-black tracking-wider uppercase text-orange-800">Synthesized Climate Advisory</h4>
            <p className="text-xs font-bold leading-relaxed text-slate-700 mt-1 uppercase">
              {recommendations.generalAdvice}
            </p>
          </div>
        </div>

        {/* Activity suitability grid */}
        <div>
          <h4 className="text-[9px] font-black tracking-widest uppercase text-gray-400 mb-3">
            Atmospheric Compatibility Ratings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.activities.map((act) => {
              const styles = getRatingStyle(act.rating);
              return (
                <div
                  key={act.name}
                  className={`p-3.5 bg-white border border-gray-100 rounded-none shadow-sm hover:border-orange-400 transition duration-150 flex flex-col justify-between ${styles.ring}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <span className="text-xs font-black tracking-tight text-slate-800 uppercase">
                      {act.name}
                    </span>
                    <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-none border uppercase ${styles.badge}`}>
                      {act.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal italic">
                    {act.reason}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clothing and interactive safety checklist split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-100 pt-5">
          {/* Clothing Layer guide */}
          <div className="flex flex-col justify-between h-full">
            <div>
              <h4 className="text-[9px] font-black tracking-widest uppercase text-gray-400 flex items-center gap-1.5 mb-3">
                <Shirt className="h-3.5 w-3.5 text-orange-600" />
                LAYER GUIDANCE
              </h4>
              <p className="text-[11px] text-slate-700 font-bold uppercase leading-relaxed bg-gray-50 p-4 rounded-none border border-gray-100">
                {recommendations.clothingSuggestion}
              </p>
            </div>
            <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase mt-3">
              *Calibrated dynamically using feels-like index.
            </p>
          </div>

          {/* Checklist */}
          <div>
            <h4 className="text-[9px] font-black tracking-widest uppercase text-gray-400 flex items-center gap-1.5 mb-3">
              <CheckCircle className="h-3.5 w-3.5 text-orange-600" />
              SAFETY CHECKS
            </h4>
            <div className="space-y-1.5 bg-gray-50/50 p-3 rounded-none border border-gray-100">
              {recommendations.safetyChecklist.map((item, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <button
                    key={`${item}-${idx}`}
                    type="button"
                    onClick={() => toggleCheckItem(idx)}
                    className="w-full text-left p-2 rounded-none hover:bg-white border border-transparent hover:border-gray-100 transition duration-150 flex items-start gap-2.5 group"
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400 group-hover:text-orange-500 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-[11px] font-bold uppercase leading-tight ${isChecked ? "line-through text-gray-400" : "text-slate-700"}`}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
