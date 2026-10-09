import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import {
    CreatePollRequest,
    CreatePollResponse,
    Poll,
    UserSession,
    VoteStatus
} from '../models/poll.model'

@Injectable({ providedIn: 'root' })
export class PollService {
    private http = inject(HttpClient)
    private base = `${environment.apiUrl}/api`

    createPoll(body: CreatePollRequest): Observable<CreatePollResponse> {
        return this.http.post<CreatePollResponse>(`${this.base}/polls`, body)
    }

    getPoll(id: string): Observable<Poll> {
        return this.http.get<Poll>(`${this.base}/polls/${id}`)
    }

    createSession(pollId: string, name: string, timezone: string): Observable<UserSession> {
        return this.http.post<UserSession>(`${this.base}/polls/${pollId}/sessions`, {
            name,
            timezone
        })
    }

    vote(pollId: string, sessionId: string, slotId: string, status: VoteStatus) {
        return this.http.post(
            `${this.base}/votes`,
            { slotId, status },
            { params: { pollId, sessionId } }
        )
    }

    getUserVotes(sessionId: string): Observable<Record<string, VoteStatus>> {
        return this.http.get<Record<string, VoteStatus>>(`${this.base}/votes/user/${sessionId}`)
    }

    pdfUrl(pollId: string): string {
        return `${this.base}/polls/${pollId}/export/pdf`
    }
}
