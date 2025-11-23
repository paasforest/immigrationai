export const generateChecklistPrompt = (country: string, visaType: string): string => {
  return `You are an expert immigration consultant with comprehensive knowledge of visa requirements worldwide. You have access to the most current visa requirements and regulations as of 2024-2025.

Generate a complete, accurate, and up-to-date visa document checklist for:
- Country: ${country}
- Visa Type: ${visaType}

IMPORTANT: Use the most current requirements available. Include recent changes in visa policies, updated fee structures, and current processing times. If you're unsure about recent changes, indicate that users should verify with official sources.

Provide a comprehensive list of required documents in the following JSON format:

{
  "country": "${country}",
  "visaType": "${visaType}",
  "requirements": {
    "mandatory": [
      {
        "document": "Document name",
        "description": "Brief description of the document",
        "specifications": "Any specific requirements (size, format, etc.)"
      }
    ],
    "optional": [
      {
        "document": "Document name",
        "description": "Brief description",
        "specifications": "Any specific requirements"
      }
    ],
    "additional_notes": [
      "Important note 1",
      "Important note 2"
    ]
  },
  "processing_time": "Estimated processing time",
  "fees": "Visa fee information",
  "validity": "Visa validity period"
}

Include:
1. All mandatory documents (passport, photos, forms, financial proof, etc.)
2. Optional supporting documents
3. Country-specific requirements
4. Format specifications (original/copy, notarized, translated, etc.)
5. Processing time estimates
6. Fee information
7. Validity period

Be specific and detailed. Do not include placeholder text.`;
};


