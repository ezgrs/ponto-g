import { HolidayShift, holidayShifts } from "@/domain/enums/holiday-shift.js"
import { holidayTypes } from "@/domain/enums/holiday-type.js"
import type { HolidayType } from "@/domain/enums/holiday-type.js"
import {
    IsEnum,
    IsISO8601,
    IsOptional,
    IsString,
    Length,
} from "class-validator"

export class CreateHolidayDTO {
    @IsString()
    @IsISO8601({ strict: true })
    date!: Date

    @IsString()
    @Length(1, 255)
    name!: string

    @IsString()
    @IsEnum(holidayTypes)
    type!: HolidayType

    @IsOptional()
    @IsString()
    @IsEnum(holidayShifts)
    shift: HolidayShift | undefined
}
