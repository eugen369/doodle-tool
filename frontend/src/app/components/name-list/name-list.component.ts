import { Component, computed, input } from '@angular/core'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'

/** Anzahl Namen, die direkt sichtbar sind. Ab einem weiteren Namen erscheint ein Dropdown. */
const PREVIEW_COUNT = 2

@Component({
    selector: 'app-name-list',
    standalone: true,
    imports: [NgbDropdownModule],
    templateUrl: './name-list.component.html'
})
export class NameListComponent {
    readonly names = input.required<string[]>()

    readonly visibleNames = computed(() => this.names().slice(0, PREVIEW_COUNT))

    /** Nur die Namen ab dem dritten, die im Dropdown erscheinen */
    readonly hiddenNames = computed(() => this.names().slice(PREVIEW_COUNT))

    readonly hiddenCount = computed(() => this.hiddenNames().length)
}
