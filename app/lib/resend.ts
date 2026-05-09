import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

export const resend = new Resend(apiKey || 're_123') // Use dummy key for build-time safety

export const EMAIL_FROM = 'Bo Restaurant <onboarding@resend.dev>'
