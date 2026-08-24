import { HolidayShift } from "../enums/holiday-shift"
import { HolidayType } from "../enums/holiday-type"

export type Holiday = {
    id: string
    date: Date
    name: string
    type: HolidayType
    shift: HolidayShift | null
}
