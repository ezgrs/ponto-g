export const holidayTypes = ["required", "optional"] as const

export type HolidayType = (typeof holidayTypes)[number]
