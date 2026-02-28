/**
 * One-time backfill script:
 * 1. For every professional with an organization but no ProfessionalSpecialization records,
 *    create a specialization for EVERY service in the catalog.
 * 2. Re-queue any caseIntake that is stuck in "no_match_found" so the routing engine
 *    gets another chance now that there are matching professionals.
 *
 * Usage: npx ts-node --project tsconfig.json scripts/backfill-specializations.ts
 */

import { PrismaClient } from '@prisma/client';
import { assignIntake } from '../src/services/routingEngine';

const prisma = new PrismaClient();

async function run() {
  console.log('🔧 Backfilling professional specializations...');

  // All services
  const services = await prisma.serviceCatalog.findMany({ select: { id: true, name: true } });
  console.log(`   Found ${services.length} services in catalog.`);

  // All professionals WITH an organization
  const professionals = await prisma.user.findMany({
    where: {
      organizationId: { not: null },
      role: { in: ['org_admin', 'user', 'staff'] },
    },
    select: { id: true, email: true, organizationId: true },
  });
  console.log(`   Found ${professionals.length} professionals with an organization.`);

  let created = 0;
  let skipped = 0;

  for (const pro of professionals) {
    // Check existing specializations
    const existingCount = await prisma.professionalSpecialization.count({
      where: { userId: pro.id },
    });

    if (existingCount === services.length) {
      skipped++;
      continue; // Already has all services
    }

    // Get which serviceIds this user already has
    const existing = await prisma.professionalSpecialization.findMany({
      where: { userId: pro.id },
      select: { serviceId: true },
    });
    const existingServiceIds = new Set(existing.map((e) => e.serviceId));

    // Create missing ones
    const toCreate = services
      .filter((s) => !existingServiceIds.has(s.id))
      .map((s) => ({
        userId: pro.id,
        organizationId: pro.organizationId as string,
        serviceId: s.id,
        originCorridors: [] as string[],
        destinationCorridors: [] as string[],
        isAcceptingLeads: true,
        maxConcurrentLeads: 10,
      }));

    if (toCreate.length > 0) {
      await prisma.professionalSpecialization.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      console.log(`   ✅ ${pro.email}: created ${toCreate.length} specializations`);
      created += toCreate.length;
    }
  }

  console.log(`\n   Specializations created: ${created}, professionals already complete: ${skipped}`);

  // Re-queue stuck no_match_found intakes
  console.log('\n🔄 Re-queuing no_match_found intakes...');

  const stuckIntakes = await prisma.caseIntake.findMany({
    where: { status: 'no_match_found' },
    select: { id: true, serviceId: true, applicantEmail: true },
  });

  console.log(`   Found ${stuckIntakes.length} stuck intakes.`);

  let reRouted = 0;
  for (const intake of stuckIntakes) {
    // Reset to pending_assignment so assignIntake will process it
    await prisma.caseIntake.update({
      where: { id: intake.id },
      data: { status: 'pending_assignment' },
    });

    try {
      const result = await assignIntake(intake.id);
      if (result) {
        console.log(`   ✅ Re-routed intake ${intake.id} (${intake.applicantEmail})`);
        reRouted++;
      } else {
        console.log(`   ⚠️  Still no match for intake ${intake.id} (${intake.applicantEmail})`);
      }
    } catch (err: any) {
      console.error(`   ❌ Error routing intake ${intake.id}: ${err.message}`);
    }
  }

  console.log(`\n   Re-routed: ${reRouted}/${stuckIntakes.length} intakes`);
  console.log('\n✅ Backfill complete.');
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
