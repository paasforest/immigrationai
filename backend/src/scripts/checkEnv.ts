#!/usr/bin/env ts-node

/**
 * Environment Variable Checker
 * Validates all required environment variables are set
 */

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENAI_API_KEY',
  'FRONTEND_URL',
  'NODE_ENV',
];

const optionalVars = [
  'PAYFAST_MERCHANT_ID',
  'STRIPE_SECRET_KEY',
  'YOCO_SECRET_KEY',
  'RESEND_API_KEY',
];

const frontendRequiredVars = [
  'NEXT_PUBLIC_API_URL',
];

function checkEnv(): void {
  console.log('🔍 Checking environment variables...\n');

  let hasErrors = false;
  let hasWarnings = false;

  // Check required backend vars
  console.log('📋 Required Backend Variables:');
  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`  ❌ ${varName} - MISSING`);
      hasErrors = true;
    } else {
      // Mask sensitive values
      const displayValue =
        varName.includes('SECRET') || varName.includes('KEY') || varName === 'DATABASE_URL'
          ? '***' + value.slice(-4)
          : value;
      console.log(`  ✅ ${varName} - ${displayValue}`);
    }
  });

  console.log('\n📋 Optional Backend Variables:');
  optionalVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      console.log(`  ⚠️  ${varName} - NOT SET (optional)`);
      hasWarnings = true;
    } else {
      const displayValue = varName.includes('SECRET') || varName.includes('KEY')
        ? '***' + value.slice(-4)
        : value;
      console.log(`  ✅ ${varName} - ${displayValue}`);
    }
  });

  console.log('\n📋 Frontend Variables (check in frontend .env):');
  frontendRequiredVars.forEach((varName) => {
    console.log(`  ℹ️  ${varName} - Check in frontend .env.local`);
  });

  console.log('\n' + '='.repeat(50));

  if (hasErrors) {
    console.log('\n❌ ERRORS FOUND: Some required variables are missing!');
    console.log('Please set all required variables before starting the server.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  WARNINGS: Some optional variables are not set.');
    console.log('The server will run, but some features may not work.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All environment variables are set correctly!\n');
    process.exit(0);
  }
}

// Run check
checkEnv();
