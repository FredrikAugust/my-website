import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginAction } from '@/actions/login'

export const metadata: Metadata = {
  title: 'Login',
}

export default function LoginPage() {
  return (
    <form action={loginAction} className="font-sans text-sm">
      <div className="flex flex-col gap-3 items-start max-w-xs">
        <Input type="email" name="email" placeholder="Email" autoComplete="username email" required />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        <Button type="submit">Login</Button>
      </div>
    </form>
  )
}
