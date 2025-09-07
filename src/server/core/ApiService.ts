export interface CountryResponse {
  country: string;
}

export class ApiService {
  // private static readonly BASE_URL = 'https://www.sathishsundar.in';
  private static readonly RANDOM_COUNTRIES: string[] = [
    'Canada',
    'Brazil',
    'Japan',
    'Australia',
    'Germany',
    'South Africa',
    'India',
    'France',
    'Mexico',
    'Italy',
    'Egypt',
    'Thailand',
    'Argentina',
    'Spain',
    'Turkey',
  ];

  static async getRandomCountry(): Promise<string> {
    // Commented out API fetch for now - using hardcoded countries
    /*
    try {
      const response = await fetch(`${this.BASE_URL}/wp-json/random-country-api/v1/random`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawText = await response.text();
      console.log('📄 Raw response text:', rawText);

      // Parse the raw text as JSON (don't call response.json() after response.text())
      const data: CountryResponse = JSON.parse(rawText);
      return data.country;
    } catch (error) {
      console.error('Failed to fetch random country:', error);
      // Fallback: return a random country from RANDOM_COUNTRIES
      const countries = ApiService.RANDOM_COUNTRIES;
      if (Array.isArray(countries) && countries.length > 0) {
        const randomIndex = Math.floor(Math.random() * countries.length);
        return countries[randomIndex] || 'Unknown Destination';
      }
      return 'Unknown Destination';
    }
    */

    // Return a random country from hardcoded list
    const countries = ApiService.RANDOM_COUNTRIES;
    if (Array.isArray(countries) && countries.length > 0) {
      const randomIndex = Math.floor(Math.random() * countries.length);
      return countries[randomIndex] || 'Unknown Destination';
    }
    return 'Unknown Destination';
  }
}
