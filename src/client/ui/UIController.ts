import { GameState } from '../store/gameStore';
import { type SelectedLocation } from '../utils/LocationService';
import type { ItineraryPost, ItineraryComment, GeneratedItinerary } from '../../shared/types/api';

interface GameStoreState {
  currentState: GameState;
  currentLocation: SelectedLocation | null;
  isSpinning: boolean;
  itineraryPosts: ItineraryPost[];
  itineraryComments: ItineraryComment[];
  generatedItinerary: GeneratedItinerary | null;
  subredditUsed: string;
}

export class UIController {
  private titleElement!: HTMLElement;
  private buttonElement!: HTMLButtonElement;
  private diceIcon!: HTMLElement;
  private spinText!: HTMLElement;
  private overlay!: HTMLElement;
  private snooImageElement: HTMLImageElement | null = null;
  private shareCallback?: (
    personalMessage?: string
  ) => Promise<{ success: boolean; postUrl?: string }>;

  constructor() {
    this.initializeElements();
    // Try to find the snoo image if it already exists
    this.snooImageElement = document.querySelector('.snoo-plane-img') as HTMLImageElement;
  }

  setShareCallback(
    callback: (personalMessage?: string) => Promise<{ success: boolean; postUrl?: string }>
  ): void {
    this.shareCallback = callback;
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
    const { currentState, currentLocation, generatedItinerary, subredditUsed } = state;

    // Handle body class for scrolling
    const body = document.body;
    const overlay = this.overlay;
    const actionSection = document.querySelector('.action-section') as HTMLElement;

    // Reset classes
    body.classList.remove('itinerary-state');
    overlay.classList.remove('itinerary-view');
    if (actionSection) {
      actionSection.classList.remove('itinerary-actions');
    }

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
        // Enable scrolling for itinerary state
        body.classList.add('itinerary-state');
        overlay.classList.add('itinerary-view');
        if (actionSection) {
          actionSection.classList.add('itinerary-actions');
        }
        this.showItineraryState(currentLocation, generatedItinerary, subredditUsed);
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
    generatedItinerary: GeneratedItinerary | null,
    subredditUsed: string
  ): void {
    this.overlay.style.opacity = '1';

    if (!location || !generatedItinerary) {
      this.titleElement.innerHTML = `
        <div style="color: white; font-size: 2rem; text-align: center; padding: 40px;">
          Itinerary Unavailable
        </div>
      `;
      return;
    }

    // Remove snoo image if present during itinerary view
    if (this.snooImageElement && this.snooImageElement.parentElement) {
      this.snooImageElement.parentElement.removeChild(this.snooImageElement);
      this.snooImageElement = null;
    }

    const destination = generatedItinerary.destination || location.country;

    // Create the complete itinerary view matching the mockup with proper scrolling
    const itineraryHTML = `
      <div style="width: 100%; min-height: 100vh; padding: 20px; padding-bottom: 120px; display: flex; justify-content: center; align-items: flex-start;">
        <div style="width: 100%; max-width: 500px; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%); border-radius: 20px; overflow: hidden; color: white; text-align: left;">
          
          <!-- Header Image Section -->
          <div style="position: relative; height: 200px; background: linear-gradient(135deg, #2d5aa0 0%, #4fc3f7 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 0;">
            <div style="text-align: center; z-index: 2;">
              <h1 style="margin: 0; font-size: 2.2rem; font-weight: 800; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">${destination}</h1>
            </div>
            <!-- Background pattern overlay -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 100 100&quot;><circle cx=&quot;20&quot; cy=&quot;20&quot; r=&quot;2&quot; fill=&quot;white&quot; opacity=&quot;0.1&quot;/><circle cx=&quot;80&quot; cy=&quot;40&quot; r=&quot;1.5&quot; fill=&quot;white&quot; opacity=&quot;0.15&quot;/><circle cx=&quot;40&quot; cy=&quot;70&quot; r=&quot;1&quot; fill=&quot;white&quot; opacity=&quot;0.1&quot;/></svg>') repeat; opacity: 0.6;"></div>
          </div>

          <!-- Content Section -->
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 20px 0; font-size: 1.5rem; font-weight: 700; color: white;">${generatedItinerary.duration}</h2>
            
            <!-- Days Section -->
            <div style="margin-bottom: 24px;">
              ${generatedItinerary.days
                .map(
                  (day, index) => `
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #ff4500;">
                  <div style="display: flex; align-items: flex-start; gap: 16px;">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ff4500 0%, #ff6b35 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.2rem;">
                      ${index + 1}
                    </div>
                    <div style="flex: 1;">
                      <h3 style="margin: 0 0 6px 0; font-size: 1.1rem; font-weight: 700; color: white;">Day ${day.day}: ${day.title}</h3>
                      <p style="margin: 0; font-size: 0.9rem; color: rgba(255,255,255,0.8); line-height: 1.4;">${day.description}</p>
                      ${
                        day.activities && day.activities.length > 0
                          ? `<div style="margin-top: 8px;">
                          ${day.activities
                            .slice(0, 2)
                            .map(
                              (activity) =>
                                `<span style="display: inline-block; background: rgba(255, 69, 0, 0.2); color: #ff4500; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; margin-right: 6px; margin-bottom: 4px;">${activity}</span>`
                            )
                            .join('')}
                        </div>`
                          : ''
                      }
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>

            <!-- Community Highlights Section -->
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 1.2rem; margin-right: 8px;">👥</span>
                <span style="font-size: 1rem; font-weight: 600; color: white;">Community Highlights</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 20px; height: 20px; background: #ff4500; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px; font-size: 0.7rem;">r/</div>
                <span style="font-size: 0.9rem; color: #ff4500; font-weight: 500;">from r/${subredditUsed}</span>
              </div>
              ${
                generatedItinerary.communityHighlights &&
                generatedItinerary.communityHighlights.length > 0
                  ? `<div style="margin-top: 8px;">
                  ${generatedItinerary.communityHighlights
                    .slice(0, 2)
                    .map(
                      (highlight) =>
                        `<p style="margin: 0 0 8px 0; font-size: 0.85rem; color: rgba(255,255,255,0.8); font-style: italic;">"${highlight}"</p>`
                    )
                    .join('')}
                </div>`
                  : ''
              }
            </div>

            <!-- Travel Poll Section -->
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 12px 0; font-size: 1.1rem; font-weight: 600; color: white;">Would you take this trip?</h3>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="background: rgba(45, 175, 235, 0.8); border-radius: 25px; padding: 12px 20px; border: 2px solid #2dafeb; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">⭕</span>
                  <span style="font-weight: 600;">Yes ✅</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 25px; padding: 12px 20px; border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center;">
                  <span style="margin-right: 8px;">⚪</span>
                  <span>No ❌</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 25px; padding: 12px 20px; border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center;">
                  <span style="margin-right: 8px;">⚪</span>
                  <span>Only if it's free 😊</span>
                </div>
              </div>
            </div>

            <!-- Share Trip Section -->
            <div style="background: rgba(255, 69, 0, 0.1); border-radius: 12px; padding: 16px; margin-bottom: 40px; border: 1px solid rgba(255, 69, 0, 0.3);">
              <h3 style="margin: 0 0 12px 0; font-size: 1.1rem; font-weight: 600; color: white; display: flex; align-items: center;">
                <span style="margin-right: 8px;">📤</span>
                Share Your Adventure
              </h3>
              <p style="margin: 0 0 16px 0; font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                Create a post in the community to find travel buddies and get more recommendations!
              </p>
              <button 
                id="share-trip-btn" 
                style="width: 100%; background: linear-gradient(135deg, #ff4500 0%, #ff6b35 100%); color: white; border: none; border-radius: 25px; padding: 14px 20px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px;"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 69, 0, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
              >
                <span>🌍</span>
                <span>Share My Trip to ${destination}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.titleElement.innerHTML = itineraryHTML;
    this.buttonElement.style.display = 'flex';
    this.diceIcon.textContent = '🔄';
    this.spinText.textContent = 'Plan Another Trip';
    this.buttonElement.disabled = false;

    // Set up share button event listener
    setTimeout(() => {
      const shareButton = document.getElementById('share-trip-btn');
      if (shareButton) {
        shareButton.addEventListener('click', () => this.handleShareTrip());
      }
    }, 100);
  }

  private async handleShareTrip(): Promise<void> {
    if (!this.shareCallback) {
      console.warn('Share callback not set');
      return;
    }

    const shareButton = document.getElementById('share-trip-btn');
    if (shareButton) {
      const originalContent = shareButton.innerHTML;
      shareButton.innerHTML = '<span>🌍</span><span>Sharing...</span>';
      shareButton.style.opacity = '0.7';
      (shareButton as HTMLButtonElement).disabled = true;

      try {
        const result = await this.shareCallback();

        if (result.success) {
          shareButton.innerHTML = '<span>✅</span><span>Trip Shared!</span>';
          shareButton.style.background = 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)';

          if (result.postUrl) {
            setTimeout(() => {
              // Optionally open the post in a new tab
              // window.open(result.postUrl, '_blank');
            }, 1000);
          }
        } else {
          shareButton.innerHTML = '<span>❌</span><span>Share Failed</span>';
          shareButton.style.background = 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)';
        }
      } catch (error) {
        console.error('Error sharing trip:', error);
        shareButton.innerHTML = '<span>❌</span><span>Share Failed</span>';
        shareButton.style.background = 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)';
      }

      setTimeout(() => {
        shareButton.innerHTML = originalContent;
        shareButton.style.background = 'linear-gradient(135deg, #ff4500 0%, #ff6b35 100%)';
        shareButton.style.opacity = '1';
        (shareButton as HTMLButtonElement).disabled = false;
      }, 3000);
    }
  }
}
