export type VoteStatus = 'yes' | 'maybe' | 'no'

export interface PollSlot {
    id: string
    startsAt: string
    endsAt: string | null
    yesCount: number
    maybeCount: number
    noCount: number
    totalVotes: number
    percentage: number
    voters: { yes: string[]; maybe: string[]; no: string[] }
}

export interface Poll {
    id: string
    title: string
    description: string | null
    timezone: string
    createdAt: string
    slots: PollSlot[]
}

export interface CreatePollRequest {
    title: string
    description?: string
    timezone: string
    slots: { startsAt: string }[]
}

export interface CreatePollResponse {
    id: string
    title: string
    moderatorToken: string
    timezone: string
    createdAt: string
}

export interface UserSession {
    id: string
    pollId: string
}
