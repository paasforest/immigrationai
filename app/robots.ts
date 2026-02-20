import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.immigrationai.co.za';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/payment/',
          '/documents/',
          '/analytics/',
          '/subscription/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/payment/',
          '/documents/',
          '/analytics/',
          '/subscription/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
