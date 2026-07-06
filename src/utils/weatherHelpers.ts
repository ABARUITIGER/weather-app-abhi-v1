import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  AlertTriangle,
  LucideIcon
} from "lucide-react";

export interface WeatherCodeDetails {
  label: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
}

// Maps WMO (World Meteorological Organization) weather codes to rich presentation details
export function getWeatherDetails(code: number, isDay: boolean = true): WeatherCodeDetails {
  switch (code) {
    case 0:
      return {
        label: "Clear Sky",
        icon: Sun,
        bgColor: "bg-amber-50/70 border-amber-200",
        textColor: "text-amber-700",
      };
    case 1:
    case 2:
      return {
        label: "Partly Cloudy",
        icon: CloudSun,
        bgColor: "bg-orange-50/70 border-orange-200",
        textColor: "text-orange-700",
      };
    case 3:
      return {
        label: "Overcast",
        icon: Cloud,
        bgColor: "bg-slate-50/70 border-slate-200",
        textColor: "text-slate-700",
      };
    case 45:
    case 48:
      return {
        label: "Foggy",
        icon: CloudFog,
        bgColor: "bg-zinc-50/70 border-zinc-200",
        textColor: "text-zinc-700",
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Drizzle",
        icon: CloudDrizzle,
        bgColor: "bg-sky-50/70 border-sky-200",
        textColor: "text-sky-700",
      };
    case 56:
    case 57:
      return {
        label: "Freezing Drizzle",
        icon: CloudSnow,
        bgColor: "bg-indigo-50/70 border-indigo-200",
        textColor: "text-indigo-700",
      };
    case 61:
    case 63:
    case 65:
      return {
        label: "Rainy",
        icon: CloudRain,
        bgColor: "bg-blue-50/70 border-blue-200",
        textColor: "text-blue-700",
      };
    case 66:
    case 67:
      return {
        label: "Freezing Rain",
        icon: CloudSnow,
        bgColor: "bg-indigo-50/70 border-indigo-200",
        textColor: "text-indigo-700",
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: "Snowfall",
        icon: Snowflake,
        bgColor: "bg-cyan-50/70 border-cyan-200",
        textColor: "text-cyan-700",
      };
    case 80:
    case 81:
    case 82:
      return {
        label: "Rain Showers",
        icon: CloudRain,
        bgColor: "bg-blue-50/70 border-blue-200",
        textColor: "text-blue-700",
      };
    case 85:
    case 86:
      return {
        label: "Snow Showers",
        icon: CloudSnow,
        bgColor: "bg-cyan-50/70 border-cyan-200",
        textColor: "text-cyan-700",
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        icon: CloudLightning,
        bgColor: "bg-red-50/70 border-red-200",
        textColor: "text-red-700",
      };
    default:
      return {
        label: "Unknown Conditions",
        icon: Cloud,
        bgColor: "bg-stone-50/70 border-stone-200",
        textColor: "text-stone-700",
      };
  }
}

// Convert wind degrees to Cardinal Directions
export function getWindDirection(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Evaluate customizable alerts for extreme weather events based on thresholds
export interface EvaluatedAlert {
  type: "tempMax" | "tempMin" | "windSpeedMax" | "precipProbMax" | "uvIndexMax";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  currentValue: number;
  thresholdValue: number;
}

export function evaluateAlerts(
  current: { temperature: number; windSpeed: number },
  todayForecast: { precipitationProbability: number; uvIndexMax: number },
  thresholds: {
    tempMax: number;
    tempMin: number;
    windSpeedMax: number;
    precipProbMax: number;
    uvIndexMax: number;
    enabledAlerts: {
      tempMax: boolean;
      tempMin: boolean;
      windSpeedMax: boolean;
      precipProbMax: boolean;
      uvIndexMax: boolean;
    };
  }
): EvaluatedAlert[] {
  const alerts: EvaluatedAlert[] = [];

  const { enabledAlerts } = thresholds;

  if (enabledAlerts.tempMax && current.temperature > thresholds.tempMax) {
    alerts.push({
      type: "tempMax",
      title: "Excessive Heat Alert",
      description: `Current temperature of ${current.temperature}°C exceeds your maximum threshold of ${thresholds.tempMax}°C.`,
      severity: current.temperature > thresholds.tempMax + 5 ? "critical" : "warning",
      currentValue: current.temperature,
      thresholdValue: thresholds.tempMax,
    });
  }

  if (enabledAlerts.tempMin && current.temperature < thresholds.tempMin) {
    alerts.push({
      type: "tempMin",
      title: "Freezing Cold Warning",
      description: `Current temperature of ${current.temperature}°C is below your minimum threshold of ${thresholds.tempMin}°C.`,
      severity: current.temperature < thresholds.tempMin - 5 ? "critical" : "warning",
      currentValue: current.temperature,
      thresholdValue: thresholds.tempMin,
    });
  }

  if (enabledAlerts.windSpeedMax && current.windSpeed > thresholds.windSpeedMax) {
    alerts.push({
      type: "windSpeedMax",
      title: "High Wind Alert",
      description: `Current wind speed of ${current.windSpeed} km/h exceeds your custom speed threshold of ${thresholds.windSpeedMax} km/h.`,
      severity: current.windSpeed > thresholds.windSpeedMax * 1.5 ? "critical" : "warning",
      currentValue: current.windSpeed,
      thresholdValue: thresholds.windSpeedMax,
    });
  }

  if (enabledAlerts.precipProbMax && todayForecast.precipitationProbability > thresholds.precipProbMax) {
    alerts.push({
      type: "precipProbMax",
      title: "High Precipitation Risk",
      description: `Precipitation probability for today is ${todayForecast.precipitationProbability}%, exceeding your threshold of ${thresholds.precipProbMax}%.`,
      severity: todayForecast.precipitationProbability > 85 ? "warning" : "info",
      currentValue: todayForecast.precipitationProbability,
      thresholdValue: thresholds.precipProbMax,
    });
  }

  if (enabledAlerts.uvIndexMax && todayForecast.uvIndexMax > thresholds.uvIndexMax) {
    alerts.push({
      type: "uvIndexMax",
      title: "Extremely High UV Exposure",
      description: `Today's UV index will reach ${todayForecast.uvIndexMax}, exceeding your safe threshold of ${thresholds.uvIndexMax}.`,
      severity: todayForecast.uvIndexMax > 8 ? "critical" : "warning",
      currentValue: todayForecast.uvIndexMax,
      thresholdValue: thresholds.uvIndexMax,
    });
  }

  return alerts;
}
