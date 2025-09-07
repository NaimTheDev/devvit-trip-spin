import { create } from 'zustand';

export enum GameState {
  IDLE = 'idle',
  SPINNING = 'spinning',
  ZOOMING = 'zooming',
  RESULT = 'result',
}

interface GameStore {
  currentState: GameState;
  currentCountry: string;
  isSpinning: boolean;

  startSpin: () => Promise<void>;
  resetToIdle: () => void;

  setState: (state: GameState) => void;
  setCountry: (country: string) => void;
  setSpinning: (isSpinning: boolean) => void;
}
export const useGameStore = create<GameStore>((set, get) => ({
  // set the initial state
  currentState: GameState.IDLE,
  currentCountry: '',
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

  resetToIdle: () => {
    set({ currentState: GameState.ZOOMING });

    setTimeout(() => {
      set({
        currentState: GameState.IDLE,
        currentCountry: '',
        isSpinning: false,
      });
    }, 1000);
  },

  setState: (state: GameState) => set({ currentState: state }),
  setCountry: (country: string) => set({ currentCountry: country }),
  setSpinning: (isSpinning: boolean) => set({ isSpinning }),
}));
