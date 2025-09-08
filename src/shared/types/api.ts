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

export type ItineraryPost = {
  id: string;
  authorId: string | undefined;
  authorName: string;
  subredditId: string;
  subredditName: string;
  permalink: string;
  title: string;
  body: string | undefined;
  bodyHtml: string | undefined;
  url: string;
  thumbnail:
    | {
        url: string;
        height: number;
        width: number;
      }
    | undefined;
  createdAt: Date;
  score: number;
  numberOfComments: number;
  numberOfReports: number;
  approved: boolean;
  spam: boolean;
  stickied: boolean;
  removed: boolean;
  archived: boolean;
  edited: boolean;
  locked: boolean;
  nsfw: boolean;
  quarantined: boolean;
  spoiler: boolean;
  hidden: boolean;
};

export type ItineraryComment = {
  id: string;
  authorId: string | undefined;
  authorName: string;
  subredditId: string;
  subredditName: string;
  body: string;
  createdAt: Date;
  parentId: string;
  postId: string;
  distinguishedBy: string | undefined;
  locked: boolean;
  stickied: boolean;
  removed: boolean;
  approved: boolean;
  spam: boolean;
  edited: boolean;
  score: number;
  permalink: string;
  url: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  activities: string[];
};

export type GeneratedItinerary = {
  destination: string;
  country: string;
  duration: string;
  days: ItineraryDay[];
  communityHighlights: string[];
};

export type ItineraryResponse = {
  type: 'itinerary';
  postId: string;
  country: string;
  subredditUsed: string;
  posts: ItineraryPost[];
  comments: ItineraryComment[];
  generatedItinerary: GeneratedItinerary;
};
