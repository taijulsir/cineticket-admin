export type EventStatus = "NOW_SELLING" | "UPCOMING" | "PAST" | "ARCHIVED" | "VOTE_FOR_BRING" | "VOTE_TO_BRING";

export type EventItem = {
  id: string;
  name: string;
  slug: string;
  status: EventStatus;
  releaseDate: string;
  createdAt: string;
};

