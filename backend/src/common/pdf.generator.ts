import PDFDocument from 'pdfkit'

export type PdfLang = 'de' | 'en'

export interface PdfSlot {
    startsAt: Date
    totalVotes: number
    yesCount: number
    maybeCount: number
    noCount: number
    voters: { yes: string[]; maybe: string[]; no: string[] }
}

export interface PollData {
    id: string
    title: string
    description?: string | null
    timezone: string
    slots: PdfSlot[]
    createdAt: Date
}

const TEXT = {
    de: {
        locale: 'de-DE',
        created: 'Erstellt',
        timezone: 'Zeitzone',
        total: 'Stimmen gesamt',
        yes: 'Ja',
        maybe: 'Vielleicht',
        no: 'Nein',
        none: '–'
    },
    en: {
        locale: 'en-GB',
        created: 'Created',
        timezone: 'Time zone',
        total: 'Votes in total',
        yes: 'Yes',
        maybe: 'Maybe',
        no: 'No',
        none: '–'
    }
} as const

/** Datum und Uhrzeit in der Zeitzone der Umfrage, 24-Stunden-Format */
function formatDateTime(date: Date, timezone: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).format(date)
}

/**
 * Erzeugt ein PDF mit Terminen, Stimmenzahl und Namen je Antwort.
 * Liefert ein Promise, weil PDFKit die Daten asynchron als Stream ausgibt.
 */
export function generatePollPDF(data: PollData, lang: PdfLang = 'de'): Promise<Buffer> {
    const t = TEXT[lang]

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on('data', chunk => buffers.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)

        // Kopfbereich
        doc.font('Helvetica-Bold').fontSize(20).fillColor('#000').text(data.title)
        if (data.description) {
            doc.font('Helvetica').fontSize(11).fillColor('#444').text(data.description)
        }
        doc.moveDown(0.5)
        doc.font('Helvetica')
            .fontSize(10)
            .fillColor('#666')
            .text(`${t.timezone}: ${data.timezone}`)
            .text(`${t.created}: ${formatDateTime(data.createdAt, data.timezone, t.locale)}`)
        doc.moveDown()

        // Ein Block pro Termin
        for (const slot of data.slots) {
            doc.font('Helvetica-Bold')
                .fontSize(12)
                .fillColor('#000')
                .text(formatDateTime(slot.startsAt, data.timezone, t.locale))

            doc.font('Helvetica')
                .fontSize(10)
                .fillColor('#000')
                .text(`${t.total}: ${slot.totalVotes}`)

            const rows: [string, number, string[]][] = [
                [t.yes, slot.yesCount, slot.voters.yes],
                [t.maybe, slot.maybeCount, slot.voters.maybe],
                [t.no, slot.noCount, slot.voters.no]
            ]
            for (const [label, count, names] of rows) {
                doc.text(`   ${label} (${count}): ${names.length ? names.join(', ') : t.none}`)
            }

            doc.moveDown(0.8)
        }

        doc.end()
    })
}
