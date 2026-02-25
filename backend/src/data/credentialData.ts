// Evaluation Bodies by Destination Country
export const evaluationBodies = {
  UK: [
    {
      name: 'UK ENIC (formerly NARIC)',
      description: 'Official UK body for qualification recognition',
      url: 'https://www.enic.org.uk',
      cost: '£68-£107 per application',
      processingTime: '5-10 working days',
      accepts: 'All countries',
    },
  ],
  Canada: [
    {
      name: 'WES (World Education Services)',
      description: 'Most widely accepted evaluation service',
      url: 'https://www.wes.org',
      cost: 'CAD $239 basic, $329 course by course',
      processingTime: '7-11 weeks standard, 3-5 weeks fast track',
      accepts: 'All countries',
    },
    {
      name: 'ICAS (International Credential Assessment Service)',
      description: 'Alternative evaluation service',
      url: 'https://www.icascanada.ca',
      cost: 'CAD $200-$250',
      processingTime: '6-8 weeks',
      accepts: 'All countries',
    },
  ],
  USA: [
    {
      name: 'WES (World Education Services)',
      description: 'Most common evaluation service',
      url: 'https://www.wes.org',
      cost: 'Varies by service type',
      processingTime: '7-20 business days',
      accepts: 'All countries',
    },
    {
      name: 'NACES Member Organizations',
      description: 'Multiple accredited evaluation services',
      url: 'https://www.naces.org/members',
      cost: 'Varies by organization',
      processingTime: 'Varies by organization',
      accepts: 'All countries',
      note: 'Choice depends on institution requiring evaluation',
    },
  ],
  Germany: [
    {
      name: 'anabin database',
      description: 'Check recognition status first',
      url: 'https://anabin.kmk.org',
      cost: 'Free to check',
      processingTime: 'N/A',
      accepts: 'All countries',
      note: 'Use to verify if formal recognition is needed',
    },
    {
      name: 'KMK (Standing Conference of the Ministers of Education)',
      description: 'For formal recognition',
      url: 'https://www.kmk.org',
      cost: 'Varies',
      processingTime: '3-6 months',
      accepts: 'All countries',
    },
  ],
  UAE: [
    {
      name: 'UAE Ministry of Education',
      description: 'Attestation required for all documents',
      url: 'https://www.moe.gov.ae',
      cost: 'Varies',
      processingTime: '2-4 weeks',
      accepts: 'All countries',
      note: 'Original documents must be attested',
    },
  ],
};

// African Universities Recognition Status
export const africanUniversities = [
  {
    university: 'University of Lagos',
    country: 'Nigeria',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'University of Ibadan',
    country: 'Nigeria',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'Obafemi Awolowo University',
    country: 'Nigeria',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'University of Ghana',
    country: 'Ghana',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'KNUST',
    country: 'Ghana',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'University of Nairobi',
    country: 'Kenya',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'Strathmore University',
    country: 'Kenya',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'University of Cape Town',
    country: 'South Africa',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'Stellenbosch University',
    country: 'South Africa',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'University of Pretoria',
    country: 'South Africa',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'Addis Ababa University',
    country: 'Ethiopia',
    ukStatus: 'recognised',
    canadaStatus: 'partial',
    usaStatus: 'partial',
    notes: 'May need evaluation',
  },
  {
    university: 'Makerere University',
    country: 'Uganda',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
  {
    university: 'University of Dar es Salaam',
    country: 'Tanzania',
    ukStatus: 'recognised',
    canadaStatus: 'partial',
    usaStatus: 'partial',
    notes: null,
  },
  {
    university: 'University of Zimbabwe',
    country: 'Zimbabwe',
    ukStatus: 'recognised',
    canadaStatus: 'recognised',
    usaStatus: 'recognised',
    notes: null,
  },
];

// Attestation Requirements by Origin Country
export const attestationRequirements = {
  Nigeria: {
    steps: [
      'Get document notarized by Nigerian notary public',
      'Federal Ministry of Education authentication (for academic docs)',
      'Ministry of Foreign Affairs attestation',
      'Destination country embassy legalization OR apostille',
    ],
    apostilleAvailable: true,
    notes: 'NYSC certificate required for degrees — must also be attested',
  },
  Ghana: {
    steps: [
      'Ghana Education Service authentication',
      'Ministry of Foreign Affairs attestation',
      'Embassy legalization or apostille',
    ],
    apostilleAvailable: true,
    notes: null,
  },
  Kenya: {
    steps: [
      'Kenya National Examinations Council verification',
      'Ministry of Foreign Affairs attestation',
    ],
    apostilleAvailable: true,
    notes: null,
  },
  'South Africa': {
    steps: [
      'SAQA evaluation for foreign qualifications',
      'Department of International Relations attestation',
    ],
    apostilleAvailable: true,
    notes: 'SA qualifications generally well recognised internationally',
  },
  Ethiopia: {
    steps: [
      'Ministry of Education authentication',
      'Ministry of Foreign Affairs attestation',
      'Embassy legalization (apostille not yet available)',
    ],
    apostilleAvailable: false,
    notes: 'Allow extra time — embassy legalization can take 4-6 weeks',
  },
  Uganda: {
    steps: [
      'Uganda National Examinations Board verification',
      'Ministry of Foreign Affairs attestation',
      'Embassy legalization or apostille',
    ],
    apostilleAvailable: true,
    notes: null,
  },
  Tanzania: {
    steps: [
      'Tanzania Commission for Universities verification',
      'Ministry of Foreign Affairs attestation',
      'Embassy legalization or apostille',
    ],
    apostilleAvailable: true,
    notes: null,
  },
  Zimbabwe: {
    steps: [
      'Zimbabwe Council for Higher Education verification',
      'Ministry of Foreign Affairs attestation',
      'Embassy legalization or apostille',
    ],
    apostilleAvailable: true,
    notes: null,
  },
};
