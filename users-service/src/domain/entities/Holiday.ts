import { HolidayShift } from "@/domain/enums/holiday-shift.js"
import { HolidayType } from "@/domain/enums/holiday-type.js"

export type Holiday = {
    id: string
    date: Date
    name: string
    type: HolidayType
    shift: HolidayShift | null
}
