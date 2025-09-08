import { ItineraryData, ItineraryDay, CommunityHighlight } from '../../shared/types/api';
import { reddit } from '@devvit/web/server';

export class ItineraryService {
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'PLACEHOLDER_API_KEY';

  static async generateItinerary(country: string): Promise<ItineraryData> {
    try {
      // Step 1: Fetch Reddit posts about the destination
      const redditData = await this.fetchRedditData(country);
      
      // Step 2: Generate itinerary using OpenAI (placeholder for now)
      const itinerary = await this.generateWithAI(country, redditData);
      
      return itinerary;
    } catch (error) {
      console.error('Error generating itinerary:', error);
      return this.getFallbackItinerary(country);
    }
  }

  private static async fetchRedditData(country: string): Promise<{ posts: any[], comments: any[] }> {
    try {
      // Search for posts about the destination
      const searchQuery = `${country} travel OR vacation OR visit OR trip`;
      
      // For now, we'll create mock data since we need to properly set up Reddit API access
      // In a real implementation, we would use:
      // const posts = await reddit.search({ query: searchQuery, sort: 'hot', limit: 10 });
      
      const mockPosts = [
        {
          title: `Best places to visit in ${country}`,
          body: `Amazing temples and street food scene. Don't miss the local markets!`,
          author: 'traveler123',
          upvotes: 250,
          subreddit: 'travel',
        },
        {
          title: `${country} itinerary recommendations`,
          body: `Spent 3 days here and it was incredible. The bamboo groves are a must-see.`,
          author: 'wanderlust_456',
          upvotes: 180,
          subreddit: `${country.toLowerCase()}travel`,
        },
      ];

      const mockComments = [
        {
          body: 'I second this! The local cuisine is out of this world.',
          author: 'foodlover789',
          upvotes: 45,
        },
        {
          body: 'Make sure to visit early in the morning to avoid crowds.',
          author: 'earlybird101',
          upvotes: 32,
        },
      ];

      return { posts: mockPosts, comments: mockComments };
    } catch (error) {
      console.error('Error fetching Reddit data:', error);
      return { posts: [], comments: [] };
    }
  }

  private static async generateWithAI(country: string, redditData: { posts: any[], comments: any[] }): Promise<ItineraryData> {
    // For now, return a structured itinerary based on the country and reddit data
    // In a real implementation, this would call OpenAI API
    
    if (this.OPENAI_API_KEY === 'PLACEHOLDER_API_KEY') {
      console.log('OpenAI API key not set, using fallback generation');
      return this.generateFromRedditData(country, redditData);
    }

    try {
      // Placeholder for OpenAI API call
      // const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     model: 'gpt-3.5-turbo',
      //     messages: [
      //       {
      //         role: 'system',
      //         content: 'You are a travel expert that creates detailed itineraries based on Reddit community insights.'
      //       },
      //       {
      //         role: 'user',
      //         content: `Create a 3-day itinerary for ${country} based on these Reddit posts and comments: ${JSON.stringify(redditData)}`
      //       }
      //     ],
      //     max_tokens: 1000,
      //   }),
      // });

      // For now, use the reddit data to generate the itinerary
      return this.generateFromRedditData(country, redditData);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return this.generateFromRedditData(country, redditData);
    }
  }

  private static generateFromRedditData(country: string, redditData: { posts: any[], comments: any[] }): ItineraryData {
    const days: ItineraryDay[] = [
      {
        day: 1,
        title: 'Temples & Street Food',
        description: 'Explore serene temples and savor local delicacies.',
      },
      {
        day: 2,
        title: 'Cultural Immersion',
        description: 'Wander through traditional areas and experience local culture.',
      },
      {
        day: 3,
        title: 'Adventure & Exploration',
        description: 'Take a day trip to nearby attractions and hidden gems.',
      },
    ];

    // If we have Japan, customize for Kyoto-style itinerary
    if (country.toLowerCase().includes('japan') || country.toLowerCase().includes('kyoto')) {
      days[0].title = 'Temples & Street Food';
      days[0].description = 'Explore serene temples and savor local delicacies.';
      days[1].title = 'Bamboo Grove';
      days[1].description = 'Wander through the enchanting Arashiyama Bamboo Grove.';
      days[2].title = 'Osaka Side Trip';
      days[2].description = 'Take a day trip to the vibrant city of Osaka.';
    }

    // Generate more realistic Reddit-style community highlights
    const communityHighlights: CommunityHighlight[] = [
      {
        username: 'foodwanderer',
        content: `Best ramen in ${country} 🍜 You have to try Ichiran, the broth is out of this world!`,
        subreddit: country.toLowerCase().includes('japan') ? 'JapanTravel' : 'travel',
        timeAgo: '2h',
      },
      {
        username: 'wanderlust_123',
        content: 'The bamboo forest was absolutely magical at sunrise. Get there early to avoid crowds!',
        subreddit: country.toLowerCase().includes('japan') ? 'JapanTravel' : 'travel',
        timeAgo: '4h',
      },
      {
        username: 'budgetbackpacker',
        content: `Stayed in ${country} for a week and it was incredible. The people are so friendly and helpful.`,
        subreddit: country.toLowerCase().includes('japan') ? 'JapanTravel' : 'travel',
        timeAgo: '6h',
      },
      {
        username: 'culturehunter',
        content: 'Pro tip: Buy a JR Pass if you\'re planning to travel between cities. Saved me tons of money!',
        subreddit: country.toLowerCase().includes('japan') ? 'JapanTravel' : 'travel',
        timeAgo: '8h',
      },
      {
        username: 'soloexplorer',
        content: 'As a solo female traveler, I felt completely safe everywhere I went. Amazing experience!',
        subreddit: country.toLowerCase().includes('japan') ? 'JapanTravel' : 'travel',
        timeAgo: '12h',
      },
    ];

    return {
      title: `${country} 3-Day AI Itinerary`,
      days,
      communityHighlights,
    };
  }

  private static getFallbackItinerary(country: string): ItineraryData {
    return {
      title: `${country} Adventure`,
      days: [
        {
          day: 1,
          title: 'Arrival & Exploration',
          description: 'Arrive and explore the local area, get oriented with the city.',
        },
        {
          day: 2,
          title: 'Cultural Experience',
          description: 'Immerse yourself in local culture, visit museums and landmarks.',
        },
        {
          day: 3,
          title: 'Adventure Day',
          description: 'Try exciting local activities and visit natural attractions.',
        },
      ],
      communityHighlights: [
        {
          username: 'traveler123',
          content: `${country} is an amazing destination! Highly recommend visiting.`,
          subreddit: 'travel',
          timeAgo: '2h',
        },
        {
          username: 'explorer456',
          content: 'The local food scene is incredible. Try everything!',
          subreddit: 'travel',
          timeAgo: '1h',
        },
      ],
    };
  }
}