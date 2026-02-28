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

// ─── Corridor Evaluation Body Lookup ─────────────────────────────────────────
// Given an applicant's origin country and their destination country,
// returns the primary evaluation body they will need to engage.
// Used by the risk profile service to auto-flag credential evaluation needs.
export interface CorridorEvalBody {
  body: string;
  url: string;
  mandatory: boolean; // mandatory for the visa type, or advisory?
  note?: string;
}

export function getCorridorEvaluationBody(
  originCountry: string,
  destinationCountry: string
): CorridorEvalBody | null {
  const dest = destinationCountry.toLowerCase();
  const origin = originCountry.toLowerCase();

  // ── United Kingdom ────────────────────────────────────────────────────────
  if (dest.includes('united kingdom') || dest.includes('uk') || dest.includes('britain')) {
    return {
      body: 'UK ENIC (formerly NARIC)',
      url: 'https://www.enic.org.uk',
      mandatory: true,
      note: 'Required for Skilled Worker and most professional licence applications.',
    };
  }

  // ── Canada ────────────────────────────────────────────────────────────────
  if (dest.includes('canada')) {
    // Quebec has its own body
    return {
      body: 'WES (World Education Services)',
      url: 'https://www.wes.org',
      mandatory: true,
      note: 'Required for Express Entry and most skilled worker streams. Quebec applicants use MIDI instead.',
    };
  }

  // ── Australia ─────────────────────────────────────────────────────────────
  if (dest.includes('australia')) {
    return {
      body: 'VETASSESS / Engineers Australia / relevant assessing body',
      url: 'https://www.vetassess.com.au',
      mandatory: true,
      note: 'Assessing body depends on nominated occupation. Check ANZSCO code first.',
    };
  }

  // ── Germany ───────────────────────────────────────────────────────────────
  if (dest.includes('germany')) {
    return {
      body: 'anabin / KMK (Standing Conference of Education Ministers)',
      url: 'https://anabin.kmk.org',
      mandatory: false,
      note: 'Check anabin first to confirm recognition status. If not listed, formal KMK recognition is required.',
    };
  }

  // ── France ────────────────────────────────────────────────────────────────
  if (dest.includes('france')) {
    return {
      body: 'ANABIN / ENIC-NARIC France',
      url: 'https://www.ciep.fr/anabin',
      mandatory: false,
      note: 'Use ANABIN to check if the qualification is automatically recognised. Otherwise apply via ENIC-NARIC.',
    };
  }

  // ── Netherlands ───────────────────────────────────────────────────────────
  if (dest.includes('netherlands') || dest.includes('holland')) {
    return {
      body: 'Nuffic / EP-Nuffic',
      url: 'https://www.nuffic.nl/en',
      mandatory: false,
      note: 'Required for regulated professions and certain academic routes. Free online check available.',
    };
  }

  // ── Ireland ───────────────────────────────────────────────────────────────
  if (dest.includes('ireland')) {
    return {
      body: 'QQI (Quality & Qualifications Ireland)',
      url: 'https://www.qqi.ie',
      mandatory: false,
      note: 'Required for regulated professions. Employment permits do not always require formal recognition.',
    };
  }

  // ── Belgium ───────────────────────────────────────────────────────────────
  if (dest.includes('belgium')) {
    return {
      body: 'NARIC Belgium (Flemish/French Community)',
      url: 'https://www.naricvlaanderen.be',
      mandatory: false,
      note: 'Body differs based on which community region the applicant will live in.',
    };
  }

  // ── South Africa ─────────────────────────────────────────────────────────
  if (dest.includes('south africa')) {
    return {
      body: 'SAQA (South African Qualifications Authority)',
      url: 'https://www.saqa.org.za',
      mandatory: true,
      note: 'All foreign qualifications must be evaluated by SAQA. Processing: 6–12 weeks.',
    };
  }

  // ── USA ───────────────────────────────────────────────────────────────────
  if (dest.includes('united states') || dest.includes('usa') || dest.includes('america')) {
    return {
      body: 'NACES-member body (WES, ECE, SpanTran etc.)',
      url: 'https://www.naces.org/members',
      mandatory: false,
      note: 'Required by most universities and many employers. Choice of body depends on the institution.',
    };
  }

  // ── UAE ───────────────────────────────────────────────────────────────────
  if (dest.includes('uae') || dest.includes('emirates') || dest.includes('dubai') || dest.includes('abu dhabi')) {
    return {
      body: 'UAE Ministry of Education — Attestation',
      url: 'https://www.moe.gov.ae',
      mandatory: true,
      note: 'All academic documents must be attested through the UAE Ministry of Education before use.',
    };
  }

  // ── EU General (Schengen member not listed above) ─────────────────────────
  if (
    ['austria', 'sweden', 'denmark', 'finland', 'norway', 'switzerland', 'spain', 'italy',
     'portugal', 'poland', 'czech republic', 'hungary', 'romania', 'greece'].some(c => dest.includes(c))
  ) {
    return {
      body: 'National ENIC-NARIC centre for destination country',
      url: 'https://www.enic-naric.net/find-a-national-centre.aspx',
      mandatory: false,
      note: 'Each EU country has its own national ENIC-NARIC centre. Check the ENIC-NARIC directory for the correct body.',
    };
  }

  return null; // No specific mapping — professional to advise
}

// ─── Attestation Requirements by Origin Country
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
