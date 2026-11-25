export interface AuthUser {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  mobileNumber?: string | null;
  role: string;
}

export interface FarmerProfile {
  id: number;
  userId: number;
  fullName: string;
  age?: number | null;
  gender?: string | null;
  state?: string | null;
  district?: string | null;
  village?: string | null;
  farmerCategory?: string | null;
  landHoldingAcres?: string | null;
  mainCrop?: string | null;
  irrigationAvailability?: string | null;
  farmingType?: string | null;
}

export interface EligibilityRules {
  states?: string[];
  farmerCategories?: string[];
  maxLandAcres?: number;
  minLandAcres?: number;
  farmingTypes?: string[];
  notes: string[];
}

export const INDIAN_STATES: readonly string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export interface Scheme {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  governmentLevel: 'Central' | 'State' | string;
  stateName: string;
  category: string;
  targetCategories: string[];
  overview: string;
  objectives: string[];
  benefits: string;
  eligibilitySummary: string;
  eligibilityRules: EligibilityRules;
  requiredDocuments: string[];
  applicationProcedure: string[];
  officialUrl: string;
  logoUrl?: string | null;
  lastVerifiedDate: string;
  isPopular: boolean;
}

export interface AgricultureItem {
  id: number;
  slug: string;
  section: 'crop' | 'soil' | 'animal' | 'organic' | 'inorganic' | 'technology' | string;
  title: string;
  subtitle: string;
  summary: string;
  imageUrl?: string | null;
  details: Record<string, string>;
  highlights: string[];
}

export interface EligibilityResult {
  schemeId: number;
  slug: string;
  schemeName: string;
  shortName: string;
  officialUrl: string;
  status: 'eligible' | 'not_eligible' | 'more_info';
  headline: string;
  reasons: string[];
  missingFields: string[];
  notes: string[];
}

export interface RecommendationItem {
  scheme: Scheme;
  score: number;
  reasons: string[];
}

export interface AssistantNavLink {
  label: string;
  path: string;
  category?: string;
}

export interface ChatMessageItem {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  links?: AssistantNavLink[];
  createdAt?: string;
}

export interface WebsiteSearchPageItem {
  title: string;
  description: string;
  path: string;
  category: string;
}

export interface WebsiteSearchResults {
  query: string;
  pages: WebsiteSearchPageItem[];
  schemes: Scheme[];
  agriculture: AgricultureItem[];
}

export interface WeatherAdvisory {
  activity: string;
  status: 'Optimal' | 'Caution' | 'Avoid';
  guidance: string;
}

export interface WeatherHourlyItem {
  timeLabel: string;
  temperatureC: number | null;
  conditionText: string;
  iconUri?: string | null;
  rainProbability: number;
  windKmh: number | null;
}

export interface WeatherDailyItem {
  dateLabel: string;
  dayName: string;
  conditionText: string;
  iconUri?: string | null;
  maxTempC: number | null;
  minTempC: number | null;
  rainProbability: number;
  precipitationMm: number;
  windKmh: number | null;
}

export interface WeatherReport {
  locationName: string;
  latitude: number;
  longitude: number;
  observedAt: string;
  isDaytime: boolean;
  current: {
    temperatureC: number | null;
    feelsLikeC: number | null;
    humidity: number | null;
    windSpeedKmh: number | null;
    windDirection: string;
    rainProbability: number;
    precipitationMm: number;
    uvIndex: number | null;
    cloudCover: number | null;
    thunderstormProbability: number;
    conditionText: string;
    iconUri?: string | null;
  };
  advisories: WeatherAdvisory[];
  hourly: WeatherHourlyItem[];
  daily: WeatherDailyItem[];
}

export interface AgriPlaceItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  primaryType?: string | null;
  businessStatus?: string | null;
  googleMapsUri?: string | null;
  directionsUri?: string | null;
}

