import { reddit } from '@devvit/web/server';

export const findContent = async (subredditName: string) => {
  let subredditInfo = await getSubredditInfo(subredditName);

  if (!subredditInfo) {
    subredditInfo = await getSubredditInfo('solotravel');
  }

  return reddit.getHotPosts({
    subredditName: subredditInfo.name!,
    limit: 10,
  });
};

export const getSubredditInfo = async (subredditName: string) => {
  return reddit.getSubredditInfoByName(subredditName);
};
