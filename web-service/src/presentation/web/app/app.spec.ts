import { TestBed } from "@angular/core/testing"
import { App } from "./app"
import { DataRepositoryService } from "../core/services/data-repository.service"

describe("App", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
            providers: [
                {
                    provide: DataRepositoryService,
                    useValue: {
                        readAttendances: () => Promise.resolve([]),
                        addEmployee: () => Promise.resolve(),
                        removeEmployee: () => Promise.resolve(),
                    },
                },
            ],
        }).compileComponents()
    })

    it("should create the app", () => {
        const fixture = TestBed.createComponent(App)
        const app = fixture.componentInstance
        expect(app).toBeTruthy()
    })

    it("should render title", async () => {
        const fixture = TestBed.createComponent(App)
        await fixture.whenStable()
        const compiled = fixture.nativeElement as HTMLElement
        expect(compiled.querySelector("h1")?.textContent).toContain(
            "Gerador de PDF",
        )
    })
})
