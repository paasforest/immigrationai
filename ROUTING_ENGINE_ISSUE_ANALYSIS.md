# Routing Engine Issue Analysis

## Problem Summary

The `convertIntakeToCase` function in `routingEngine.ts` (lines 314-340) is trying to create a `Case` record, but there's likely a mismatch between:
1. What fields the `Case` model requires in Prisma schema
2. What fields are being provided in the `prisma.case.create()` call

## Key Code Section (lines 314-340)

```typescript
// Line 314-316: Check if professional has organizationId
if (!professional || !professional.organizationId) {
  throw new Error('Professional not found or not in organization');
}

// Line 322-336: Create case
const newCase = await prisma.case.create({
  data: {
    organizationId: professional.organizationId,
    assignedProfessionalId: professionalId,
    applicantId: applicantId,
    referenceNumber,
    title: `${intake.service.name} — ${intake.applicantName}`,
    visaType: intake.service.caseType,
    originCountry: intake.applicantCountry,
    destinationCountry: intake.destinationCountry,
    priority,
    notes: intake.description,
    status: 'open',
  },
});
```

## Potential Issues

### Issue 1: Independent Professionals
**Problem:** Line 314-316 throws an error if `professional.organizationId` is null. However, independent professionals (`isIndependentProfessional: true`) might not have an `organizationId`.

**Solution:** Allow independent professionals to create cases without organizationId, or create a default organization for them.

### Issue 2: Missing Required Fields
**Problem:** The `Case` model in Prisma schema might have required fields that aren't being provided:
- `createdAt` / `updatedAt` - Usually auto-generated, but might need explicit values
- Other required fields not in the create call

### Issue 3: Field Type Mismatches
**Problem:** 
- `priority` might need to be a specific enum value, not just 'normal'
- `status` might need to be a specific enum value, not just 'open'
- `visaType` might need validation against allowed values

### Issue 4: Reference Number Generation
**Problem:** `generateCaseReference()` might be failing or returning an invalid format.

## Schema Requirements Check Needed

The `Case` model likely requires:
- `organizationId` - ✅ Provided (but might be null for independent professionals)
- `referenceNumber` - ✅ Provided
- `title` - ✅ Provided
- `status` - ✅ Provided (but might need to be enum)
- `priority` - ✅ Provided (but might need to be enum)
- `visaType` - ✅ Provided
- `originCountry` - ✅ Provided
- `destinationCountry` - ✅ Provided
- `applicantId` - ✅ Provided
- `assignedProfessionalId` - ✅ Provided

## Recommended Fixes

### Fix 1: Handle Independent Professionals
```typescript
// Instead of throwing error, handle independent professionals
if (!professional) {
  throw new Error('Professional not found');
}

// For independent professionals, create a personal organization or allow null
const orgId = professional.organizationId || await createOrGetPersonalOrg(professionalId);
```

### Fix 2: Validate Required Fields
```typescript
// Add validation before create
if (!referenceNumber || !title || !visaType) {
  throw new Error('Missing required case fields');
}
```

### Fix 3: Check Prisma Schema
Verify the `Case` model doesn't have additional required fields or constraints that aren't being satisfied.

## Next Steps

1. Check the actual `Case` model definition in `schema.prisma`
2. Verify what error is actually being thrown (check logs)
3. Test with a professional that has `organizationId`
4. Test with an independent professional (if applicable)
5. Check if `generateCaseReference()` is working correctly
