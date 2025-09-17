import express from 'express';
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
  RandomCountryResponse,
  ItineraryResponse,
  ItineraryPost,
  ItineraryComment,
  ShareTripRequest,
  ShareTripResponse,
  GeneratedItinerary,
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { findContent } from './core/searchContent';
import { OpenAIService } from './core/OpenAIService';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.get<{ postId: string }, RandomCountryResponse | { status: string; message: string }>(
  '/api/random-country',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    try {
      // Use the external API to get a random country
      const response = await fetch(
        'https://www.sathishsundar.in/wp-json/random-country-api/v1/random'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawText = await response.text();
      console.log('📄 Raw response text:', rawText);

      // Parse the raw text as JSON
      const data: { country: string } = JSON.parse(rawText);

      res.json({
        type: 'random-country',
        postId,
        country: data.country,
      });
    } catch (error) {
      console.error('Failed to fetch random country:', error);
      // Fallback: return a random country from hardcoded list
      const fallbackCountries = [
        'Afghanistan',
        'Albania',
        'Algeria',
        'Andorra',
        'Angola',
        'Argentina',
        'Armenia',
        'Australia',
        'Austria',
        'Azerbaijan',
        'Bahamas',
        'Bahrain',
        'Bangladesh',
        'Barbados',
        'Belarus',
        'Belgium',
        'Belize',
        'Benin',
        'Bhutan',
        'Bolivia',
        'Bosnia and Herzegovina',
        'Botswana',
        'Brazil',
        'Brunei',
        'Bulgaria',
        'Burundi',
        'Cambodia',
        'Cameroon',
        'Canada',
        'Cape Verde',
        'Central African Republic',
        'Chad',
        'Chile',
        'China',
        'Colombia',
        'Comoros',
        'Congo',
        'Costa Rica',
        'Croatia',
        'Cuba',
        'Cyprus',
        'Czech Republic',
        'Denmark',
        'Djibouti',
        'Dominica',
        'Dominican Republic',
        'East Timor',
        'Ecuador',
        'Egypt',
        'El Salvador',
        'Equatorial Guinea',
        'Eritrea',
        'Estonia',
        'Ethiopia',
        'Fiji',
        'Finland',
        'France',
        'Gabon',
        'Gambia',
        'Georgia',
        'Germany',
        'Ghana',
        'Greece',
        'Grenada',
        'Guatemala',
        'Guinea',
        'Guinea-Bissau',
        'Guyana',
        'Haiti',
        'Honduras',
        'Hungary',
        'Iceland',
        'India',
        'Indonesia',
        'Iran',
        'Iraq',
        'Ireland',
        'Israel',
        'Italy',
        'Jamaica',
        'Japan',
        'Jordan',
        'Kazakhstan',
        'Kenya',
        'Kiribati',
        'Kuwait',
        'Kyrgyzstan',
        'Laos',
        'Latvia',
        'Lebanon',
        'Lesotho',
        'Liberia',
        'Libya',
        'Liechtenstein',
        'Lithuania',
        'Luxembourg',
        'Madagascar',
        'Malawi',
        'Malaysia',
        'Maldives',
        'Mali',
        'Malta',
        'Marshall Islands',
        'Mauritania',
        'Mauritius',
        'Mexico',
        'Micronesia',
        'Moldova',
        'Monaco',
        'Mongolia',
        'Montenegro',
        'Morocco',
        'Mozambique',
        'Myanmar',
        'Namibia',
        'Nauru',
        'Nepal',
        'Netherlands',
        'New Zealand',
        'Nicaragua',
        'Niger',
        'Nigeria',
        'North Macedonia',
        'Norway',
        'Oman',
        'Pakistan',
        'Palau',
        'Palestine',
        'Panama',
        'Papua New Guinea',
        'Paraguay',
        'Peru',
        'Philippines',
        'Poland',
        'Portugal',
        'Qatar',
        'Romania',
        'Russia',
        'Rwanda',
        'Saint Kitts and Nevis',
        'Saint Lucia',
        'Saint Vincent and the Grenadines',
        'Samoa',
        'San Marino',
        'Sao Tome and Principe',
        'Saudi Arabia',
        'Senegal',
        'Serbia',
        'Seychelles',
        'Sierra Leone',
        'Singapore',
        'Slovakia',
        'Slovenia',
        'Solomon Islands',
        'Somalia',
        'South Africa',
        'South Korea',
        'Spain',
        'Sri Lanka',
        'Sudan',
        'Suriname',
        'Sweden',
        'Switzerland',
        'Syria',
        'Taiwan',
        'Tajikistan',
        'Tanzania',
        'Thailand',
        'Togo',
        'Tonga',
        'Trinidad and Tobago',
        'Tunisia',
        'Turkey',
        'Turkmenistan',
        'Tuvalu',
        'Uganda',
        'Ukraine',
        'United Arab Emirates',
        'United Kingdom',
        'United States',
        'Uruguay',
        'Uzbekistan',
        'Vanuatu',
        'Vatican City',
        'Venezuela',
        'Vietnam',
        'Zambia',
        'Zimbabwe',
      ];
      let country = 'Unknown Destination';
      if (fallbackCountries.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackCountries.length);
        country = fallbackCountries[randomIndex] || 'Unknown Destination';
      }
      res.json({
        type: 'random-country',
        postId,
        country,
      });
    }
  }
);

router.post<
  { postId: string },
  ItineraryResponse | { status: string; message: string },
  { country: string }
>('/api/itinerary', async (req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: 'error',
      message: 'postId is required',
    });
    return;
  }

  const { country } = req.body;
  if (!country) {
    res.status(400).json({
      status: 'error',
      message: 'country is required',
    });
    return;
  }

  try {
    const { posts, comments, subredditUsed } = await findContent(country);

    // Transform Reddit posts to our ItineraryPost format
    const itineraryPosts: ItineraryPost[] = posts.map((post: unknown) => {
      const redditPost = post as Record<string, unknown>;
      const thumbnail = redditPost.thumbnail as
        | { url: string; height: number; width: number }
        | undefined;

      return {
        id: String(redditPost.id || ''),
        authorId: redditPost.authorId ? String(redditPost.authorId) : undefined,
        authorName: String(redditPost.authorName || ''),
        subredditId: String(redditPost.subredditId || ''),
        subredditName: String(redditPost.subredditName || ''),
        permalink: String(redditPost.permalink || ''),
        title: String(redditPost.title || ''),
        body: redditPost.body ? String(redditPost.body) : undefined,
        bodyHtml: redditPost.bodyHtml ? String(redditPost.bodyHtml) : undefined,
        url: String(redditPost.url || ''),
        thumbnail: thumbnail
          ? {
              url: thumbnail.url,
              height: thumbnail.height,
              width: thumbnail.width,
            }
          : undefined,
        createdAt: redditPost.createdAt ? new Date(String(redditPost.createdAt)) : new Date(),
        score: Number(redditPost.score || 0),
        numberOfComments: Number(redditPost.numberOfComments || 0),
        numberOfReports: Number(redditPost.numberOfReports || 0),
        approved: Boolean(redditPost.approved),
        spam: Boolean(redditPost.spam),
        stickied: Boolean(redditPost.stickied),
        removed: Boolean(redditPost.removed),
        archived: Boolean(redditPost.archived),
        edited: Boolean(redditPost.edited),
        locked: Boolean(redditPost.locked),
        nsfw: Boolean(redditPost.nsfw),
        quarantined: Boolean(redditPost.quarantined),
        spoiler: Boolean(redditPost.spoiler),
        hidden: Boolean(redditPost.hidden),
      };
    });

    // Transform Reddit comments to our ItineraryComment format
    const itineraryComments: ItineraryComment[] = comments.map((comment: unknown) => {
      const redditComment = comment as Record<string, unknown>;

      return {
        id: String(redditComment.id || ''),
        authorId: redditComment.authorId ? String(redditComment.authorId) : undefined,
        authorName: String(redditComment.authorName || ''),
        subredditId: String(redditComment.subredditId || ''),
        subredditName: String(redditComment.subredditName || ''),
        body: String(redditComment.body || ''),
        createdAt: redditComment.createdAt ? new Date(String(redditComment.createdAt)) : new Date(),
        parentId: String(redditComment.parentId || ''),
        postId: String(redditComment.postId || ''),
        distinguishedBy: redditComment.distinguishedBy
          ? String(redditComment.distinguishedBy)
          : undefined,
        locked: Boolean(redditComment.locked),
        stickied: Boolean(redditComment.stickied),
        removed: Boolean(redditComment.removed),
        approved: Boolean(redditComment.approved),
        spam: Boolean(redditComment.spam),
        edited: Boolean(redditComment.edited),
        score: Number(redditComment.score || 0),
        permalink: String(redditComment.permalink || ''),
        url: String(redditComment.url || ''),
      };
    });

    // Generate AI-powered itinerary using OpenAI
    const generatedItinerary = await OpenAIService.generateItinerary(country, posts, comments);

    res.json({
      type: 'itinerary',
      postId,
      country,
      subredditUsed,
      posts: itineraryPosts,
      comments: itineraryComments,
      generatedItinerary,
    });
  } catch (error) {
    console.error('Failed to fetch itinerary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate itinerary',
    });
  }
});

router.post<object, ShareTripResponse>('/api/share-trip', async (req, res): Promise<void> => {
  try {
    const { country, itinerary, personalMessage } = req.body as ShareTripRequest;
    const { subredditName, postId } = context;

    if (!subredditName) {
      res.status(400).json({
        type: 'share-trip',
        postId: '',
        postUrl: '',
        success: false,
      });
      return;
    }

    // Format the itinerary into a nice text post
    const formatItinerary = (itinerary: GeneratedItinerary): string => {
      let text = `🌍 **Planning a trip to ${itinerary.destination}!** 🌍\n\n`;

      if (personalMessage) {
        text += `${personalMessage}\n\n`;
      }

      text += `I just used Trip Spin to plan an amazing ${itinerary.duration.toLowerCase()} to ${country}! Here's what the community recommended:\n\n`;

      // Add itinerary days
      itinerary.days.forEach(
        (day: { day: number; title: string; description: string; activities: string[] }) => {
          text += `**Day ${day.day}: ${day.title}**\n`;
          text += `${day.description}\n`;
          text += `Activities:\n`;
          day.activities.forEach((activity: string) => {
            text += `• ${activity}\n`;
          });
          text += `\n`;
        }
      );

      // Add community highlights
      if (itinerary.communityHighlights && itinerary.communityHighlights.length > 0) {
        text += `**Community Highlights:**\n`;
        itinerary.communityHighlights.forEach((highlight: string) => {
          text += `🌟 ${highlight}\n`;
        });
        text += `\n`;
      }

      text += `Want to join me or have suggestions? Drop a comment below! 👇\n\n`;
      text += `**🎯 Want to plan your own adventure?**\n`;
      if (postId) {
        text += `Try Trip Spin yourself: https://reddit.com/r/${subredditName}/comments/${postId}/\n\n`;
      } else {
        text += `Try Trip Spin yourself: https://reddit.com/r/${subredditName}/\n\n`;
      }
      text += `*Generated using Trip Spin - spin the globe and discover your next adventure!* 🎯`;

      return text;
    };

    const postTitle = `🌍 Planning an epic trip to ${itinerary.destination} - who wants to join? 🌍`;
    const postBody = formatItinerary(itinerary);

    const post = await reddit.submitPost({
      subredditName: subredditName,
      title: postTitle,
      text: postBody,
    });

    const postUrl = `https://reddit.com/r/${subredditName}/comments/${post.id}`;

    res.json({
      type: 'share-trip',
      postId: post.id,
      postUrl: postUrl,
      success: true,
    });
  } catch (error) {
    console.error('Failed to share trip:', error);
    res.status(500).json({
      type: 'share-trip',
      postId: '',
      postUrl: '',
      success: false,
    });
  }
});

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

app.use(router);

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
