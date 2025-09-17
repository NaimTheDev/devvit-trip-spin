import { create } from 'zustand';
import { LocationService, type SelectedLocation } from '../utils/LocationService';
import type { ItineraryPost, ItineraryComment, GeneratedItinerary } from '../../shared/types/api';
import { LoadingAnimation } from '../utils/LoadingAnimation';

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
  shareTrip: (personalMessage?: string) => Promise<{ success: boolean; postUrl?: string }>;

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

    // Show loading animation
    const loadingAnimation = new LoadingAnimation();

    try {
      await loadingAnimation.show();

      // Update loading text
      loadingAnimation.updateText('Searching travel communities...');

      // For testing purposes, create mock data when API is not available
      const mockItinerary: GeneratedItinerary = {
        destination: currentLocation.name || currentLocation.country,
        country: currentLocation.country,
        duration: '3-Day AI Itinerary',
        days: [
          {
            day: 1,
            title: 'Arrival and City Introduction',
            description: 'Explore the iconic landmarks and get oriented with your new destination.',
            activities: [
              'Check into accommodation',
              'Visit main city center',
              'Local orientation walk',
              'Try traditional cuisine',
            ],
          },
          {
            day: 2,
            title: 'Cultural Immersion',
            description: 'Dive deep into the local culture and history.',
            activities: [
              'Museum visits',
              'Historical site tours',
              'Local market exploration',
              'Cultural performances',
            ],
          },
          {
            day: 3,
            title: 'Adventure and Local Life',
            description: 'Experience authentic local activities and hidden gems.',
            activities: [
              'Local workshops',
              'Scenic viewpoints',
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
        loadingAnimation.updateText('Fetching community recommendations...');

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
          loadingAnimation.updateText('Generating your personalized itinerary...');

          // Add a small delay to show the AI generation message
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const data = await response.json();

          // Hide loading animation before setting state
          loadingAnimation.hide();

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
        loadingAnimation.updateText('Creating sample itinerary...');

        // Add delay for mock data too
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Hide loading animation before setting state
      loadingAnimation.hide();

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

      // Make sure to hide loading animation even on error
      loadingAnimation.hide();
    }
  },

  shareTrip: async (personalMessage?: string) => {
    const { currentLocation, generatedItinerary } = get();

    if (!currentLocation || !generatedItinerary) {
      return { success: false };
    }

    try {
      const response = await fetch('/api/share-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: currentLocation.country,
          itinerary: generatedItinerary,
          personalMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success,
          postUrl: data.postUrl,
        };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
      return { success: false };
    }
  },

  setState: (state: GameState) => set({ currentState: state }),
  setLocation: (location: SelectedLocation | null) => set({ currentLocation: location }),
  setSpinning: (isSpinning: boolean) => set({ isSpinning }),
}));
