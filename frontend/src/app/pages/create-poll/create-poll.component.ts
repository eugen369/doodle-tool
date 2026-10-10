import { Component, inject, signal } from '@angular/core'
import {
    FormArray,
    FormBuilder,
    FormControl,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { Router } from '@angular/router'
import { I18nService } from '../../i18n/i18n.service'
import { TranslationKey } from '../../i18n/translations'
import { PollService } from '../../services/poll.service'
import { browserTimezone, COMMON_TIMEZONES, zonedLocalToIso } from '../../utils/time'

@Component({
    selector: 'app-create-poll',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './create-poll.component.html'
})
export class CreatePollComponent {
    private fb = inject(FormBuilder)
    private api = inject(PollService)
    private router = inject(Router)
    readonly i18n = inject(I18nService)

    readonly timezones = COMMON_TIMEZONES
    readonly saving = signal(false)
    readonly error = signal<TranslationKey | null>(null)

    readonly form = this.fb.nonNullable.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        timezone: [browserTimezone(), Validators.required],
        slots: this.fb.array([this.newSlot()])
    })

    get slots(): FormArray<FormControl<string>> {
        return this.form.controls.slots
    }

    addSlot(): void {
        this.slots.push(this.newSlot())
    }

    removeSlot(index: number): void {
        this.slots.removeAt(index)
    }

    submit(): void {
        this.error.set(null)
        if (this.form.invalid) {
            this.form.markAllAsTouched()
            return
        }

        const { title, description, timezone } = this.form.getRawValue()

        // Leere Felder ignorieren, doppelte Zeiten entfernen (Backend ist unique pro Poll)
        const locals = [...new Set(this.slots.controls.map(c => c.value).filter(v => v))]
        if (locals.length === 0) {
            this.error.set('err.noSlots')
            return
        }

        const slots = locals.map(local => ({ startsAt: zonedLocalToIso(local, timezone) }))

        this.saving.set(true)
        this.api
            .createPoll({
                title: title.trim(),
                description: description.trim() || undefined,
                timezone,
                slots
            })
            .subscribe({
                next: poll => this.router.navigate(['/poll', poll.id]),
                error: () => {
                    this.saving.set(false)
                    this.error.set('err.createFailed')
                }
            })
    }

    private newSlot(): FormControl<string> {
        return this.fb.nonNullable.control('')
    }
}
