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
        <!-- Header with Background Image -->
        <div style="
          background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), 
                      url('data:image/svg+xml,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 375 300&quot;><defs><linearGradient id=&quot;g&quot; x1=&quot;0%&quot; y1=&quot;0%&quot; x2=&quot;0%&quot; y2=&quot;100%&quot;><stop offset=&quot;0%&quot; stop-color=&quot;%2332cd32&quot;/><stop offset=&quot;50%&quot; stop-color=&quot;%2332cd32&quot;/><stop offset=&quot;100%&quot; stop-color=&quot;%23228b22&quot;/></linearGradient></defs><rect fill=&quot;url(%23g)&quot; width=&quot;375&quot; height=&quot;300&quot;/><ellipse fill=&quot;%23ffffff&quot; opacity=&quot;0.3&quot; cx=&quot;187&quot; cy=&quot;200&quot; rx=&quot;150&quot; ry=&quot;50&quot;/><rect fill=&quot;%2332cd32&quot; x=&quot;50&quot; y=&quot;80&quot; width=&quot;4&quot; height=&quot;180&quot; opacity=&quot;0.7&quot;/><rect fill=&quot;%2332cd32&quot; x=&quot;70&quot; y=&quot;60&quot; width=&quot;4&quot; height=&quot;200&quot; opacity=&quot;0.8&quot;/><rect fill=&quot;%2332cd32&quot; x=&quot;90&quot; y=&quot;90&quot; width=&quot;4&quot; height=&quot;170&quot; opacity=&quot;0.6&quot;/><rect fill=&quot;%2332cd32&quot; x=&quot;300&quot; y=&quot;70&quot; width=&quot;4&quot; height=&quot;190&quot; opacity=&quot;0.7&quot;/><rect fill=&quot;%2332cd32&quot; x=&quot;320&quot; y=&quot;50&quot; width=&quot;4&quot; height=&quot;210&quot; opacity=&quot;0.8&quot;/><rect fill=&quot;%2332cd32&quot; x=&quot;280&quot; y=&quot;100&quot; width=&quot;4&quot; height=&quot;160&quot; opacity=&quot;0.6&quot;/></svg>');
          background-size: cover;
          background-position: center;
          padding: 50px 20px 40px;
          text-align: center;
          color: white;
          position: relative;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <button id="back-button" style="
            position: absolute;
            top: 20px;
            left: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
          ">←</button>
          
          <!-- Country Name -->
          <h1 style="
            margin: 0 0 20px 0;
            font-size: 48px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            letter-spacing: -1px;
          ">${this.extractCountryFromTitle(data.title)}</h1>
          
          <!-- Itinerary Title -->
          <h2 style="
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            opacity: 0.9;
          ">${data.title}</h2>
        </div>

        <!-- Itinerary Days -->
        <div style="padding: 20px;">
          ${data.days.map(day => `
            <div style="
              background: white;
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 16px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
              display: flex;
              align-items: flex-start;
              gap: 16px;
              border: 1px solid rgba(0,0,0,0.05);
            ">
              <div style="
                width: 64px;
                height: 64px;
                background: ${this.getDayImage(day.day, day.title)};
                background-size: cover;
                background-position: center;
                border-radius: 12px;
                flex-shrink: 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              "></div>
              
              <div style="flex: 1; min-width: 0;">
                <h3 style="
                  margin: 0 0 8px 0;
                  font-size: 18px;
                  font-weight: 700;
                  color: #1a365d;
                  line-height: 1.3;
                ">Day ${day.day}: ${day.title}</h3>
                <p style="
                  margin: 0;
                  font-size: 15px;
                  color: #666;
                  line-height: 1.5;
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
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.05);
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          ">
            <h2 style="
              margin: 0;
              font-size: 22px;
              font-weight: 700;
              color: #1a365d;
            ">Community<br>Highlights</h2>
            <div style="
              background: #ff4500;
              color: white;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span style="
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                display: inline-block;
              "></span>
              from r/${data.communityHighlights[0]?.subreddit || 'travel'}
            </div>
          </div>

          ${data.communityHighlights.slice(0, 3).map((highlight, index) => `
            <div style="
              display: flex;
              gap: 12px;
              margin-bottom: ${index === data.communityHighlights.slice(0, 3).length - 1 ? '0' : '20px'};
              ${index < data.communityHighlights.slice(0, 3).length - 1 ? 'padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;' : ''}
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
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
              ">${highlight.username.charAt(0).toUpperCase()}</div>
              
              <div style="flex: 1; min-width: 0;">
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 6px;
                ">
                  <span style="
                    font-weight: 700;
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
                  line-height: 1.5;
                ">${highlight.content}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Bottom Padding -->
        <div style="height: 40px;"></div>
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