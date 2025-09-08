export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type RandomCountryResponse = {
  type: 'random-country';
  postId: string;
  country: string;
};

export type ItineraryResponse = {
  type: 'itinerary';
  postId: string;
  itinerary: ItineraryData;
};

export interface ItineraryData {
  title: string;
  days: ItineraryDay[];
  communityHighlights: CommunityHighlight[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface CommunityHighlight {
  username: string;
  content: string;
  subreddit: string;
  timeAgo: string;
}
