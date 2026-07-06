export interface CityCoordinates {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  country_code?: string;
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  relativeHumidity: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentMax: number;
  apparentMin: number;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
}

export interface WeatherPayload {
  city: CityCoordinates;
  current: CurrentWeatherData;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export interface AlertThresholds {
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

export interface ClimateTrendItem {
  day: number; // day of month (1 to 30)
  dateThisYear: string;
  dateHistorical: string;
  tempMaxThisYear: number;
  tempMaxHistorical: number;
  precipThisYear: number;
  precipHistorical: number;
}

export interface ClimateTrendsPayload {
  city: string;
  periodThisYear: string;
  periodHistorical: string;
  trends: ClimateTrendItem[];
  summary: {
    avgTempThisYear: number;
    avgTempHistorical: number;
    totalPrecipThisYear: number;
    totalPrecipHistorical: number;
    tempAnomaly: number;
    precipAnomaly: number;
  };
}

export interface ActivityRecommendation {
  name: string;
  rating: 'Excellent' | 'Good' | 'Caution' | 'Avoid';
  reason: string;
}

export interface PlanningRecommendationPayload {
  activities: ActivityRecommendation[];
  generalAdvice: string;
  clothingSuggestion: string;
  safetyChecklist: string[];
}
