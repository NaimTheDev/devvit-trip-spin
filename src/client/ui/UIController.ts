import { GameState } from '../store/gameStore';

interface GameStoreState {
  currentState: GameState;
  currentCountry: string;
  isSpinning: boolean;
}

export class UIController {
  private titleElement!: HTMLElement;
  private buttonElement!: HTMLButtonElement;
  private diceIcon!: HTMLElement;
  private spinText!: HTMLElement;
  private overlay!: HTMLElement;

  constructor() {
    this.initializeElements();
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
    const { currentState, currentCountry } = state;

    switch (currentState) {
      case GameState.IDLE:
        this.showIdleState();
        break;

      case GameState.SPINNING:
      case GameState.ZOOMING:
        this.hideUI();
        break;

      case GameState.RESULT:
        this.showResultState(currentCountry);
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
    this.diceIcon.textContent = '🌍';
    this.spinText.textContent = 'Spin the Globe!';
    this.buttonElement.disabled = false;
  }

  showSpinningState(): void {
    this.buttonElement.disabled = true;
    this.diceIcon.textContent = '🎲';
    this.spinText.textContent = 'SPINNING...';
  }
}
