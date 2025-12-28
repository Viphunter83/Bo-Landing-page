import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
    console.warn('RESEND_API_KEY is not defined')
}

export const resend = new Resend(apiKey)

export const EMAIL_FROM = 'Bo Restaurant <onboarding@resend.dev>' // Default for testing, user should change this
