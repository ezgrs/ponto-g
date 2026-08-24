import { Attendance } from "../../domain/entities/attendance"
import { AbsenceReason } from "../../domain/enums/absence-reason"
import { EmployeeData } from "../../domain/entities/employee"
import { Holiday } from "../../domain/entities/holiday"
import { HolidayType } from "../../domain/enums/holiday-type"
import { ReadAbsencesDTOSchema } from "../dto/ReadAbsencesDto"
import { HTTPClient } from "../ports/http-client"

type CreateAbsenceData = {
    employeeId: string
    startDate: Date
    endDate: Date
    reason: AbsenceReason | null
}

type OfficialHolidayDTO = {
    date: string
    name: string
    type: HolidayType
    scope: string
}

type HolidayDTO = {
    id: string
    date: string
    name: string
    type: HolidayType
    shift: "am" | "pm" | null
}

export class DataRepositoryUseCase {
    constructor(
        private readonly client: HTTPClient,
        private readonly usersServiceURL: URL,
        private readonly holidaysServiceURL: URL,
    ) {}

    async readAttendances(year: number, month: number): Promise<Attendance[]> {
        const url = new URL(this.usersServiceURL)
        url.pathname = `/attendances/${year}/${month}`
        const data = await this.client.get(url)
        const dtos = ReadAbsencesDTOSchema.array().parse(data)
        return dtos.map((attendanceDto) => ({
            employee: attendanceDto.employee,
            absences: attendanceDto.absences.map((absenceDto) => ({
                id: absenceDto.id,
                employeeId: absenceDto.employeeId,
                startDate: this.parseDateOnly(absenceDto.startDate),
                endDate: this.parseDateOnly(absenceDto.endDate),
                reason: absenceDto.reason ?? null,
            })),
        }))
    }

    async readHolidays(year: number, month: number): Promise<Holiday[]> {
        const url = new URL(this.usersServiceURL)
        url.pathname = `/holidays/${year}/${month}`
        const data = (await this.client.get(url)) as HolidayDTO[]
        return data.map((holiday) => ({
            id: holiday.id,
            date: this.parseDateOnly(holiday.date),
            name: holiday.name,
            type: holiday.type,
            shift: holiday.shift,
        }))
    }

    async addEmployee(employee: EmployeeData) {
        const url = new URL(this.usersServiceURL)
        url.pathname = `/employees`
        await this.client.post(url, employee)
    }

    async removeEmployee(id: string) {
        const url = new URL(this.usersServiceURL)
        url.pathname = `/employees/${id}`
        await this.client.delete(url)
    }

    async removeAbsence(id: string) {
        const url = new URL(this.usersServiceURL)
        url.pathname = `/absences/${id}`
        await this.client.delete(url)
    }

    async addAbsence(data: CreateAbsenceData) {
        const url = new URL(this.usersServiceURL)
        url.pathname = "/absences"
        await this.client.post(url, {
            employeeId: data.employeeId,
            startDate: this.toDateKey(data.startDate),
            endDate: this.toDateKey(data.endDate),
            reason: data.reason,
        })
    }

    async syncHolidaysForYear(year: number): Promise<number> {
        const syncURL = new URL(this.holidaysServiceURL)
        syncURL.pathname = "/holidays/sync"
        syncURL.searchParams.set("year", String(year))
        await this.client.post(syncURL, undefined)

        let created = 0
        for (let month = 1; month <= 12; month++) {
            const holidaysURL = new URL(this.holidaysServiceURL)
            holidaysURL.pathname = `/holidays/${year}/${month}`
            const officialHolidays = (await this.client.get(
                holidaysURL,
            )) as OfficialHolidayDTO[]

            const existingHolidays = await this.readHolidays(year, month)
            const existingKeys = new Set(
                existingHolidays.map(
                    (holiday) => `${this.toDateKey(holiday.date)}:${holiday.name}`,
                ),
            )

            for (const holiday of officialHolidays) {
                const key = `${holiday.date}:${holiday.name}`
                if (existingKeys.has(key)) continue

                const url = new URL(this.usersServiceURL)
                url.pathname = "/holidays"
                await this.client.post(url, {
                    date: holiday.date,
                    name: holiday.name,
                    type: holiday.type,
                    shift: null,
                })
                created++
            }
        }

        return created
    }

    private toDateKey(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    private parseDateOnly(value: string): Date {
        const [date] = value.split("T")
        const [year, month, day] = date.split("-").map(Number)
        return new Date(year, month - 1, day)
    }
}
