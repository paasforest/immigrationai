import prisma from '../config/prisma';

/**
 * Generate unique case reference number
 * Format: IMM-[YEAR]-[6 DIGIT RANDOM NUMBER]
 * Example: IMM-2025-847392
 */
export async function generateCaseReference(): Promise<string> {
  const year = new Date().getFullYear();
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate 6-digit random number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const reference = `IMM-${year}-${randomNum}`;

    // Check if reference already exists
    const existing = await prisma.case.findUnique({
      where: { referenceNumber: reference },
      select: { id: true },
    });

    if (!existing) {
      return reference;
    }

    attempts++;
  }

  // If we couldn't generate a unique reference after max attempts, throw error
  throw new Error('Failed to generate unique case reference number after multiple attempts');
}
