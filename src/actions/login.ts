'use server'

import config from '@payload-config'
import { login, logout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) redirect('/login?error=Email and password required')

  try {
    await login({ collection: 'users', config, email, password })
  } catch {
    redirect('/login?error=Invalid email or password')
  }

  redirect('/')
}

export async function logoutAction() {
  await logout({ config })
  redirect('/')
}
