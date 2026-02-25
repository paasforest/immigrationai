# Schema Updates Needed

## Step 1: Update Existing Models

Add these fields to your **existing User model** in `schema.prisma`:

```prisma
model User {
  // ... ALL EXISTING FIELDS STAY THE SAME ...
  
  // NEW: Organization relationship
  organizationId   String?   @map("organization_id") @db.Uuid
  organization     Organization? @relation(fields: [organizationId], references: [id])
  
  // NEW: Additional fields
  phone            String?   @db.VarChar(50)
  avatarUrl        String?   @map("avatar_url") @db.VarChar(500)
  isActive         Boolean   @default(true) @map("is_active")
  
  // NEW: Relations for multi-tenancy
  assignedCases    Case[] @relation("AssignedCases")
  applicantCases   Case[] @relation("ApplicantCases")
  assignedTasks    Task[] @relation("AssignedTasks")
  createdTasks     Task[] @relation("CreatedTasks")
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  auditLogs        AuditLog[]
  
  // ... rest of existing relations stay the same ...
}
```

## Step 2: Update Subscription Model

Change the **existing Subscription model** from `userId` to `organizationId`:

```prisma
model Subscription {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // CHANGE: From userId to organizationId
  organizationId       String    @map("organization_id") @db.Uuid
  organization         Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Keep existing payment fields
  plan                 String    @db.VarChar(50)
  stripeSubscriptionId String?   @unique @map("stripe_subscription_id") @db.VarChar(255)
  stripeCustomerId     String?   @map("stripe_customer_id") @db.VarChar(255)
  
  // NEW: Additional payment methods
  payfastSubscriptionId String? @map("payfast_subscription_id") @db.VarChar(255)
  yocoSubscriptionId    String? @map("yoco_subscription_id") @db.VarChar(255)
  accountNumber         String? @map("account_number") @db.VarChar(50)
  
  // NEW: Additional fields
  status               String    @default("trial") @db.VarChar(50)
  paymentMethod        String?   @map("payment_method") @db.VarChar(50)
  amount               Decimal?   @db.Decimal(10, 2)
  currency             String    @default("ZAR") @db.VarChar(10)
  billingCycle         String    @default("monthly") @map("billing_cycle") @db.VarChar(20)
  
  currentPeriodStart   DateTime? @map("current_period_start") @db.Timestamp(6)
  currentPeriodEnd     DateTime? @map("current_period_end") @db.Timestamp(6)
  cancelledAt          DateTime? @map("cancelled_at") @db.Timestamp(6)
  
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)

  @@index([organizationId])
  @@index([status])
  @@map("subscriptions")
}
```

**IMPORTANT:** You'll need a migration script to:
1. Create "personal" organizations for existing users
2. Move their subscriptions to organizations
3. Update userId to organizationId in subscriptions table

## Step 3: Add New Models

Copy all models from `schema-multi-tenant.prisma` into your main `schema.prisma` file.

## Step 4: Generate Migration

```bash
cd backend
npx prisma migrate dev --name add_multi_tenant_models
```

## Step 5: Review Migration

**DO NOT RUN** until you've reviewed the migration SQL file. Check for:
- Proper foreign key constraints
- Indexes created
- Default values
- Column types match existing patterns
