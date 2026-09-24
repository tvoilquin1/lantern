import { z } from 'zod';

export const EMERGENCY_CONTACT_SCHEMA = z.object({
  ready: z
    .boolean()
    .describe(
      'True once the caregiver has either given a name, relationship, and email for an emergency contact, or has clearly said they want to skip this',
    ),
  skipped: z.boolean().describe('True if the caregiver declined to provide an emergency contact'),
  name: z.string().nullable().describe("The contact's name, if given"),
  email: z.string().nullable().describe("The contact's email address, if given"),
  phone: z
    .string()
    .nullable()
    .describe("The contact's phone number, if given (stored for reference only — not used to send anything yet)"),
  relationship: z
    .string()
    .nullable()
    .describe("The contact's relationship to the caregiver (e.g. sibling, friend, adult child), if given"),
});
