import type { WorldClockZone } from "./types";

/**
 * Comprehensive list of major world cities / IANA timezones.
 * Used as the searchable list when adding a new timezone.
 */
export const ALL_TIMEZONES: WorldClockZone[] = [
  // UTC
  { label: "UTC", timezone: "UTC" },

  // Americas
  { label: "Anchorage", timezone: "America/Anchorage" },
  { label: "Los Angeles", timezone: "America/Los_Angeles" },
  { label: "Vancouver", timezone: "America/Vancouver" },
  { label: "Phoenix", timezone: "America/Phoenix" },
  { label: "Denver", timezone: "America/Denver" },
  { label: "Chicago", timezone: "America/Chicago" },
  { label: "Mexico City", timezone: "America/Mexico_City" },
  { label: "New York", timezone: "America/New_York" },
  { label: "Toronto", timezone: "America/Toronto" },
  { label: "Bogota", timezone: "America/Bogota" },
  { label: "Lima", timezone: "America/Lima" },
  { label: "Santiago", timezone: "America/Santiago" },
  { label: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires" },
  { label: "São Paulo", timezone: "America/Sao_Paulo" },
  { label: "Honolulu", timezone: "Pacific/Honolulu" },

  // Europe
  { label: "London", timezone: "Europe/London" },
  { label: "Dublin", timezone: "Europe/Dublin" },
  { label: "Lisbon", timezone: "Europe/Lisbon" },
  { label: "Paris", timezone: "Europe/Paris" },
  { label: "Berlin", timezone: "Europe/Berlin" },
  { label: "Amsterdam", timezone: "Europe/Amsterdam" },
  { label: "Brussels", timezone: "Europe/Brussels" },
  { label: "Madrid", timezone: "Europe/Madrid" },
  { label: "Rome", timezone: "Europe/Rome" },
  { label: "Zurich", timezone: "Europe/Zurich" },
  { label: "Vienna", timezone: "Europe/Vienna" },
  { label: "Stockholm", timezone: "Europe/Stockholm" },
  { label: "Oslo", timezone: "Europe/Oslo" },
  { label: "Warsaw", timezone: "Europe/Warsaw" },
  { label: "Athens", timezone: "Europe/Athens" },
  { label: "Helsinki", timezone: "Europe/Helsinki" },
  { label: "Bucharest", timezone: "Europe/Bucharest" },
  { label: "Istanbul", timezone: "Europe/Istanbul" },
  { label: "Moscow", timezone: "Europe/Moscow" },
  { label: "Kyiv", timezone: "Europe/Kyiv" },

  // Africa
  { label: "Cairo", timezone: "Africa/Cairo" },
  { label: "Lagos", timezone: "Africa/Lagos" },
  { label: "Nairobi", timezone: "Africa/Nairobi" },
  { label: "Johannesburg", timezone: "Africa/Johannesburg" },
  { label: "Casablanca", timezone: "Africa/Casablanca" },

  // Middle East
  { label: "Dubai", timezone: "Asia/Dubai" },
  { label: "Riyadh", timezone: "Asia/Riyadh" },
  { label: "Tehran", timezone: "Asia/Tehran" },

  // Asia
  { label: "Karachi", timezone: "Asia/Karachi" },
  { label: "Mumbai", timezone: "Asia/Kolkata" },
  { label: "Kolkata", timezone: "Asia/Kolkata" },
  { label: "Dhaka", timezone: "Asia/Dhaka" },
  { label: "Bangkok", timezone: "Asia/Bangkok" },
  { label: "Jakarta", timezone: "Asia/Jakarta" },
  { label: "Singapore", timezone: "Asia/Singapore" },
  { label: "Kuala Lumpur", timezone: "Asia/Kuala_Lumpur" },
  { label: "Hong Kong", timezone: "Asia/Hong_Kong" },
  { label: "Shanghai", timezone: "Asia/Shanghai" },
  { label: "Beijing", timezone: "Asia/Shanghai" },
  { label: "Taipei", timezone: "Asia/Taipei" },
  { label: "Seoul", timezone: "Asia/Seoul" },
  { label: "Tokyo", timezone: "Asia/Tokyo" },

  // Oceania
  { label: "Perth", timezone: "Australia/Perth" },
  { label: "Adelaide", timezone: "Australia/Adelaide" },
  { label: "Sydney", timezone: "Australia/Sydney" },
  { label: "Melbourne", timezone: "Australia/Melbourne" },
  { label: "Brisbane", timezone: "Australia/Brisbane" },
  { label: "Auckland", timezone: "Pacific/Auckland" },
];
