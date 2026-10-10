import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { I18nService } from '../../i18n/i18n.service'

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './home.component.html'
})
export class HomeComponent {
    readonly i18n = inject(I18nService)
}
