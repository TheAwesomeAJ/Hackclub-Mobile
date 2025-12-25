export interface YSWSesData {
  limitedTime: YSWS[];
  recentlyEnded: YSWS[];
  indefinite: YSWS[];
  drafts: YSWS[];
}

export interface YSWS {
  name: string;
  description: string;
  website?: null | string;
  slack?: string;
  slackChannel: string;
  status: Status;
  detailedDescription?: null | string;
  deadline?: null | string;
  ended?: string;
  participants?: number;
  steps?: string[];
  details?: string[];
  requirements?: string[] | string;
}

export enum Status {
  Active = "active",
  Draft = "draft",
  Ended = "ended",
}
