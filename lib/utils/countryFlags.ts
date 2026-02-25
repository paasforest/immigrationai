// Country name to flag emoji mapping

const countryFlagMap: Record<string, string> = {
  // African countries
  Nigeria: '🇳🇬',
  Ghana: '🇬🇭',
  Kenya: '🇰🇪',
  'South Africa': '🇿🇦',
  Ethiopia: '🇪🇹',
  Zimbabwe: '🇿🇼',
  Uganda: '🇺🇬',
  Tanzania: '🇹🇿',
  Cameroon: '🇨🇲',
  Senegal: '🇸🇳',
  Rwanda: '🇷🇼',
  Zambia: '🇿🇲',
  Angola: '🇦🇴',
  Mozambique: '🇲🇿',

  // Destinations
  UK: '🇬🇧',
  'United Kingdom': '🇬🇧',
  Canada: '🇨🇦',
  USA: '🇺🇸',
  'United States': '🇺🇸',
  Germany: '🇩🇪',
  UAE: '🇦🇪',
  Australia: '🇦🇺',
  Netherlands: '🇳🇱',
  Ireland: '🇮🇪',
};

export function getCountryFlag(countryName: string): string {
  return countryFlagMap[countryName] || '🌍';
}
