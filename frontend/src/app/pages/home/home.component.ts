import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink],
    template: `
        <div class="text-center py-5">
            <h1>📅 Doodle Tool</h1>
            <p class="lead">Find the best time for your next meeting</p>
            <button routerLink="/create" class="btn btn-primary btn-lg mt-3">
                Create New Poll
            </button>
        </div>
    `
})
export class HomeComponent {}
