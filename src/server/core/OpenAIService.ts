import { settings } from '@devvit/web/server';

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface GeneratedItinerary {
  destination: string;
  country: string;
  duration: string;
  days: ItineraryDay[];
  communityHighlights: string[];
}

export class OpenAIService {
  private static readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  static async generateItinerary(
    country: string,
    posts: unknown[],
    comments: unknown[]
  ): Promise<GeneratedItinerary> {
    try {
      const apiKey = await settings.get('openaiApiKey');

      if (!apiKey) {
        console.warn('OpenAI API key not configured, using fallback itinerary');
        return this.generateFallbackItinerary(country, comments);
      }

      // Extract relevant content from posts and comments
      const postsContent = posts
        .slice(0, 3)
        .map((post: unknown) => {
          const p = post as Record<string, unknown>;
          return `Title: ${p.title || ''}\nContent: ${p.body || ''}`;
        })
        .join('\n\n');

      const commentsContent = comments
        .slice(0, 10)
        .map((comment: unknown) => {
          const c = comment as Record<string, unknown>;
          return c.body || '';
        })
        .filter(Boolean)
        .join('\n');

      const prompt = `Create a 3-day travel itinerary for ${country} based on the following Reddit community recommendations:

POSTS:
${postsContent}

COMMUNITY COMMENTS:
${commentsContent}

Please respond with a JSON object in this exact format:
{
  "destination": "City, Country",
  "country": "${country}",
  "duration": "3-Day AI Itinerary",
  "days": [
    {
      "day": 1,
      "title": "Day Activity Title",
      "description": "Brief engaging description",
      "activities": ["activity 1", "activity 2", "activity 3"]
    }
  ],
  "communityHighlights": ["highlight 1", "highlight 2", "highlight 3"]
}

Focus on authentic local experiences mentioned in the community content. Make it engaging and practical.`;

      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a travel expert who creates detailed itineraries from community recommendations. Always respond with valid JSON only, without markdown formatting or code blocks.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]
        ?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const itinerary = JSON.parse(cleanContent) as GeneratedItinerary;
      return itinerary;
    } catch (error) {
      console.error('Error generating itinerary with OpenAI:', error);
      return this.generateFallbackItinerary(country, comments);
    }
  }

  private static generateFallbackItinerary(
    country: string,
    comments: unknown[]
  ): GeneratedItinerary {
    // Create a fallback itinerary using comment content
    const commentTexts = comments
      .slice(0, 3)
      .map((comment: unknown) => {
        const c = comment as Record<string, unknown>;
        return (c.body as string) || '';
      })
      .filter(Boolean);

    const days: ItineraryDay[] = [];

    // Generate 3 days from available comments or use generic activities
    for (let i = 0; i < 3; i++) {
      const comment = commentTexts[i];
      days.push({
        day: i + 1,
        title: comment
          ? this.extractTitleFromComment(comment)
          : `Explore ${country} - Day ${i + 1}`,
        description: comment
          ? this.truncateText(comment, 80)
          : `Discover the best of ${country} with local recommendations.`,
        activities: comment
          ? [comment]
          : [
              `Visit local attractions in ${country}`,
              `Try traditional cuisine`,
              `Meet locals and explore`,
            ],
      });
    }

    const highlights =
      commentTexts.length > 0
        ? commentTexts.slice(0, 3)
        : [`Amazing experiences in ${country}`, `Local hidden gems`, `Cultural discoveries`];

    return {
      destination: country,
      country,
      duration: '3-Day AI Itinerary',
      days,
      communityHighlights: highlights,
    };
  }

  private static extractTitleFromComment(comment: string): string {
    // Extract a meaningful title from comment
    const words = comment.split(' ').slice(0, 4);
    return words.join(' ') + (words.length >= 4 ? '...' : '');
  }

  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}
