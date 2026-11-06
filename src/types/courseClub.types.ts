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

// ---------- requests ----------
export interface CourseClubScheduleLineRq {
  svg: string;
  dayOfWeek: ClubDayOfWeek;
  timeRange: string;
}

export interface CourseClubGuestRq {
  /** Existing guest id; omit for a new guest */
  id?: string | null;
  fullName: string;
  description?: string | null;
  /** ISO date */
  time?: string | null;
}

export interface CourseClubUpsertRq {
  scheduleLines: CourseClubScheduleLineRq[];
  guests: CourseClubGuestRq[];
  linkUrl?: string | null;
}

// ---------- responses ----------
export interface CourseClubScheduleLineRs {
  svg: string;
  dayOfWeek: ClubDayOfWeek;
  timeRange: string;
}

export interface CourseClubGuestRs {
  id: string;
  fullName: string;
  description: string | null;
  time: string | null;
  imageUrl: string | null;
}

export interface CourseClubRs {
  scheduleLines: CourseClubScheduleLineRs[];
  guests: CourseClubGuestRs[];
  linkUrl: string | null;
}

export interface CourseClubBuyerUser {
  id: string;
  fullNameFa: string | null;
  imageUrl: string | null;
}

export interface UploadClubGuestImageRs {
  imageUrl: string;
}
