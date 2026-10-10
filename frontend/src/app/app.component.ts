import { Component, inject } from '@angular/core'
import { RouterLink, RouterOutlet } from '@angular/router'
import { I18nService } from './i18n/i18n.service'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink],
    templateUrl: './app.component.html'
})
export class AppComponent {
    readonly i18n = inject(I18nService)
}
