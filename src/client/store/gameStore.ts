import { create } from 'zustand';
import { LocationService, type SelectedLocation } from '../utils/LocationService';

export enum GameState {
  IDLE = 'idle',
  SPINNING = 'spinning',
  ZOOMING = 'zooming',
  RESULT = 'result',
}

interface GameStore {
  currentState: GameState;
  currentLocation: SelectedLocation | null;
  isSpinning: boolean;

  startSpin: () => Promise<void>;
  resetToIdle: () => void;

  setState: (state: GameState) => void;
  setLocation: (location: SelectedLocation | null) => void;
  setSpinning: (isSpinning: boolean) => void;
}
export const useGameStore = create<GameStore>((set, get) => ({
  // set the initial state
  currentState: GameState.IDLE,
  currentLocation: null,
  isSpinning: false,

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
      });
    }, 1000);
  },

  setState: (state: GameState) => set({ currentState: state }),
  setLocation: (location: SelectedLocation | null) => set({ currentLocation: location }),
  setSpinning: (isSpinning: boolean) => set({ isSpinning }),
}));
