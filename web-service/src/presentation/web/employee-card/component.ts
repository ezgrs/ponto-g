import { Component, EventEmitter, Input, Output } from "@angular/core"
import { Employee } from "../../../domain/entities/employee"

@Component({
    selector: "app-employee-card",
    standalone: true,
    templateUrl: "./component.html",
})
export class EmployeeCardComponent {
    @Input() employee!: Employee
    @Output() remove = new EventEmitter<void>()

    initials(): string {
        return this.employee.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("")
    }
}
