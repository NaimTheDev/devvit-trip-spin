import { reddit } from '@devvit/web/server';

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

  return {
    posts,
    subredditUsed,
  };
};

export const getSubredditInfo = async (subredditName: string) => {
  try {
    return await reddit.getSubredditInfoByName(subredditName);
  } catch (error) {
    return null;
  }
};
