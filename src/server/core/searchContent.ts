import { reddit } from '@devvit/web/server';
import type { Comment } from '@devvit/reddit';

export const findContent = async (countryName: string) => {
  // Use only r/Travel subreddit as specified in the requirements
  const subredditUsed = 'Travel';

  try {
    // Get the Travel subreddit
    const travel = await reddit.getSubredditByName('Travel');

    // Fetch top posts with parameters from the issue specification
    const posts = await travel.getTopPosts({ timeframe: 'year', limit: 500, pageSize: 100 }).all();

    // Filter posts that mention the country in title or body for relevance
    const countryLower = countryName.toLowerCase();
    const relevantPosts = posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(countryLower);
      const bodyMatch = post.body?.toLowerCase().includes(countryLower);
      return titleMatch || bodyMatch;
    });

    // Use relevant posts if found, otherwise use first posts from the listing
    const postsToUse = relevantPosts.length > 0 ? relevantPosts.slice(0, 10) : posts.slice(0, 10);
    const firstPost = postsToUse[0];

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
      posts: postsToUse,
      comments,
      subredditUsed,
    };
  } catch (error) {
    console.error('Failed to fetch content from r/Travel:', error);
    // Return empty arrays if Travel subreddit fails
    return {
      posts: [],
      comments: [],
      subredditUsed,
    };
  }
};

export const getSubredditInfo = async (subredditName: string) => {
  return await reddit.getSubredditInfoByName(subredditName);
};
