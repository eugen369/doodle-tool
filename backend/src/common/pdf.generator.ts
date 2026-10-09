import PDFDocument from 'pdfkit'
import { formatDateInTimezone } from './timezone.utils'

interface PollData {
    id: string
    title: string
    description?: string | null
    timezone: string
    slots: Array<{
        startsAt: Date
        endsAt?: Date | null
        yesCount: number
        maybeCount: number
        noCount: number
        totalVotes: number
    }>
    createdAt: Date
}

/**
 * Generate a PDF report of a poll with results
 */
export function generatePollPDF(data: PollData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument()
        const buffers: Buffer[] = []

        doc.on('data', chunk => buffers.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text(data.title, { align: 'left' })
        doc.fontSize(10).font('Helvetica').text(`Poll ID: ${data.id}`, { align: 'left' })
        doc.fontSize(10).text(`Created: ${data.createdAt.toISOString()}`, { align: 'left' })
        doc.moveDown()

        if (data.description) {
            doc.fontSize(12).font('Helvetica').text(data.description)
            doc.moveDown()
        }

        // Timezone info
        doc.fontSize(10).fillColor('#666').text(`Timezone: ${data.timezone}`)
        doc.moveDown()

        // Table header
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#000')
        const tableY = doc.y
        const col1 = 80
        const col2 = 150
        const col3 = 220
        const col4 = 290
        const col5 = 360

        doc.text('Time Slot', col1, tableY)
        doc.text('✓ Yes', col2, tableY)
        doc.text('~ Maybe', col3, tableY)
        doc.text('✗ No', col4, tableY)
        doc.text('Total', col5, tableY)

        doc.moveDown()
        doc.strokeColor('#ccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke()
        doc.moveDown(0.5)

        // Table rows
        doc.font('Helvetica').fontSize(10)
        data.slots.forEach(slot => {
            const timeStr = formatDateInTimezone(slot.startsAt, data.timezone)
            const rowY = doc.y

            doc.fillColor('#000')
                .text(timeStr, col1, rowY)
                .text(String(slot.yesCount), col2, rowY)
                .text(String(slot.maybeCount), col3, rowY)
                .text(String(slot.noCount), col4, rowY)
                .fillColor('#007bff')
                .font('Helvetica-Bold')
                .text(String(slot.totalVotes), col5, rowY)

            doc.moveDown()
        })

        doc.end()
    })
}
