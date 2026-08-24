export interface EmployeeData {
    name: string
    code: string
    role: string
}

export interface Employee extends EmployeeData {
    id: string
}
