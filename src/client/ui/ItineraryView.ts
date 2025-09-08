import { ItineraryData } from '../../shared/types/api';

export class ItineraryView {
  private container: HTMLElement;

  constructor() {
    this.container = this.createContainer();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'itinerary-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 1000;
      overflow-y: auto;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    document.body.appendChild(container);
    return container;
  }

  show(itineraryData: ItineraryData): void {
    this.render(itineraryData);
    this.container.style.display = 'block';
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  private render(data: ItineraryData): void {
    this.container.innerHTML = `
      <div style="
        max-width: 375px;
        margin: 0 auto;
        background: #f8f9fa;
        min-height: 100vh;
        position: relative;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 20px 40px;
          text-align: center;
          color: white;
          position: relative;
        ">
          <button id="back-button" style="
            position: absolute;
            top: 50px;
            left: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">←</button>
          
          <div style="
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%2387CEEB" width="400" height="200"/><path fill="%23228B22" d="M0 120 Q200 80 400 120 L400 200 L0 200 Z"/></svg>') center/cover;
            width: 100%;
            height: 120px;
            border-radius: 16px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${this.extractCountryFromTitle(data.title)}
          </div>
          
          <h1 style="
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            line-height: 1.2;
          ">${data.title}</h1>
        </div>

        <!-- Itinerary Days -->
        <div style="padding: 20px;">
          ${data.days.map(day => `
            <div style="
              background: white;
              border-radius: 16px;
              padding: 16px;
              margin-bottom: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              display: flex;
              align-items: center;
              gap: 16px;
            ">
              <div style="
                width: 60px;
                height: 60px;
                background: ${this.getDayImage(day.day, day.title)};
                background-size: cover;
                background-position: center;
                border-radius: 12px;
                flex-shrink: 0;
              "></div>
              
              <div style="flex: 1;">
                <h3 style="
                  margin: 0 0 8px 0;
                  font-size: 18px;
                  font-weight: 700;
                  color: #1a365d;
                ">Day ${day.day}: ${day.title}</h3>
                <p style="
                  margin: 0;
                  font-size: 14px;
                  color: #666;
                  line-height: 1.4;
                ">${day.description}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Community Highlights -->
        <div style="
          background: white;
          margin: 0 20px 20px;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          ">
            <h2 style="
              margin: 0;
              font-size: 20px;
              font-weight: 700;
              color: #1a365d;
            ">Community Highlights</h2>
            <span style="
              background: #ff4500;
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            ">from r/${data.communityHighlights[0]?.subreddit || 'travel'}</span>
          </div>

          ${data.communityHighlights.map(highlight => `
            <div style="
              display: flex;
              gap: 12px;
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #eee;
            ">
              <div style="
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                flex-shrink: 0;
              ">${highlight.username.charAt(0).toUpperCase()}</div>
              
              <div style="flex: 1;">
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 4px;
                ">
                  <span style="
                    font-weight: 600;
                    font-size: 14px;
                    color: #1a365d;
                  ">u/${highlight.username}</span>
                  <span style="
                    font-size: 12px;
                    color: #888;
                  ">${highlight.timeAgo}</span>
                </div>
                <p style="
                  margin: 0;
                  font-size: 14px;
                  color: #333;
                  line-height: 1.4;
                ">${highlight.content}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Bottom Padding -->
        <div style="height: 20px;"></div>
      </div>
    `;

    // Add event listener for back button
    const backButton = this.container.querySelector('#back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.onBackClick();
      });
    }
  }

  private extractCountryFromTitle(title: string): string {
    // Extract country name from title like "Japan 3-Day AI Itinerary"
    const match = title.match(/^([^0-9]+)/);
    return match ? match[1].trim() : 'Destination';
  }

  private getDayImage(day: number, title: string): string {
    // Return CSS for background image based on day and title
    const images = {
      temple: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 60\"><rect fill=\"%23d4af37\" width=\"60\" height=\"60\"/><path fill=\"%23b8860b\" d=\"M10 40 L30 20 L50 40 L50 55 L10 55 Z\"/><rect fill=\"%238b4513\" x=\"25\" y=\"35\" width=\"10\" height=\"20\"/></svg>')",
      bamboo: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 60\"><rect fill=\"%2332cd32\" width=\"60\" height=\"60\"/><rect fill=\"%2228a428\" x=\"20\" y=\"10\" width=\"4\" height=\"40\"/><rect fill=\"%2328a428\" x=\"30\" y=\"5\" width=\"4\" height=\"50\"/><rect fill=\"%2328a428\" x=\"40\" y=\"15\" width=\"4\" height=\"35\"/></svg>')",
      city: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 60\"><rect fill=\"%234169e1\" width=\"60\" height=\"60\"/><rect fill=\"%23333\" x=\"10\" y=\"30\" width=\"8\" height=\"25\"/><rect fill=\"%23333\" x=\"22\" y=\"20\" width=\"8\" height=\"35\"/><rect fill=\"%23333\" x=\"34\" y=\"25\" width=\"8\" height=\"30\"/><rect fill=\"%23333\" x=\"46\" y=\"35\" width=\"8\" height=\"20\"/></svg>')",
      default: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 60 60\"><rect fill=\"%2387ceeb\" width=\"60\" height=\"60\"/><circle fill=\"%23ffd700\" cx=\"30\" cy=\"30\" r=\"15\"/></svg>')"
    };

    const titleLower = title.toLowerCase();
    if (titleLower.includes('temple') || titleLower.includes('cultural')) {
      return images.temple;
    } else if (titleLower.includes('bamboo') || titleLower.includes('grove') || titleLower.includes('forest')) {
      return images.bamboo;
    } else if (titleLower.includes('city') || titleLower.includes('osaka') || titleLower.includes('urban')) {
      return images.city;
    }
    return images.default;
  }

  private onBackClick(): void {
    // Import is done at runtime to avoid circular dependencies
    const { useGameStore } = require('../store/gameStore');
    const { resetToIdle } = useGameStore.getState();
    resetToIdle();
  }
}