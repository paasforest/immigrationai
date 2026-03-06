# Lead routing diagnostic

If a test lead (or real lead) was submitted but the agent doesn’t see it in their dashboard, run the diagnostic script with the lead’s **reference number** (e.g. from the confirmation email or `/intake-status?ref=INT-2025-123456`).

**From the `backend/` directory:**

```bash
npx ts-node -r tsconfig-paths/register scripts/diagnose-lead-routing.ts INT-2025-123456
```

Replace `INT-2025-123456` with the actual reference.

The script will show:

- Intake status and service (applicant/destination countries).
- Any assignments (which professional got the lead and status).
- If status is `no_match_found` or still `pending_assignment`: how many professionals have the right service, how many pass corridor/trial/limits, and the result of `findMatchingProfessionals()`.

**Common causes for “lead not received”:**

1. **No specialization for this service** – Agent didn’t select this service in onboarding, or no one has “accepting leads” for it.
2. **Corridor mismatch** – Agent has origin/destination corridors that don’t include the applicant’s country or destination.
3. **Trial expired** – Organization’s trial ended; routing skips expired orgs.
4. **Monthly lead limit** – Starter plan has a monthly cap; if already reached, no new assignments.
5. **Routing ran later** – Assignments are created in a background step (`setImmediate`); if the process crashed or restarted before it ran, the lead stays `pending_assignment` and never gets assigned. Re-running the backfill script can reprocess such intakes.
