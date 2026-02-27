'use client'

import { useRef, useState } from 'react'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { postComment } from '@/actions/guestbook'

export function GuestbookForm({ turnstileSitekey }: { turnstileSitekey: string }) {
  const [ready, setReady] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
      />
      <form ref={formRef} action={postComment} className="flex flex-col gap-2 text-sm mt-2">
        <Input
          name="name"
          placeholder="Your name"
          autoComplete="given-name"
          required
          minLength={1}
          maxLength={100}
        />
        <Textarea
          name="comment"
          placeholder="Leave a message..."
          required
          minLength={1}
          maxLength={1000}
          rows={3}
        />
        <div
          className="cf-turnstile"
          data-sitekey={turnstileSitekey}
          data-callback="__onTurnstileSuccess"
        />
        <Script id="turnstile-callback" strategy="beforeInteractive">
          {`window.__onTurnstileSuccess=function(){document.getElementById('guestbook-submit')&&(document.getElementById('guestbook-submit').disabled=false)}`}
        </Script>
        <Button id="guestbook-submit" type="submit" disabled={!ready} className="self-start">
          Post comment
        </Button>
      </form>
      <Script id="turnstile-enable" strategy="afterInteractive">
        {`window.__onTurnstileSuccess=function(){document.getElementById('guestbook-submit').disabled=false}`}
      </Script>
    </>
  )
}
