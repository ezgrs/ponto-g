import { Inject, Injectable } from "@angular/core"
import { HTTPClient } from "../../../../application/ports/http-client"
import { APP_CONFIG, HTTP_CLIENT } from "../../config/tokens"
import { DataRepositoryUseCase } from "../../../../application/use-cases/data-repository"
import { Attendance } from "../../../../domain/entities/attendance"
import { AppConfig } from "../../config/config"
import { Employee, EmployeeData } from "../../../../domain/entities/employee"
import { AbsenceReason } from "../../../../domain/enums/absence-reason"
import { Holiday } from "../../../../domain/entities/holiday"

@Injectable({ providedIn: "root" })
export class DataRepositoryService {
    private readonly repository: DataRepositoryUseCase

    constructor(
        @Inject(HTTP_CLIENT) client: HTTPClient,
        @Inject(APP_CONFIG) config: AppConfig,
    ) {
        this.repository = new DataRepositoryUseCase(
            client,
            config.usersServiceURL,
            config.holidaysServiceURL,
        )
    }

    readAttendances(year: number, month: number): Promise<Attendance[]> {
        return this.repository.readAttendances(year, month)
    }

    readHolidays(year: number, month: number): Promise<Holiday[]> {
        return this.repository.readHolidays(year, month)
    }

    async addEmployee(employee: EmployeeData) {
        await this.repository.addEmployee(employee)
    }

    async removeEmployee(id: string) {
        await this.repository.removeEmployee(id)
    }

    async removeAbsence(id: string) {
        await this.repository.removeAbsence(id)
    }

    async addAbsence(
        employeeId: string,
        startDate: Date,
        endDate: Date,
        reason: AbsenceReason | null,
    ) {
        await this.repository.addAbsence({
            employeeId,
            startDate,
            endDate,
            reason,
        })
    }

    async syncHolidaysForYear(year: number): Promise<number> {
        return await this.repository.syncHolidaysForYear(year)
    }
}
