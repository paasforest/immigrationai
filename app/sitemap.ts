import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.immigrationai.co.za';
  const now = new Date();

  return [
    // ─── Core pages (highest priority) ──────────────────────────────────────
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/find-a-specialist`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // ─── High-intent applicant landing pages ─────────────────────────────────
    {
      url: `${baseUrl}/visa-rejection-help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.98,
    },
    {
      url: `${baseUrl}/immigration-consultant`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.97,
    },
    {
      url: `${baseUrl}/immigration-lawyer`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.96,
    },

    // ─── Destination country pages ────────────────────────────────────────────
    {
      url: `${baseUrl}/uk-visa-help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/canada-immigration`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/australia-visa-help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/germany-immigration`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/uae-visa-help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/new-zealand-immigration`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },
    {
      url: `${baseUrl}/schengen-visa-help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },

    // ─── South Africa (primary market) ────────────────────────────────────────
    {
      url: `${baseUrl}/south-africa-immigration`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.97,
    },
    {
      url: `${baseUrl}/critical-skills-visa-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.96,
    },
    {
      url: `${baseUrl}/work-permit-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/spousal-visa-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/study-visa-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/business-visa-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/permanent-residence-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },
    {
      url: `${baseUrl}/zimbabwe-exemption-permit`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.91,
    },
    {
      url: `${baseUrl}/sadc-permits-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.90,
    },

    // ─── City-specific landing pages (SA primary market) ─────────────────────
    {
      url: `${baseUrl}/immigration-consultant-johannesburg`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/immigration-consultant-cape-town`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/immigration-consultant-pretoria`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },
    {
      url: `${baseUrl}/immigration-consultant-durban`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.92,
    },
    {
      url: `${baseUrl}/immigration-lawyer-johannesburg`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },
    {
      url: `${baseUrl}/immigration-lawyer-cape-town`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.92,
    },

    // ─── Visa type pages ──────────────────────────────────────────────────────
    {
      url: `${baseUrl}/skilled-worker-visa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/intra-company-transfer-visa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.89,
    },
    {
      url: `${baseUrl}/how-to-appeal-visa-rejection`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92,
    },
  ];
}
