import { Component, EventEmitter, Output } from "@angular/core"
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms"
import { Employee, EmployeeData } from "../../../domain/entities/employee"
import { NgxMaskDirective } from "ngx-mask"

@Component({
    selector: "app-employee-form",
    standalone: true,
    imports: [ReactiveFormsModule, NgxMaskDirective],
    templateUrl: "./component.html",
})
export class EmployeeFormComponent {
    @Output() add = new EventEmitter<EmployeeData>()

    form = new FormGroup({
        name: new FormControl("", {
            nonNullable: true,
            validators: [Validators.required],
        }),
        code: new FormControl("", {
            nonNullable: true,
            validators: [
                Validators.required,
                Validators.pattern(/^\d{7}-\d{3}$/),
            ],
        }),
        role: new FormControl("", {
            nonNullable: true,
            validators: [Validators.required],
        }),
    })

    submit() {
        if (this.form.invalid) return

        this.add.emit({ ...this.form.getRawValue() })
        this.form.reset()
    }
}
