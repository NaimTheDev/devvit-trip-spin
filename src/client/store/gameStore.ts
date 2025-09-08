import { create } from 'zustand';
import { LocationService, type SelectedLocation } from '../utils/LocationService';
import type { ItineraryPost, ItineraryComment, GeneratedItinerary } from '../../shared/types/api';

export enum GameState {
  IDLE = 'idle',
  SPINNING = 'spinning',
  ZOOMING = 'zooming',
  RESULT = 'result',
  ITINERARY = 'itinerary',
}

interface GameStore {
  currentState: GameState;
  currentLocation: SelectedLocation | null;
  isSpinning: boolean;
  itineraryPosts: ItineraryPost[];
  itineraryComments: ItineraryComment[];
  generatedItinerary: GeneratedItinerary | null;
  subredditUsed: string;

  startSpin: () => Promise<void>;
  resetToIdle: () => void;
  getItinerary: () => Promise<void>;

  setState: (state: GameState) => void;
  setLocation: (location: SelectedLocation | null) => void;
  setSpinning: (isSpinning: boolean) => void;
}
export const useGameStore = create<GameStore>((set, get) => ({
  // set the initial state
  currentState: GameState.IDLE,
  currentLocation: null,
  isSpinning: false,
  itineraryPosts: [],
  itineraryComments: [],
  generatedItinerary: null,
  subredditUsed: '',

  // actions that change the state

  startSpin: async () => {
    const { isSpinning } = get();
    if (isSpinning) return;

    // Phase 1: Start spinning
    set({
      currentState: GameState.SPINNING,
      isSpinning: true,
    });

    // Get random location from local dataset while spinning
    try {
      const locationService = LocationService.getInstance();

      // Ensure locations are loaded
      if (!locationService.isDataLoaded()) {
        await locationService.loadLocations();
      }

      const selectedLocation = locationService.getRandomLocation();
      set({ currentLocation: selectedLocation });

      console.log('Selected location:', selectedLocation);
    } catch (error) {
      console.error('Error selecting location:', error);
      set({
        currentLocation: {
          name: 'Unknown Destination',
          country: 'Unknown',
          latitude: 0,
          longitude: 0,
          population: 0,
        },
      });
    }

    // Phase 2: Zooming (after 2 seconds)
    setTimeout(() => {
      set({ currentState: GameState.ZOOMING });

      // Phase 3: Show result (after zoom completes)
      setTimeout(() => {
        set({
          currentState: GameState.RESULT,
          isSpinning: false,
        });
      }, 1500);
    }, 2000);
  },

  resetToIdle: () => {
    set({ currentState: GameState.ZOOMING });

    setTimeout(() => {
      set({
        currentState: GameState.IDLE,
        currentLocation: null,
        isSpinning: false,
        itineraryPosts: [],
        itineraryComments: [],
        generatedItinerary: null,
        subredditUsed: '',
      });
    }, 1000);
  },

  getItinerary: async () => {
    const { currentLocation } = get();
    if (!currentLocation) return;

    try {
      // For testing purposes, create mock data when API is not available
      const mockItinerary: GeneratedItinerary = {
        destination: currentLocation.name || currentLocation.country,
        country: currentLocation.country,
        duration: '3-Day AI Itinerary',
        days: [
          {
            day: 1,
            title: 'Explore Historic Center and Culture',
            description:
              'Immerse yourself in the rich history and vibrant culture of this amazing destination.',
            activities: [
              'Visit historic landmarks',
              'Try local cuisine',
              'Explore museums',
              'Walk through old town',
            ],
          },
          {
            day: 2,
            title: 'Natural Wonders and Scenic Views',
            description:
              'Discover the natural beauty and breathtaking landscapes that make this place special.',
            activities: [
              'Nature hiking',
              'Scenic viewpoints',
              'Local markets',
              'Cultural performances',
            ],
          },
          {
            day: 3,
            title: 'Adventure and Local Experiences',
            description: 'Experience authentic local life and create unforgettable memories.',
            activities: [
              'Adventure activities',
              'Local workshops',
              'Traditional crafts',
              'Community visits',
            ],
          },
        ],
        communityHighlights: [
          'This place has amazing sunsets - definitely visit the waterfront!',
          'The local food scene is incredible, try the traditional dishes at the market.',
          'Great for photography, especially the historic architecture.',
        ],
      };

      // Try to fetch from API first, but fall back to mock data
      try {
        const response = await fetch('/api/itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            country: currentLocation.country,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          set({
            currentState: GameState.ITINERARY,
            itineraryPosts: data.posts,
            itineraryComments: data.comments,
            generatedItinerary: data.generatedItinerary,
            subredditUsed: data.subredditUsed,
          });
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data for testing');
      }

      // Use mock data when API is not available
      set({
        currentState: GameState.ITINERARY,
        itineraryPosts: [],
        itineraryComments: [],
        generatedItinerary: mockItinerary,
        subredditUsed: `${currentLocation.country.toLowerCase()}travel`,
      });
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    }
  },

  setState: (state: GameState) => set({ currentState: state }),
  setLocation: (location: SelectedLocation | null) => set({ currentLocation: location }),
  setSpinning: (isSpinning: boolean) => set({ isSpinning }),
}));
