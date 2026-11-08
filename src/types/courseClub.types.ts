// Course club (کلاب دوره) type definitions

/**
 * Day of week used by the course club schedule (backend `DaysOfWeek`, .NET order).
 * Note: Sunday is 0 here, unlike the `DaysOfWeek` labels in `@/enums/course`.
 */
export enum ClubDayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

/** `type` field of `Course/UploadClub` */
export enum UploadClubImageType {
  Guest = 0,
  PlaylistCover = 1,
}

// ---------- requests ----------
export interface CourseClubScheduleLineRq {
  title: string;
  svg: string;
  dayOfWeek: ClubDayOfWeek;
  timeRange: string;
}

export interface CourseClubGuestRq {
  /** Existing guest id; omit for a new guest */
  id?: string | null;
  fullName: string;
  description?: string | null;
}

export interface CourseClubPlaylistItemRq {
  /** Existing item id; omit for a new item */
  id?: string | null;
  title: string;
  description?: string | null;
  sortOrder: number;
  linkUrl?: string | null;
}

/** Replaces the whole club: always send every list in full. */
export interface CourseClubUpsertRq {
  scheduleLines: CourseClubScheduleLineRq[];
  guests: CourseClubGuestRq[];
  playlist: CourseClubPlaylistItemRq[];
  /** Club holding time, ISO date */
  time?: string | null;
  linkUrl?: string | null;
}

// ---------- responses ----------
export interface CourseClubScheduleLineRs {
  title: string;
  svg: string;
  dayOfWeek: ClubDayOfWeek;
  timeRange: string;
}

export interface CourseClubGuestRs {
  id: string;
  fullName: string;
  description: string | null;
  imageUrl: string | null;
}

export interface CourseClubPlaylistItemRs {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  linkUrl: string | null;
}

export interface CourseClubRs {
  scheduleLines: CourseClubScheduleLineRs[];
  guests: CourseClubGuestRs[];
  /** Sorted by sortOrder */
  playlist: CourseClubPlaylistItemRs[];
  time: string | null;
  linkUrl: string | null;
}

export interface CourseClubBuyerUser {
  id: string;
  fullNameFa: string | null;
  imageUrl: string | null;
}

export interface UploadClubImageRs {
  imageUrl: string;
}
