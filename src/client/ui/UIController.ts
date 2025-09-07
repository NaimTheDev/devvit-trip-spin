import { GameState } from '../store/gameStore';
import { type SelectedLocation } from '../utils/LocationService';

interface GameStoreState {
  currentState: GameState;
  currentLocation: SelectedLocation | null;
  isSpinning: boolean;
}

export class UIController {
  private titleElement!: HTMLElement;
  private buttonElement!: HTMLButtonElement;
  private diceIcon!: HTMLElement;
  private spinText!: HTMLElement;
  private overlay!: HTMLElement;
  private snooImageElement: HTMLImageElement | null = null;

  constructor() {
    this.initializeElements();
    // Try to find the snoo image if it already exists
    this.snooImageElement = document.querySelector('.snoo-plane-img') as HTMLImageElement;
  }

  private initializeElements(): void {
    this.titleElement = document.querySelector('.app-title') as HTMLElement;
    this.buttonElement = document.querySelector('.spin-button') as HTMLButtonElement;
    this.diceIcon = document.querySelector('.dice-icon') as HTMLElement;
    this.spinText = document.querySelector('.spin-text') as HTMLElement;
    this.overlay = document.querySelector('.overlay') as HTMLElement;
    // Try to find the snoo image if it already exists
    this.snooImageElement = document.querySelector('.snoo-plane-img') as HTMLImageElement;

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
    const { currentState, currentLocation } = state;

    switch (currentState) {
      case GameState.IDLE:
        this.showIdleState();
        break;

      case GameState.SPINNING:
      case GameState.ZOOMING:
        this.hideUI();
        break;

      case GameState.RESULT:
        this.showResultState(currentLocation);
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
    // Remove snoo image if present
    if (this.snooImageElement && this.snooImageElement.parentElement) {
      this.snooImageElement.parentElement.removeChild(this.snooImageElement);
      this.snooImageElement = null;
    }
  }

  private hideUI(): void {
    this.overlay.style.opacity = '0';
    // Remove snoo image if present
    if (this.snooImageElement && this.snooImageElement.parentElement) {
      this.snooImageElement.parentElement.removeChild(this.snooImageElement);
      this.snooImageElement = null;
    }
  }

  private showResultState(location: SelectedLocation | null): void {
    this.overlay.style.opacity = '1';

    // Add snoo image overlay above the globe
    const globeContainer = document.querySelector('.globe-container');
    if (globeContainer && !document.querySelector('.snoo-plane-img')) {
      const img = document.createElement('img');
      img.src = '/snoo_on_plane_no_background.png';
      img.alt = 'Snoo on Plane';
      img.className = 'snoo-plane-img';
      img.style.position = 'absolute';
      img.style.left = '50%';
      img.style.top = '50%';
      img.style.transform = 'translate(-50%, -50%)';
      img.style.width = '300px';
      img.style.pointerEvents = 'none';
      img.style.zIndex = '10';
      (globeContainer as HTMLElement).style.position = 'relative';
      globeContainer.appendChild(img);
      this.snooImageElement = img;
    }

    if (!location) {
      this.titleElement.innerHTML = `
        <div style="margin-bottom: 16px;">
          <span style="color: #ff4500; font-size: 1.5rem;">Next Stop:</span>
        </div>
        <div style="color: white; font-size: 2.5rem; font-weight: 800;">UNKNOWN DESTINATION</div>
      `;
    } else {
      const locationName = location.name;
      const countryName = location.country;
      const region = location.region;

      let displayLocation = locationName;
      if (region && region !== countryName) {
        displayLocation += `, ${region}`;
      }
      if (countryName && countryName !== locationName) {
        displayLocation += `, ${countryName}`;
      }

      this.titleElement.innerHTML = `
        <div style="margin-bottom: 16px;">
          <span style="color: #ff4500; font-size: 1.5rem;">Next Stop:</span>
        </div>
        <div style="color: white; font-size: 2.5rem; font-weight: 800;">${displayLocation.toUpperCase()}</div>
        ${location.population > 0 ? `<div style="color: #a0aec0; font-size: 1rem; margin-top: 8px;">Population: ${location.population.toLocaleString()}</div>` : ''}
      `;
    }

    this.buttonElement.style.display = 'flex';
    this.diceIcon.textContent = '📄';
    this.spinText.textContent = 'Get your Itinerary';
    this.buttonElement.disabled = false;
  }

  showSpinningState(): void {
    this.buttonElement.disabled = true;
    this.diceIcon.textContent = '🎲';
    this.spinText.textContent = 'SPINNING...';
  }
}
