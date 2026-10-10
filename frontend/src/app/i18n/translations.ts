export type Lang = 'de' | 'en'

export const de = {
    'app.switch': 'English',

    'home.subtitle': 'Finde den besten Termin für dein nächstes Treffen',
    'home.create': 'Neue Umfrage erstellen',

    'create.heading': 'Neue Terminumfrage',
    'create.title': 'Titel',
    'create.description': 'Beschreibung (optional)',
    'create.timezone': 'Zeitzone der Termine',
    'create.timezoneHint': 'Die Termine unten werden in dieser Zeitzone eingegeben.',
    'create.slots': 'Terminvorschläge',
    'create.addSlot': '+ Termin hinzufügen',
    'create.submit': 'Umfrage erstellen',

    'view.displayTz': 'Anzeige in deiner Zeitzone',
    'view.copyLink': 'Link kopieren',
    'view.pdf': 'PDF',
    'view.votingAs': 'Abstimmen als',
    'view.nameLabel': 'Dein Name, um abzustimmen',
    'view.join': 'Teilnehmen',
    'view.colSlot': 'Termin',
    'view.colChoice': 'Deine Wahl',
    'view.yes': 'Ja',
    'view.maybe': 'Vielleicht',
    'view.no': 'Nein',
    'view.loading': 'Lade Umfrage …',

    'err.noSlots': 'Bitte mindestens einen Termin angeben.',
    'err.createFailed': 'Umfrage konnte nicht erstellt werden.',
    'err.joinFailed': 'Teilnahme fehlgeschlagen.',
    'err.voteFailed': 'Abstimmung fehlgeschlagen.',
    'err.notFound': 'Umfrage nicht gefunden.'
} as const

export type TranslationKey = keyof typeof de

export const en: Record<TranslationKey, string> = {
    'app.switch': 'Deutsch',

    'home.subtitle': 'Find the best time for your next meeting',
    'home.create': 'Create new poll',

    'create.heading': 'New scheduling poll',
    'create.title': 'Title',
    'create.description': 'Description (optional)',
    'create.timezone': 'Time zone of the slots',
    'create.timezoneHint': 'The slots below are entered in this time zone.',
    'create.slots': 'Time slots',
    'create.addSlot': '+ Add slot',
    'create.submit': 'Create poll',

    'view.displayTz': 'Shown in your time zone',
    'view.copyLink': 'Copy link',
    'view.pdf': 'PDF',
    'view.votingAs': 'Voting as',
    'view.nameLabel': 'Your name to vote',
    'view.join': 'Join',
    'view.colSlot': 'Slot',
    'view.colChoice': 'Your choice',
    'view.yes': 'Yes',
    'view.maybe': 'Maybe',
    'view.no': 'No',
    'view.loading': 'Loading poll …',

    'err.noSlots': 'Please add at least one time slot.',
    'err.createFailed': 'The poll could not be created.',
    'err.joinFailed': 'Joining failed.',
    'err.voteFailed': 'Voting failed.',
    'err.notFound': 'Poll not found.'
}
