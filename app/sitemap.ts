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
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // ─── High-intent SA visa landing pages ──────────────────────────────────
    // These target the exact keywords people search for
    {
      url: `${baseUrl}/visa-rejection-help`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.98, // "visa rejected south africa" — very high intent
    },
    {
      url: `${baseUrl}/critical-skills-visa-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.97,
    },
    {
      url: `${baseUrl}/work-permit-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.96,
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
      priority: 0.95,
    },
    {
      url: `${baseUrl}/business-visa-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/corporate-permit-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },
    {
      url: `${baseUrl}/permanent-residence-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },
    {
      url: `${baseUrl}/retired-person-visa-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.92,
    },
    {
      url: `${baseUrl}/intra-company-transfer-south-africa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.92,
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

    // ─── City-specific landing pages ─────────────────────────────────────────
    // "immigration consultant johannesburg" type searches
    {
      url: `${baseUrl}/immigration-consultant-johannesburg`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.96,
    },
    {
      url: `${baseUrl}/immigration-consultant-cape-town`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/immigration-consultant-pretoria`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/immigration-consultant-durban`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },
    {
      url: `${baseUrl}/immigration-lawyer-johannesburg`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.94,
    },
    {
      url: `${baseUrl}/immigration-lawyer-cape-town`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.93,
    },

    // ─── Feature / informational pages ───────────────────────────────────────
    {
      url: `${baseUrl}/how-to-appeal-visa-rejection-south-africa`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92,
    },
    {
      url: `${baseUrl}/dha-visa-application-requirements`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.88,
    },
  ];
}
