import { create } from 'zustand';
import { ItineraryData } from '../../shared/types/api';

export enum GameState {
  IDLE = 'idle',
  SPINNING = 'spinning',
  ZOOMING = 'zooming',
  RESULT = 'result',
  ITINERARY = 'itinerary',
}

interface GameStore {
  currentState: GameState;
  currentCountry: string;
  isSpinning: boolean;
  itinerary: ItineraryData | null;

  startSpin: () => Promise<void>;
  resetToIdle: () => void;
  showItinerary: () => Promise<void>;

  setState: (state: GameState) => void;
  setCountry: (country: string) => void;
  setSpinning: (isSpinning: boolean) => void;
  setItinerary: (itinerary: ItineraryData) => void;
}

/* Remove local ItineraryData, ItineraryDay, and CommunityHighlight interfaces.
   Use the imported ItineraryData type from '../../shared/types/api'. */
export const useGameStore = create<GameStore>((set, get) => ({
  // set the initial state
  currentState: GameState.IDLE,
  currentCountry: '',
  isSpinning: false,
  itinerary: null,

  // actions that change the state

  startSpin: async () => {
    const { isSpinning } = get();
    if (isSpinning) return;

    // Phase 1: Start spinning
    set({
      currentState: GameState.SPINNING,
      isSpinning: true,
    });

    // Get random country while spinning
    try {
      const response = await fetch('/api/random-country');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      set({ currentCountry: data.country || 'Unknown Destination' });
    } catch (error) {
      console.error('Error fetching country:', error);
      set({ currentCountry: 'Unknown Destination' });
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

  showItinerary: async () => {
    const { currentCountry } = get();
    if (!currentCountry) return;

    try {
      const response = await fetch(`/api/itinerary?country=${encodeURIComponent(currentCountry)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      set({
        itinerary: data.itinerary,
        currentState: GameState.ITINERARY,
      });
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      // Set a fallback itinerary
      set({
        itinerary: {
          title: `${currentCountry} Adventure`,
          days: [
            {
              day: 1,
              title: 'Arrival & Exploration',
              description: 'Arrive and explore the local area.',
            },
            {
              day: 2,
              title: 'Cultural Experience',
              description: 'Immerse yourself in local culture.',
            },
            {
              day: 3,
              title: 'Adventure Day',
              description: 'Try exciting local activities.',
            },
          ],
          communityHighlights: [
            {
              username: 'traveler123',
              content: 'Amazing destination! Highly recommend.',
              subreddit: 'travel',
              timeAgo: '2h',
            },
          ],
        },
        currentState: GameState.ITINERARY,
      });
    }
  },

  resetToIdle: () => {
    set({ currentState: GameState.ZOOMING });

    setTimeout(() => {
      set({
        currentState: GameState.IDLE,
        currentCountry: '',
        isSpinning: false,
        itinerary: null,
      });
    }, 1000);
  },

  setState: (state: GameState) => set({ currentState: state }),
  setCountry: (country: string) => set({ currentCountry: country }),
  setSpinning: (isSpinning: boolean) => set({ isSpinning }),
  setItinerary: (itinerary: ItineraryData) => set({ itinerary }),
}));
