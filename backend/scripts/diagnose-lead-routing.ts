/**
 * Diagnose why a lead (intake) did or didn't reach an agent.
 *
 * Usage (run from backend/):
 *   npx ts-node -r tsconfig-paths/register scripts/diagnose-lead-routing.ts INT-2025-123456
 *   or
 *   LEAD_REF=INT-2025-123456 npx ts-node -r tsconfig-paths/register scripts/diagnose-lead-routing.ts
 *
 * Replace INT-2025-123456 with the reference from the test lead (confirmation email or intake-status?ref=...).
 */

import prisma from '../src/config/prisma';
import { findMatchingProfessionals } from '../src/services/routingEngine';

const ref = process.env.LEAD_REF || process.argv[2];
if (!ref) {
  console.error('Usage: npx ts-node scripts/diagnose-lead-routing.ts <REFERENCE_NUMBER>');
  console.error('Example: npx ts-node scripts/diagnose-lead-routing.ts INT-2025-123456');
  process.exit(1);
}

async function main() {
  console.log('\n--- Lead routing diagnostic ---\n');
  console.log('Reference:', ref);

  const intake = await prisma.caseIntake.findUnique({
    where: { referenceNumber: ref },
    include: {
      service: true,
      assignments: {
        include: {
          professional: { select: { id: true, email: true, fullName: true } },
        },
      },
    },
  });

  if (!intake) {
    console.error('\nNo intake found with reference:', ref);
    console.error('Check the reference number (e.g. from the confirmation email or intake-status page).');
    process.exit(1);
  }

  console.log('\n--- Intake ---');
  console.log('Id:', intake.id);
  console.log('Status:', intake.status);
  console.log('Service:', intake.service?.name, '(' + intake.service?.caseType + ')');
  console.log('Applicant country:', intake.applicantCountry);
  console.log('Destination country:', intake.destinationCountry);
  console.log('Submitted at:', intake.submittedAt);

  console.log('\n--- Assignments ---');
  if (intake.assignments.length === 0) {
    console.log('None. This lead was never assigned to any professional.');
  } else {
    for (const a of intake.assignments) {
      console.log(
        '-',
        a.professional?.email || a.professionalId,
        '| status:',
        a.status,
        '| assigned:',
        a.assignedAt
      );
    }
  }

  // Why might routing have failed?
  if (intake.status === 'no_match_found' || (intake.status === 'pending_assignment' && intake.assignments.length === 0)) {
    console.log('\n--- Why no match? ---');

    const specsForService = await prisma.professionalSpecialization.findMany({
      where: {
        serviceId: intake.serviceId,
        isAcceptingLeads: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            isActive: true,
            organizationId: true,
            subscriptionPlan: true,
          },
        },
        service: { select: { name: true, caseType: true } },
      },
    });

    console.log('Specializations for this service (' + intake.service?.name + ') with isAcceptingLeads=true:', specsForService.length);
    if (specsForService.length === 0) {
      console.log('  -> No professional has this service with "accepting leads" on. Add the service in onboarding or turn on "Accepting leads" for this service.');
      process.exit(0);
    }

    const activeSpecs = specsForService.filter((s) => s.user.isActive === true);
    console.log('After filtering isActive=true:', activeSpecs.length);
    if (activeSpecs.length === 0) {
      console.log('  -> All matching professionals have isActive=false.');
    }

    const orgIds = activeSpecs.map((s) => s.user.organizationId).filter(Boolean) as string[];
    const orgs = orgIds.length
      ? await prisma.organization.findMany({
          where: { id: { in: orgIds } },
          select: { id: true, planStatus: true, trialEndsAt: true, name: true },
        })
      : [];
    const orgMap = new Map(orgs.map((o) => [o.id, o]));

    let corridorPass = 0;
    for (const spec of activeSpecs) {
      const originPass =
        spec.originCorridors.length === 0 || spec.originCorridors.includes(intake.applicantCountry);
      const destinationPass =
        spec.destinationCorridors.length === 0 ||
        spec.destinationCorridors.includes(intake.destinationCountry);
      if (originPass && destinationPass) corridorPass++;
    }
    console.log('After corridor filter (origin/destination):', corridorPass);
    if (corridorPass === 0) {
      console.log(
        '  -> Applicant country:',
        intake.applicantCountry,
        '| Destination:',
        intake.destinationCountry
      );
      console.log(
        '  -> Professionals have origin/destination corridors that don’t include this pair. Empty corridors = accept all.'
      );
    }

    // Trial / plan filter
    let eligibleCount = 0;
    for (const spec of activeSpecs) {
      const org = spec.user.organizationId ? orgMap.get(spec.user.organizationId) : null;
      if (!org) {
        eligibleCount++;
        continue;
      }
      if (org.planStatus === 'expired') continue;
      if (org.planStatus === 'trial' && org.trialEndsAt && new Date() > new Date(org.trialEndsAt)) continue;
      const originPass =
        spec.originCorridors.length === 0 || spec.originCorridors.includes(intake.applicantCountry);
      const destinationPass =
        spec.destinationCorridors.length === 0 ||
        spec.destinationCorridors.includes(intake.destinationCountry);
      if (originPass && destinationPass) eligibleCount++;
    }
    console.log('After trial/expired + corridor:', eligibleCount);

    // Simulate routing: who would get this lead now?
    const matches = await findMatchingProfessionals(intake);
    console.log('\n--- findMatchingProfessionals() result ---');
    console.log('Number of matches (would be assigned to top one):', matches.length);
    if (matches.length > 0) {
      console.log('Top match:', matches[0].user.email, '| score:', matches[0].score);
    } else {
      console.log('No matches. Common causes: no spec for this service, corridors, trial expired, or monthly lead limit reached.');
    }
  }

  console.log('\n--- Done ---\n');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
