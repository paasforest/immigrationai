import prisma from '../config/prisma';

export async function runSeed() {
  const services = [
    {
      slug: 'visa-application',
      name: 'Visa Application',
      caseType: 'visa_application',
      sortOrder: 1,
      description: 'Expert assistance with visa applications for UK, Canada, USA, Germany, UAE and more',
      estimatedTimeline: '4-12 weeks',
      isActive: true,
    },
    {
      slug: 'visa-appeal',
      name: 'Visa Appeal',
      caseType: 'visa_appeal',
      sortOrder: 2,
      description: 'Professional representation for visa refusals and appeals',
      estimatedTimeline: '8-16 weeks',
      isActive: true,
    },
    {
      slug: 'criminal-inadmissibility',
      name: 'Criminal Inadmissibility',
      caseType: 'criminal_inadmissibility',
      sortOrder: 3,
      description: 'Overcome criminal record barriers to immigration',
      estimatedTimeline: '12-24 weeks',
      isActive: true,
    },
    {
      slug: 'police-clearance',
      name: 'Police Clearance',
      caseType: 'police_clearance',
      sortOrder: 4,
      description: 'Obtain police clearance certificates for immigration purposes',
      estimatedTimeline: '2-6 weeks',
      isActive: true,
    },
    {
      slug: 'eu-verification',
      name: 'EU Verification',
      caseType: 'eu_verification',
      sortOrder: 5,
      description: 'EU citizenship and residency verification services',
      estimatedTimeline: '6-16 weeks',
      isActive: true,
    },
    {
      slug: 'study-permit',
      name: 'Study Permit',
      caseType: 'study_permit',
      sortOrder: 6,
      description: 'Student visa and study permit applications',
      estimatedTimeline: '4-8 weeks',
      isActive: true,
    },
    {
      slug: 'work-permit',
      name: 'Work Permit',
      caseType: 'work_permit',
      sortOrder: 7,
      description: 'Work permit and employment visa assistance',
      estimatedTimeline: '6-14 weeks',
      isActive: true,
    },
    {
      slug: 'family-reunification',
      name: 'Family Reunification',
      caseType: 'family_reunification',
      sortOrder: 8,
      description: 'Bring your family together through immigration',
      estimatedTimeline: '8-20 weeks',
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.serviceCatalog.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  console.log(`✅ Seeded ${services.length} services`);
}

runSeed()
  .then(() => {
    console.log('Services seeded');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
