import { Component, computed, forwardRef, inject, signal } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { I18nService } from '../../i18n/i18n.service'

const pad = (n: number): string => String(n).padStart(2, '0')

/** Uhrzeiten im 24-Stunden-Format, 15-Minuten-Schritte */
const TIME_OPTIONS: string[] = Array.from(
    { length: 96 },
    (_, i) => `${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`
)

/** Erster Tag des Monats, Zeit auf 00:00 */
const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1)

/** Kalenderzellen eines Monats, Woche beginnt am Montag. Leere Zellen sind null. */
function calendarCells(month: Date): (Date | null)[] {
    const offset = (startOfMonth(month).getDay() + 6) % 7 // Montag = 0
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const cells: (Date | null)[] = Array.from({ length: offset }, () => null)
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(new Date(month.getFullYear(), month.getMonth(), day))
    }
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
}

/** Datum als "YYYY-MM-DD" (lokale Zeit) */
const ymd = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

@Component({
    selector: 'app-slot-picker',
    standalone: true,
    templateUrl: './slot-picker.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SlotPickerComponent),
            multi: true
        }
    ]
})
export class SlotPickerComponent implements ControlValueAccessor {
    readonly i18n = inject(I18nService)

    readonly timeOptions = TIME_OPTIONS
    readonly open = signal(false)
    readonly date = signal<Date | null>(null)
    readonly time = signal('09:00')
    readonly viewMonth = signal(startOfMonth(new Date()))

    /** Wochentage ab Montag. 1.1.2024 war ein Montag. */
    readonly weekdays = computed(() => {
        const fmt = new Intl.DateTimeFormat(this.i18n.locale(), { weekday: 'short' })
        return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)))
    })

    readonly cells = computed(() => calendarCells(this.viewMonth()))

    readonly monthLabel = computed(() =>
        new Intl.DateTimeFormat(this.i18n.locale(), { month: 'long', year: 'numeric' }).format(
            this.viewMonth()
        )
    )

    readonly display = computed(() => {
        const d = this.date()
        if (!d) return ''
        const day = new Intl.DateTimeFormat(this.i18n.locale(), {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(d)
        return `${day}, ${this.time()}`
    })

    private onChange: (value: string) => void = () => {}
    private onTouched: () => void = () => {}

    // ControlValueAccessor

    writeValue(value: string | null): void {
        const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})$/)
        if (match) {
            const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
            this.date.set(d)
            this.time.set(match[4])
            this.viewMonth.set(startOfMonth(d))
        } else {
            this.date.set(null)
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn
    }

    // Interaktion

    toggle(): void {
        this.open.update(v => !v)
        this.onTouched()
    }

    selectDay(day: Date): void {
        this.date.set(day)
        this.open.set(false)
        this.emit()
    }

    onTimeChange(event: Event): void {
        this.time.set((event.target as HTMLSelectElement).value)
        this.emit()
    }

    prevMonth(): void {
        this.viewMonth.update(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
    }

    nextMonth(): void {
        this.viewMonth.update(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))
    }

    isSelected(day: Date): boolean {
        const selected = this.date()
        return !!selected && ymd(selected) === ymd(day)
    }

    /** Gibt "YYYY-MM-DDTHH:mm" aus, passend zum Format von zonedLocalToIso */
    private emit(): void {
        const d = this.date()
        this.onChange(d ? `${ymd(d)}T${this.time()}` : '')
    }
}
