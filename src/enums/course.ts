export const CourseType = {
    0: "تعیین نشده",
    1: "آنلاین",
    2: "ویدیویی",
    3: "آنلاین و ویدیویی",
} as const;

export const CoursePaymentType = {
    0: "تعیین نشده",
    1: "رایگان",
    2: "قسطی",
    3: "نقدی",
} as const;

export const CourseStatus = {
    0: "تعیین نشده",
    1: "عادی",
    2: "تکمیل شده",
    3: "پیش ثبت نام",
    4: "غیر فعال",
    5: "تمام شده",
} as const;

export const DaysOfWeek = {
    0: "شنبه",
    1: "یکشنبه",
    2: "دوشنبه",
    3: "سه‌شنبه",
    4: "چهارشنبه",
    5: "پنجشنبه",
    6: "جمعه",
} as const;

export const InstallmentType = {
    0: "بدون قسط",
    1: "خودکار",
    2: "سفارشی",
    3: "پلکانی",
} as const;

// Enum values for InstallmentType
export enum InstallmentTypeEnum {
    None = 0,
    Auto = 1,
    Custom = 2,
    Progressive = 3,
}

export const CourseScheduleStatus = {
    0: "اولیه",
    1: "در حال انجام",
    2: "تمام شده",
} as const;

// Enum values for CourseScheduleStatus
export enum CourseScheduleStatusEnum {
    Initial = 0,
    InProgress = 1,
    Completed = 2,
}

export const CredentialExamType = {
    0: 'هیچ‌کدام',
    1: 'تمرینی',
    2: 'نهایی',
} as const;

/**
 * Persian labels for the course club schedule days (backend `DaysOfWeek`: Sunday = 0).
 * Listed in Iranian week order (Saturday first) for selects and display.
 */
export const ClubDayOfWeekLabels: { value: number; label: string }[] = [
    { value: 6, label: 'شنبه' },
    { value: 0, label: 'یکشنبه' },
    { value: 1, label: 'دوشنبه' },
    { value: 2, label: 'سه‌شنبه' },
    { value: 3, label: 'چهارشنبه' },
    { value: 4, label: 'پنجشنبه' },
    { value: 5, label: 'جمعه' },
];
