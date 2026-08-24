import {
    Component,
    computed,
    signal,
    WritableSignal,
} from "@angular/core"
import { EmployeeFormComponent } from "../employee-form/component"
import { EmployeeCardComponent } from "../employee-card/component"
import { Employee, EmployeeData } from "../../../domain/entities/employee"
import { Attendance } from "../../../domain/entities/attendance"
import { Holiday } from "../../../domain/entities/holiday"
import { HolidayShift } from "../../../domain/enums/holiday-shift"
import { HolidayType } from "../../../domain/enums/holiday-type"
import { AbsenceReason } from "../../../domain/enums/absence-reason"
import { DataRepositoryService } from "../core/services/data-repository.service"
import { ToastService } from "../core/services/toast.service"
import { Snapshot } from "../core/snapshot"
import { isConnectionError } from "../core/errors"
import { MatButtonModule } from "@angular/material/button"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"

type MonthOfTheYear = { year: number; month: number }
type SelectedAbsence = {
    id: string
    employee: Employee
    startDate: Date
    endDate: Date
    reason: string
    range: string
}
type LocalHoliday = Holiday
type CalendarDay = {
    date: Date
    day: number
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
    hasAbsence: boolean
    hasHoliday: boolean
}

@Component({
    selector: "app-home",
    imports: [
        EmployeeFormComponent,
        EmployeeCardComponent,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: "./component.html",
})
export class HomeComponent {
    readonly weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
    readonly selectedDate = signal<Date | null>(new Date())
    readonly selectedEmployeeId = signal<string | null>(null)
    readonly selectedAbsenceReason = signal<AbsenceReason>("annualLeave")
    readonly absenceStartDate = signal(this.toDateKey(new Date()))
    readonly absenceEndDate = signal(this.toDateKey(new Date()))
    readonly localHolidays = signal<LocalHoliday[]>([])
    readonly holidayDialogOpen = signal(false)
    readonly holidayType = signal<HolidayType>("required")
    readonly holidayName = signal("")
    readonly holidayShift = signal<HolidayShift | "">("")
    readonly generatingPDF = signal(false)
    private readonly currentMonth = signal<MonthOfTheYear>(
        this.toMonth(new Date()),
    )
    readonly attendances$: WritableSignal<Snapshot<Attendance[]>> = signal({
        type: "waiting",
    })
    readonly holidays = signal<Holiday[]>([])

    readonly monthLabel = computed(() => {
        const { year, month } = this.currentMonth()
        return this.formatMonth(new Date(year, month - 1, 1))
    })

    readonly selectedDateLabel = computed(() =>
        this.selectedDate() ? this.formatDate(this.selectedDate()!) : null,
    )

    readonly yearLabel = computed(() => String(this.currentMonth().year))

    readonly allHolidays = computed(() => {
        const { month, year } = this.currentMonth()
        const localHolidays = this.localHolidays().filter((holiday) => {
            const holidayMonth = this.toMonth(holiday.date)
            return holidayMonth.month === month && holidayMonth.year === year
        })
        return [...this.holidays(), ...localHolidays]
    })

    readonly selectedLocalHoliday = computed(() => {
        const selectedDate = this.selectedDate()
        if (!selectedDate) return null
        return (
            this.localHolidays().find((holiday) =>
                this.isSameDate(holiday.date, selectedDate),
            ) ?? null
        )
    })

    readonly selectedRemoteHoliday = computed(() => {
        const selectedDate = this.selectedDate()
        if (!selectedDate) return null
        return (
            this.holidays().find((holiday) =>
                this.isSameDate(holiday.date, selectedDate),
            ) ?? null
        )
    })

    readonly hasValidAbsenceRange = computed(() => {
        const startDate = this.parseDateInput(this.absenceStartDate())
        const endDate = this.parseDateInput(this.absenceEndDate())
        return !!startDate && !!endDate && this.onlyDate(startDate) <= this.onlyDate(endDate)
    })

    readonly calendarDays = computed<CalendarDay[]>(() => {
        const { year, month } = this.currentMonth()
        const firstDay = new Date(year, month - 1, 1)
        const gridStart = new Date(firstDay)
        gridStart.setDate(firstDay.getDate() - firstDay.getDay())

        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(gridStart)
            date.setDate(gridStart.getDate() + index)
            return {
                date,
                day: date.getDate(),
                isCurrentMonth: date.getMonth() === month - 1,
                isToday: this.isSameDate(date, new Date()),
                isSelected: this.isSameDate(date, this.selectedDate()),
                hasAbsence: this.hasAbsenceOnDate(date),
                hasHoliday: this.hasHolidayOnDate(date),
            }
        })
    })

    readonly selectedAbsences = computed<SelectedAbsence[]>(() => {
        const snapshot = this.attendances$()
        if (snapshot.type !== "done") return []

        const selectedDate = this.selectedDate()
        if (!selectedDate) return []

        return snapshot.value.flatMap((attendance) =>
            attendance.absences
                .filter((absence) =>
                    this.isDateInRange(
                        selectedDate,
                        absence.startDate,
                        absence.endDate,
                    ),
                )
                .map((absence) => ({
                    id: absence.id,
                    employee: attendance.employee,
                    startDate: absence.startDate,
                    endDate: absence.endDate,
                    reason: this.reasonLabel(absence.reason),
                    range: this.formatDateRange(absence.startDate, absence.endDate),
                })),
        )
    })

    readonly summary = computed(() => {
        const snapshot = this.attendances$()
        if (snapshot.type !== "done") {
            return { employees: 0, absences: 0, selectedAbsences: 0, holidays: 0 }
        }

        return {
            employees: snapshot.value.length,
            absences: snapshot.value.reduce(
                (total, attendance) => total + attendance.absences.length,
                0,
            ),
            selectedAbsences: this.selectedAbsences().length,
            holidays: this.allHolidays().length,
        }
    })

    readonly isConnectionError = isConnectionError

    constructor(
        private readonly dataRepository: DataRepositoryService,
        private readonly toast: ToastService,
    ) {
        this.pushMonthData(this.currentMonth())
    }

    retry() {
        this.pushMonthData(this.currentMonth())
    }

    previousMonth() {
        this.changeMonth(-1)
    }

    nextMonth() {
        this.changeMonth(1)
    }

    selectDate(date: Date | null) {
        if (!date) return

        if (this.isSameDate(date, this.selectedDate())) {
            this.selectedDate.set(null)
            this.selectedEmployeeId.set(null)
            this.absenceStartDate.set("")
            this.absenceEndDate.set("")
            return
        }

        this.selectedDate.set(date)
        this.selectedEmployeeId.set(null)
        this.absenceStartDate.set(this.toDateKey(date))
        this.absenceEndDate.set(this.toDateKey(date))
        const updatedMonth = this.toMonth(date)
        const currentMonth = this.currentMonth()
        if (
            updatedMonth.month !== currentMonth.month ||
            updatedMonth.year !== currentMonth.year
        ) {
            this.currentMonth.set(updatedMonth)
            this.pushMonthData(updatedMonth)
        }
    }

    selectEmployeeForAbsence(event: Event) {
        const select = event.target as HTMLSelectElement
        this.selectedEmployeeId.set(select.value || null)
    }

    selectAbsenceReason(event: Event) {
        const select = event.target as HTMLSelectElement
        this.selectedAbsenceReason.set(select.value as AbsenceReason)
    }

    openHolidayDialog() {
        if (
            !this.selectedDate() ||
            this.selectedRemoteHoliday() ||
            this.selectedLocalHoliday()
        ) return

        this.holidayType.set("required")
        this.holidayName.set("")
        this.holidayShift.set("")
        this.holidayDialogOpen.set(true)
    }

    closeHolidayDialog() {
        this.holidayDialogOpen.set(false)
    }

    updateHolidayType(event: Event) {
        const select = event.target as HTMLSelectElement
        this.holidayType.set(select.value as HolidayType)
    }

    updateHolidayName(event: Event) {
        const input = event.target as HTMLInputElement
        this.holidayName.set(input.value)
    }

    updateHolidayShift(event: Event) {
        const select = event.target as HTMLSelectElement
        this.holidayShift.set(select.value as HolidayShift | "")
    }

    addLocalHoliday() {
        const date = this.selectedDate()
        const name = this.holidayName().trim()
        if (!date || !name) return

        const hasLocalHoliday = this.localHolidays().some((holiday) =>
            this.isSameDate(holiday.date, date),
        )
        const hasLoadedHoliday = this.holidays().some((holiday) =>
            this.isSameDate(holiday.date, date),
        )
        if (hasLocalHoliday || hasLoadedHoliday) {
            this.toast.error("Já existe um feriado para esta data.")
            return
        }

        this.localHolidays.update((holidays) => [
            ...holidays,
            {
                id: `local:${this.toDateKey(date)}`,
                date,
                name,
                type: this.holidayType(),
                shift: this.holidayShift() || null,
            },
        ])
        this.selectedDate.set(date)
        this.selectedEmployeeId.set(null)
        this.absenceStartDate.set(this.toDateKey(date))
        this.absenceEndDate.set(this.toDateKey(date))
        const updatedMonth = this.toMonth(date)
        const currentMonth = this.currentMonth()
        if (
            updatedMonth.month !== currentMonth.month ||
            updatedMonth.year !== currentMonth.year
        ) {
            this.currentMonth.set(updatedMonth)
            this.pushMonthData(updatedMonth)
        }
        this.closeHolidayDialog()
        this.toast.success("Feriado adicionado localmente.")
    }

    removeLocalHoliday(id: string) {
        this.localHolidays.update((holidays) =>
            holidays.filter((holiday) => holiday.id !== id),
        )
        this.toast.success("Feriado local removido.")
    }

    updateAbsenceStartDate(event: Event) {
        const input = event.target as HTMLInputElement
        this.absenceStartDate.set(input.value)
    }

    updateAbsenceEndDate(event: Event) {
        const input = event.target as HTMLInputElement
        this.absenceEndDate.set(input.value)
    }

    async syncHolidaysForCurrentYear() {
        const year = this.currentMonth().year
        try {
            const total = await this.dataRepository.syncHolidaysForYear(year)
            if (total === 0) {
                this.toast.success("Feriados do ano ja estavam sincronizados.")
            } else {
                this.toast.success("Feriados do ano sincronizados.")
            }
            this.pushMonthData(this.currentMonth())
        } catch (e) {
            this.toast.error("Nao foi possivel sincronizar os feriados.")
        }
    }

    async generatePDF() {
        const snapshot = this.attendances$()
        if (snapshot.type !== "done" || this.generatingPDF()) return

        const { year, month } = this.currentMonth()
        this.generatingPDF.set(true)
        try {
            const file = await this.dataRepository.generateTimesheetPDF(
                year,
                month,
                snapshot.value,
                this.allHolidays(),
            )
            this.downloadPDF(file, `frequencia-${year}-${String(month).padStart(2, "0")}.pdf`)
            this.toast.success("PDF gerado.")
        } catch (e) {
            this.toast.error("Não foi possível gerar o PDF.")
        } finally {
            this.generatingPDF.set(false)
        }
    }

    async addAbsence() {
        const employeeId = this.selectedEmployeeId()
        const startDate = this.parseDateInput(this.absenceStartDate())
        const endDate = this.parseDateInput(this.absenceEndDate())
        if (!employeeId || !startDate || !endDate || !this.hasValidAbsenceRange()) return

        try {
            await this.dataRepository.addAbsence(
                employeeId,
                startDate,
                endDate,
                this.selectedAbsenceReason(),
            )
            this.toast.success("Ausencia cadastrada.")
            this.selectedEmployeeId.set(null)
            this.pushMonthData(this.currentMonth())
        } catch (e) {
            this.toast.error("Nao foi possivel cadastrar a ausencia.")
        }
    }

    async removeAbsence(id: string) {
        try {
            await this.dataRepository.removeAbsence(id)
            this.toast.success("Ausencia removida.")
            this.pushMonthData(this.currentMonth())
        } catch (e) {
            this.toast.error("Nao foi possivel remover a ausencia.")
        }
    }

    async addEmployee(employee: EmployeeData) {
        try {
            await this.dataRepository.addEmployee(employee)
        } catch (e) {
            if (e instanceof TypeError && e.message === "Failed to fetch") {
                this.toast.error(
                    "A connection error has ocurred while adding an employee.",
                )
            } else {
                this.toast.error("An unexpected error has ocurred.")
            }
            return
        }
        this.pushMonthData(this.currentMonth())
    }

    async removeEmployee(id: string) {
        try {
            await this.dataRepository.removeEmployee(id)
        } catch (e) {
            if (e instanceof TypeError && e.message === "Failed to fetch") {
                this.toast.error(
                    "A connection error has ocurred while removing the employee.",
                )
            } else {
                this.toast.error("An unexpected error has ocurred.")
            }
            return
        }
        this.pushMonthData(this.currentMonth())
    }

    private pushMonthData(month: MonthOfTheYear): void {
        this.attendances$.set({ type: "waiting" })
        Promise.all([
            this.dataRepository.readAttendances(month.year, month.month),
            this.dataRepository.readHolidays(month.year, month.month),
        ])
            .then(([attendances, holidays]) => {
                this.holidays.set(holidays)
                this.attendances$.set({ type: "done", value: attendances })
            })
            .catch((e) => {
                this.attendances$.set({ type: "error", value: e })
            })
    }

    private changeMonth(offset: number): void {
        const current = this.currentMonth()
        const nextDate = new Date(current.year, current.month - 1 + offset, 1)
        const nextMonth = this.toMonth(nextDate)
        this.currentMonth.set(nextMonth)
        this.selectedDate.set(null)
        this.selectedEmployeeId.set(null)
        this.absenceStartDate.set("")
        this.absenceEndDate.set("")
        this.pushMonthData(nextMonth)
    }

    private toMonth(date: Date): MonthOfTheYear {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
        }
    }

    private toDateKey(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    private parseDateInput(value: string): Date | null {
        if (!value) return null
        const [year, month, day] = value.split("-").map(Number)
        if (!year || !month || !day) return null
        return new Date(year, month - 1, day)
    }

    private formatMonth(date: Date): string {
        return new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric",
        }).format(date)
    }

    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(date)
    }

    private formatShortDate(date: Date): string {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date)
    }

    private formatDateRange(startDate: Date, endDate: Date): string {
        if (this.isSameDate(startDate, endDate)) return this.formatShortDate(startDate)
        return `${this.formatShortDate(startDate)} a ${this.formatShortDate(endDate)}`
    }

    private isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
        const current = this.onlyDate(date)
        return (
            current >= this.onlyDate(startDate) &&
            current <= this.onlyDate(endDate)
        )
    }

    private onlyDate(date: Date): number {
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        ).getTime()
    }

    private downloadPDF(file: Blob, filename: string): void {
        const url = URL.createObjectURL(file)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    }

    private isSameDate(left: Date | null, right: Date | null): boolean {
        if (!left || !right) return false
        return this.onlyDate(left) === this.onlyDate(right)
    }

    private hasAbsenceOnDate(date: Date): boolean {
        const snapshot = this.attendances$()
        if (snapshot.type !== "done") return false

        return snapshot.value.some((attendance) =>
            attendance.absences.some((absence) =>
                this.isDateInRange(date, absence.startDate, absence.endDate),
            ),
        )
    }

    private hasHolidayOnDate(date: Date): boolean {
        return this.allHolidays().some((holiday) =>
            this.isSameDate(date, holiday.date),
        )
    }

    private reasonLabel(reason: string | null): string {
        switch (reason) {
            case "annualLeave":
                return "Férias"
            case "sickLeave":
                return "Atestado"
            case "medicalLeave":
                return "Licença médica"
            case "longServiceLeave":
                return "Licença prêmio"
            default:
                return "Ausência"
        }
    }
}
