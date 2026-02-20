import { Metadata } from 'next';
import { pricingMetadata } from './metadata';

export const metadata: Metadata = pricingMetadata;

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
