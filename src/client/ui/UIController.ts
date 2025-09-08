import { GameState } from '../store/gameStore';
import { ItineraryView } from './ItineraryView';
import { ItineraryData } from '../../shared/types/api';

interface GameStoreState {
  currentState: GameState;
  currentCountry: string;
  isSpinning: boolean;
  itinerary: ItineraryData | null;
}

export class UIController {
  private titleElement!: HTMLElement;
  private buttonElement!: HTMLButtonElement;
  private diceIcon!: HTMLElement;
  private spinText!: HTMLElement;
  private overlay!: HTMLElement;
  private itineraryView: ItineraryView;

  constructor() {
    this.initializeElements();
    this.itineraryView = new ItineraryView();
  }

  private initializeElements(): void {
    this.titleElement = document.querySelector('.app-title') as HTMLElement;
    this.buttonElement = document.querySelector('.spin-button') as HTMLButtonElement;
    this.diceIcon = document.querySelector('.dice-icon') as HTMLElement;
    this.spinText = document.querySelector('.spin-text') as HTMLElement;
    this.overlay = document.querySelector('.overlay') as HTMLElement;

    // Verify all elements exist
    if (
      !this.titleElement ||
      !this.buttonElement ||
      !this.diceIcon ||
      !this.spinText ||
      !this.overlay
    ) {
      console.error('UI elements not found. Make sure all required elements exist in the DOM.');
    }
  }

  updateUI(state: GameStoreState): void {
    const { currentState, currentCountry, itinerary } = state;

    switch (currentState) {
      case GameState.IDLE:
        this.showIdleState();
        this.itineraryView.hide();
        break;

      case GameState.SPINNING:
      case GameState.ZOOMING:
        this.hideUI();
        this.itineraryView.hide();
        break;

      case GameState.RESULT:
        this.showResultState(currentCountry);
        this.itineraryView.hide();
        break;

      case GameState.ITINERARY:
        this.hideUI();
        if (itinerary) {
          this.itineraryView.show(itinerary);
        }
        break;
    }
  }

  private showIdleState(): void {
    this.overlay.style.opacity = '1';
    this.titleElement.innerHTML = 'Spin the Globe – Where Will Reddit Send You Today?';
    this.titleElement.style.color = '#1a365d';
    this.buttonElement.style.display = 'flex';
    this.diceIcon.textContent = '🎲';
    this.spinText.textContent = 'SPIN';
    this.buttonElement.disabled = false;
  }

  private hideUI(): void {
    this.overlay.style.opacity = '0';
  }

  private showResultState(country: string): void {
    this.overlay.style.opacity = '1';
    this.titleElement.innerHTML = `
      <div style="margin-bottom: 16px;">
        <span style="color: #ff4500; font-size: 1.5rem;">Next Stop:</span>
      </div>
      <div style="color: white; font-size: 2.5rem; font-weight: 800;">${country.toUpperCase()}</div>
    `;
    this.buttonElement.style.display = 'flex';
    this.diceIcon.textContent = '📋';
    this.spinText.textContent = 'View Itinerary';
    this.buttonElement.disabled = false;
  }

  showSpinningState(): void {
    this.buttonElement.disabled = true;
    this.diceIcon.textContent = '🎲';
    this.spinText.textContent = 'SPINNING...';
  }
}
