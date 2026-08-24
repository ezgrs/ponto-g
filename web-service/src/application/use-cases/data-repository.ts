import { Attendance } from "../../domain/entities/attendance"
import { AbsenceReason } from "../../domain/enums/absence-reason"
import { EmployeeData } from "../../domain/entities/employee"
import { Holiday } from "../../domain/entities/holiday"
import { HolidayType } from "../../domain/enums/holiday-type"
import { HolidayShift } from "../../domain/enums/holiday-shift"
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
    type?: HolidayType
    shift: "am" | "pm" | null
}

type PDFHolidayShift = "morning" | "afternoon"

type TimesheetPDFPayload = {
    title: string
    year: number
    month: number
    attendances: {
        employee: EmployeeData
        absences: Record<number, AbsenceReason | "unjustified">
    }[]
    holidays: Record<
        number,
        {
            type: HolidayType
            shifts: PDFHolidayShift[]
        }
    >
}

export class DataRepositoryUseCase {
    constructor(
        private readonly client: HTTPClient,
        private readonly usersServiceURL: URL,
        private readonly holidaysServiceURL: URL,
        private readonly pdfServiceURL: URL,
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
            type: this.normalizeHolidayType(holiday.type),
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

    async generateTimesheetPDF(
        year: number,
        month: number,
        attendances: Attendance[],
        holidays: Holiday[],
    ): Promise<Blob> {
        const url = new URL(this.pdfServiceURL)
        url.pathname = "/timesheet/pdf"

        return await this.client.postBlob(url, {
            title: "FOLHA DE PONTO",
            year,
            month,
            attendances: attendances.map((attendance) => ({
                employee: {
                    name: attendance.employee.name,
                    role: attendance.employee.role,
                    code: attendance.employee.code,
                },
                absences: this.mapAbsencesByDay(year, month, attendance.absences),
            })),
            holidays: this.mapHolidaysByDay(year, month, holidays),
        } satisfies TimesheetPDFPayload)
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

    private mapAbsencesByDay(
        year: number,
        month: number,
        absences: Attendance["absences"],
    ): Record<number, AbsenceReason | "unjustified"> {
        return absences.reduce<Record<number, AbsenceReason | "unjustified">>(
            (days, absence) => {
                const firstDay = new Date(year, month - 1, 1)
                const lastDay = new Date(year, month, 0)
                const start = this.onlyDate(
                    absence.startDate < firstDay ? firstDay : absence.startDate,
                )
                const end = this.onlyDate(
                    absence.endDate > lastDay ? lastDay : absence.endDate,
                )

                for (
                    let date = new Date(start);
                    date.getTime() <= end;
                    date.setDate(date.getDate() + 1)
                ) {
                    days[date.getDate()] = absence.reason ?? "unjustified"
                }
                return days
            },
            {},
        )
    }

    private mapHolidaysByDay(
        year: number,
        month: number,
        holidays: Holiday[],
    ): TimesheetPDFPayload["holidays"] {
        return holidays.reduce<TimesheetPDFPayload["holidays"]>(
            (days, holiday) => {
                const holidayMonth = holiday.date.getMonth() + 1
                const holidayYear = holiday.date.getFullYear()
                if (holidayMonth !== month || holidayYear !== year) return days

                days[holiday.date.getDate()] = {
                    type: this.normalizeHolidayType(holiday.type),
                    shifts: this.toPDFHolidayShifts(holiday.shift),
                }
                return days
            },
            {},
        )
    }

    private toPDFHolidayShifts(
        shift: HolidayShift | null,
    ): PDFHolidayShift[] {
        switch (shift) {
            case "am":
                return ["morning"]
            case "pm":
                return ["afternoon"]
            default:
                return ["morning", "afternoon"]
        }
    }

    private normalizeHolidayType(type: HolidayType | undefined): HolidayType {
        return type ?? "required"
    }

    private onlyDate(date: Date): number {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        ).getTime()
    }
}
