import { reddit } from '@devvit/web/server';
import type { Comment } from '@devvit/reddit';

export const findContent = async (countryName: string) => {
  // Clean up country name for subreddit search
  const cleanCountryName = countryName.replace(/\s+/g, '').toLowerCase();

  // Try subreddits in order of preference
  const subredditCandidates = [
    `${cleanCountryName}travel`, // e.g., japantravel
    cleanCountryName, // e.g., japan
    'solotravel', // default fallback
  ];

  let subredditInfo = null;
  let subredditUsed = 'solotravel'; // default

  // Try each subreddit candidate
  for (const candidate of subredditCandidates) {
    try {
      subredditInfo = await getSubredditInfo(candidate);
      if (subredditInfo) {
        subredditUsed = candidate;
        break;
      }
    } catch (error) {
      console.log(`Subreddit ${candidate} not found, trying next...`);
      continue;
    }
  }

  // If none of the country-specific subreddits exist, use the default
  if (!subredditInfo) {
    subredditInfo = await getSubredditInfo('solotravel');
    subredditUsed = 'solotravel';
  }

  const posts = await reddit.getHotPosts({
    subredditName: subredditInfo?.name ?? 'solotravel',
    limit: 10,
  });

  // Get all posts and take the first one
  const allPosts = await posts.all();
  const firstPost = allPosts[0];

  let comments: Comment[] = [];
  if (firstPost) {
    try {
      const commentsListing = await reddit.getComments({
        postId: firstPost.id,
        sort: 'top',
        limit: 5,
      });

      comments = await commentsListing.all();
    } catch (error) {
      console.log(`Failed to get comments for post ${firstPost.id}:`, error);
    }
  }

  return {
    posts: allPosts,
    comments,
    subredditUsed,
  };
};

export const getSubredditInfo = async (subredditName: string) => {
  return await reddit.getSubredditInfoByName(subredditName);
};
