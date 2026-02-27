'use client'

import { postComment } from '@/actions/guestbook'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'

export function GuestbookForm({ turnstileSitekey }: { turnstileSitekey: string }) {
  const [ready, setReady] = useState(false)

  return (
    <form action={postComment} className="flex flex-col gap-2 text-sm mt-2">
      <div className="flex flex-col gap-1">
        <Label htmlFor="guestbook-name">Name</Label>
        <Input
          id="guestbook-name"
          name="name"
          placeholder="Your name"
          autoComplete="given-name"
          required
          minLength={1}
          maxLength={100}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="guestbook-comment">Message</Label>
        <Textarea
          id="guestbook-comment"
          name="comment"
          placeholder="Leave a message..."
          required
          minLength={1}
          maxLength={1000}
          rows={3}
        />
      </div>
      <Turnstile siteKey={turnstileSitekey} onSuccess={() => setReady(true)} />
      <Button type="submit" disabled={!ready} className="self-start">
        Post comment
      </Button>
    </form>
  )
}
