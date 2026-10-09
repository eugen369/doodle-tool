import { Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NameListComponent } from '../../components/name-list/name-list.component'
import { ActivatedRoute } from '@angular/router'
import { Poll, PollSlot, VoteStatus } from '../../models/poll.model'
import { PollService } from '../../services/poll.service'
import { browserTimezone, formatInTz } from '../../utils/time'

interface Participant {
    id: string
    name: string
}

@Component({
    selector: 'app-view-poll',
    standalone: true,
    imports: [FormsModule, NameListComponent],
    templateUrl: './view-poll.component.html'
})
export class ViewPollComponent {
    private route = inject(ActivatedRoute)
    private api = inject(PollService)

    readonly pollId = this.route.snapshot.paramMap.get('id') ?? ''
    readonly myTimezone = browserTimezone()
    readonly options: { value: VoteStatus; label: string }[] = [
        { value: 'yes', label: 'Ja' },
        { value: 'maybe', label: 'Vielleicht' },
        { value: 'no', label: 'Nein' }
    ]

    readonly poll = signal<Poll | null>(null)
    readonly userVotes = signal<Record<string, VoteStatus>>({})
    readonly participant = signal<Participant | null>(this.loadParticipant())
    readonly error = signal<string | null>(null)
    name = ''

    /** Slots chronologisch sortieren, damit die Reihenfolge beim Abstimmen stabil bleibt */
    readonly sortedSlots = computed(() =>
        [...(this.poll()?.slots ?? [])].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    )

    /** Der Termin mit den meisten Ja-Stimmen (nur wenn mindestens eine Stimme vorhanden) */
    readonly bestSlotId = computed(() => {
        const best = (this.poll()?.slots ?? []).reduce<PollSlot | null>(
            (acc, s) => (!acc || s.yesCount > acc.yesCount ? s : acc),
            null
        )
        return best && best.yesCount > 0 ? best.id : null
    })

    get pdfUrl(): string {
        return this.api.pdfUrl(this.pollId)
    }

    constructor() {
        this.load()
    }

    formatSlot(iso: string): string {
        return formatInTz(iso, this.myTimezone)
    }

    copyLink(): void {
        navigator.clipboard.writeText(window.location.href)
    }

    join(): void {
        const name = this.name.trim()
        if (!name) return

        this.api.createSession(this.pollId, name, this.myTimezone).subscribe({
            next: session => {
                const me: Participant = { id: session.id, name }
                localStorage.setItem(this.storageKey, JSON.stringify(me))
                this.participant.set(me)
                this.load()
            },
            error: () => this.error.set('Teilnahme fehlgeschlagen.')
        })
    }

    vote(slotId: string, status: VoteStatus): void {
        const me = this.participant()
        if (!me) return

        this.api.vote(this.pollId, me.id, slotId, status).subscribe({
            next: () => this.load(),
            error: () => this.error.set('Abstimmung fehlgeschlagen.')
        })
    }

    private load(): void {
        this.api.getPoll(this.pollId).subscribe({
            next: poll => {
                this.poll.set(poll)
                this.error.set(null)
            },
            error: () => this.error.set('Umfrage nicht gefunden.')
        })

        const me = this.participant()
        if (me) {
            this.api.getUserVotes(me.id).subscribe(votes => this.userVotes.set(votes))
        }
    }

    private get storageKey(): string {
        return `participant:${this.pollId}`
    }

    private loadParticipant(): Participant | null {
        const raw = localStorage.getItem(`participant:${this.route.snapshot.paramMap.get('id')}`)
        return raw ? (JSON.parse(raw) as Participant) : null
    }
}
