import moment, {Moment} from "moment-jalaali"

moment.updateLocale("fa", {
    week: {
        dow: 6,
    },
})

const jalaliMomentConfig = {
    getFixedDate: (fixed: string): Moment => {
        // Parse the date as Gregorian YYYY-MM-DD format
        const parsedDate = moment(fixed, "YYYY-MM-DD", true);
        // Return valid moment or current date if invalid
        return parsedDate.isValid() ? parsedDate : moment();
    },
    getNow: (): Moment => moment(),
    getYear: (value: Moment): number => value.jYear(),
    getMonth: (value: Moment): number => value.jMonth(),
    getDate: (value: Moment): number => value.jDate(),
    getHour: (value: Moment): number => value.hour(),
    getMinute: (value: Moment): number => value.minute(),
    getSecond: (value: Moment): number => value.second(),
    getMillisecond: (value: Moment): number => value.millisecond(),
    getWeekDay: (value: Moment): number => {
        const instance = value || moment("2024-01-07")
        const clone = instance.clone().locale("en")
        return clone.weekday() + clone.localeData().firstDayOfWeek()
    },
    getEndDate: (value: Moment): Moment => value.clone().endOf("jMonth"),
    addYear: (value: Moment, diff: number): Moment => value.clone().add(diff, "jYear"),
    addMonth: (value: Moment, diff: number): Moment => value.clone().add(diff, "jMonth"),
    addDate: (value: Moment, diff: number): Moment => value.clone().add(diff, "day"),
    setYear: (value: Moment, year: number): Moment => value.clone().jYear(year),
    setMonth: (value: Moment, month: number): Moment => value.clone().jMonth(month),
    setDate: (value: Moment, date: number): Moment => value.clone().jDate(date),
    setHour: (value: Moment, hour: number): Moment => value.clone().hour(hour),
    setMinute: (value: Moment, minute: number): Moment => value.clone().minute(minute),
    setSecond: (value: Moment, second: number): Moment => value.clone().second(second),
    setMillisecond: (value: Moment, millisecond: number): Moment => value.clone().millisecond(millisecond),
    isAfter: (date1: Moment, date2: Moment): boolean => date1.isAfter(date2),
    isValidate: (date: Moment): boolean => date.isValid(),
    locale: {
        format: (locale: string, date: Moment, format: string): string => {
            if (!locale.startsWith("fa")) {
                return date.clone().locale(locale).format(format)
            }
            const tokenMap: Record<string, string> = {"YYYY": "jYYYY", "YY": "jYY", "MMMM": "jMMMM", "MMM": "jMMM", "MM": "jMM", "M": "jM", "DD": "jDD", "D": "jD"}
            const gregorianTokenRegex = new RegExp(Object.keys(tokenMap).join("|"), "g")
            const jalaliFormat = format.replace(gregorianTokenRegex, (match) => tokenMap[match] || match)
            return date.clone().locale(locale).format(jalaliFormat)
        },
        parse: (locale: string, text: string, formats: string[]): Moment | null => {
            const date = moment(text, formats, locale, true)
            return date.isValid() ? date : null
        },
        getWeek: (locale: string, value: Moment): number => value.clone().locale(locale).jWeek(),
        getWeekFirstDay: (locale: string): number => moment.localeData(locale).firstDayOfWeek(),
        getWeekFirstDate: (locale: string, value: Moment): Moment => value.clone().locale(locale).startOf("week"),
        getShortWeekDays: (locale: string): string[] => {
            if (locale.startsWith("fa")) {
                return ["ی", "د", "س", "چ", "پ", "ج", "ش"]
            }
            return moment.localeData(locale).weekdaysMin()
        },
        getShortMonths: (locale: string): string[] => {
            if (locale.startsWith("fa")) {
                return ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"]
            }
            return moment.localeData(locale).monthsShort()
        },
    },
}

export default jalaliMomentConfig