export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.CF_TURNSTILE_SECRET
  if (!secret) return false

  const form = new FormData()
  form.set('secret', secret)
  form.set('response', token)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  })

  const data = await res.json()
  return data.success === true
}
