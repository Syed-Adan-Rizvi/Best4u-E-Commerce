// src/lib/resend.js
import { Resend } from 'resend';

// .env file se key utha kar Resend ko start kar rahe hain
export const resend = new Resend(process.env.RESEND_API_KEY);