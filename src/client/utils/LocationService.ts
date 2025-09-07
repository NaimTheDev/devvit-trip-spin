interface LocationFeature {
  type: string;
  properties: {
    name: string;
    nameascii: string;
    adm0name: string; // Country name
    adm1name: string; // State/Province name
    latitude: number;
    longitude: number;
    pop_max: number;
    featurecla: string;
    iso_a2: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface LocationData {
  type: string;
  features: LocationFeature[];
}

export interface SelectedLocation {
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  population: number;
}

export class LocationService {
  private static instance: LocationService;
  private locations: LocationFeature[] = [];
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public async loadLocations(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const response = await fetch('/datasets/ne_110m_populated_places_simple.geojson');
      if (!response.ok) {
        throw new Error(`Failed to load locations: ${response.statusText}`);
      }
      
      const data: LocationData = await response.json();
      this.locations = data.features;
      this.isLoaded = true;
      
      console.log(`Loaded ${this.locations.length} locations from dataset`);
    } catch (error) {
      console.error('Error loading locations:', error);
      throw error;
    }
  }

  public getRandomLocation(): SelectedLocation {
    if (!this.isLoaded || this.locations.length === 0) {
      throw new Error('Locations not loaded. Call loadLocations() first.');
    }

    // Filter for interesting places (capitals, major cities, etc.)
    const significantPlaces = this.locations.filter(location => {
      const props = location.properties;
      return (
        props.featurecla.includes('capital') ||
        props.featurecla.includes('Populated place') ||
        props.pop_max > 500000 // Cities with population > 500k
      );
    });

    // Use all locations if no significant places found
    const locationPool = significantPlaces.length > 0 ? significantPlaces : this.locations;
    
    if (locationPool.length === 0) {
      throw new Error('No locations available');
    }
    
    const randomIndex = Math.floor(Math.random() * locationPool.length);
    const selectedFeature = locationPool[randomIndex];
    
    if (!selectedFeature) {
      throw new Error('Failed to select a location');
    }
    
    const props = selectedFeature.properties;

    return {
      name: props.nameascii || props.name,
      country: props.adm0name,
      region: props.adm1name,
      latitude: props.latitude,
      longitude: props.longitude,
      population: props.pop_max || 0
    };
  }

  public getLocationCount(): number {
    return this.locations.length;
  }

  public isDataLoaded(): boolean {
    return this.isLoaded;
  }
}
