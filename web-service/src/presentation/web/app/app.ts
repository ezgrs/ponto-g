import { Component } from "@angular/core"
import { HomeComponent } from "../home/component"

@Component({
    selector: "app-root",
    imports: [HomeComponent],
    templateUrl: "./app.html",
    styleUrl: "./app.css",
})
export class App {}
