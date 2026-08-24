import { HolidayShift, holidayShifts } from "@/domain/enums/holiday-shift.js"
import { holidayTypes } from "@/domain/enums/holiday-type.js"
import type { HolidayType } from "@/domain/enums/holiday-type.js"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({ name: "holidays" })
export class HolidayEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id!: string

    @Column({ name: "date", type: "date" })
    date!: Date

    @Column({ name: "name", type: "varchar", length: 255 })
    name!: string

    @Column({
        name: "type",
        type: "enum",
        enum: holidayTypes,
    })
    type!: HolidayType

    @Column({
        name: "shift",
        type: "enum",
        enum: holidayShifts,
        nullable: true,
    })
    shift!: HolidayShift | null
}
