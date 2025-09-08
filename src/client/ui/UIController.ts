import { GameState } from '../store/gameStore';
import { type SelectedLocation } from '../utils/LocationService';
import type { ItineraryPost, ItineraryComment } from '../../shared/types/api';

interface GameStoreState {
  currentState: GameState;
  currentLocation: SelectedLocation | null;
  isSpinning: boolean;
  itineraryPosts: ItineraryPost[];
  itineraryComments: ItineraryComment[];
  subredditUsed: string;
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
    const { currentState, currentLocation, itineraryComments, subredditUsed } = state;

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

      case GameState.ITINERARY:
        this.showItineraryState(currentLocation, itineraryComments, subredditUsed);
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

  private showItineraryState(
    location: SelectedLocation | null,
    comments: ItineraryComment[],
    subredditUsed: string
  ): void {
    this.overlay.style.opacity = '1';

    if (!location) {
      this.titleElement.innerHTML = 'Itinerary Unavailable';
      return;
    }

    const countryName = location.country;

    // Create itinerary HTML using comments as the basis for recommendations
    const itineraryHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 16px; color: white; text-align: left; max-width: 600px; margin: 0 auto;">
        <div style="margin-bottom: 20px;">
          <h2 style="margin: 0 0 8px 0; font-size: 2rem; font-weight: 800;">${countryName}</h2>
          <p style="margin: 0; font-size: 1rem; opacity: 0.9;">3-Day AI Itinerary</p>
        </div>
        
        <div style="margin-bottom: 24px;">
          ${comments
            .slice(0, 3)
            .map(
              (comment, index) => `
            <div style="background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid #ff4500;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 60px; height: 60px; background: #ff4500; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                  <img src="/assets/snoo_on_plane_no_background.png" alt="Day ${index + 1}" style="width: 40px; height: 40px; object-fit: cover;" onerror="this.style.display='none'">
                </div>
                <div>
                  <h3 style="margin: 0 0 4px 0; font-size: 1.2rem; font-weight: 700;">Day ${index + 1}: ${this.extractActivityFromComment(comment.body)}</h3>
                  <p style="margin: 0; font-size: 0.9rem; opacity: 0.8;">${comment.body}</p>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 12px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 1rem; color: #ff4500; margin-right: 8px;">🕒</span>
            <span style="font-size: 0.9rem; font-weight: 600;">Community Highlights</span>
          </div>
          <div style="display: flex; align-items: center;">
            <img src="/assets/snoo_on_plane_no_background.png" alt="Reddit" style="width: 20px; height: 20px; margin-right: 8px;" onerror="this.style.display='none'">
            <span style="font-size: 0.8rem; opacity: 0.8;">from r/${subredditUsed}</span>
          </div>
        </div>
      </div>
    `;

    this.titleElement.innerHTML = itineraryHTML;
    this.buttonElement.style.display = 'flex';
    this.diceIcon.textContent = '🔄';
    this.spinText.textContent = 'Plan Another Trip';
    this.buttonElement.disabled = false;
  }

  private extractActivityFromComment(commentBody: string): string {
    // Extract a meaningful activity description from comment body
    const cleanBody = commentBody.replace(/\[.*?\]/g, '').trim();
    const words = cleanBody.split(' ');
    if (words.length > 6) {
      return words.slice(0, 6).join(' ') + '...';
    }
    return cleanBody;
  }
}
