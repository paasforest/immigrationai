import { Metadata } from 'next';
import ImmigrationAILanding from './page';

export const metadata: Metadata = {
  title: 'Immigration AI - AI-Powered Visa Document Assistant for African Applicants',
  description: 'Generate professional SOPs, cover letters, and visa documents in minutes. AI-powered tools for UK, USA, Canada, Ireland, Germany, and Schengen visa applications. Trusted by thousands of successful applicants.',
  keywords: 'immigration AI, visa documents, SOP generator, cover letter writer, UK visa, Canada visa, USA visa, visa application help, African applicants',
  openGraph: {
    title: 'Immigration AI - AI-Powered Visa Document Assistant',
    description: 'Generate professional SOPs, cover letters, and visa documents in minutes. AI-powered tools for visa applications.',
    type: 'website',
    url: 'https://www.immigrationai.co.za',
    siteName: 'Immigration AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immigration AI - AI-Powered Visa Document Assistant',
    description: 'Generate professional SOPs, cover letters, and visa documents in minutes.',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HomePageWrapper() {
  return (
    <>
      <ImmigrationAILanding />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Immigration AI',
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
            description: 'AI-powered visa document generation and eligibility checking for African applicants',
            offers: {
              '@type': 'Offer',
              price: '149',
              priceCurrency: 'ZAR',
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '149',
                priceCurrency: 'ZAR',
                unitText: 'MONTH',
              },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1250',
              bestRating: '5',
              worstRating: '1',
            },
            featureList: [
              'SOP Generator',
              'Cover Letter Writer',
              'Visa Eligibility Checker',
              'Document Checklist',
              'Interview Practice',
              'English Test Practice',
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Immigration AI',
            url: 'https://www.immigrationai.co.za',
            logo: 'https://www.immigrationai.co.za/logo.png',
            sameAs: [],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'Customer Service',
              email: 'support@immigrationai.co.za',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What is Immigration AI?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Immigration AI is an AI-powered platform that helps African applicants generate professional visa documents including SOPs, cover letters, and check visa eligibility for UK, USA, Canada, and other countries.',
                },
              },
              {
                '@type': 'Question',
                name: 'How much does Immigration AI cost?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Immigration AI offers plans starting from R149/month for the Starter plan, with Entry plan at R299/month, Professional at R699/month, and Enterprise at R1499/month.',
                },
              },
              {
                '@type': 'Question',
                name: 'Which countries does Immigration AI support?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Immigration AI supports visa applications for UK, USA, Canada, Ireland, Germany, Schengen countries, and UAE.',
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
