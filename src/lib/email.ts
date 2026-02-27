import { Resend } from 'resend'

export async function sendGuestbookNotification(name: string, message: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[dev] Guestbook comment from ${name}: ${message}`)
    return
  }

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: `${name} <noreply@fredrikmalmo.com>`,
    to: ['Fredrik Malmo <contact@fredrikmalmo.com>'],
    subject: `New guestbook comment from ${name}`,
    text: `You've gotten a new guestbook comment from ${name}.\n\n${message}`,
  })
}
