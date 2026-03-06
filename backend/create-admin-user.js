/**
 * Script to create an Immigration AI admin user
 * This creates a user with full admin access to monitor traffic and manage the platform
 * 
 * Usage: node create-admin-user.js
 * 
 * Or with custom credentials:
 * node create-admin-user.js <email> <password>
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser(email, password) {
  try {
    console.log('\n🔐 Creating Immigration AI Admin User...\n');
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'admin',
          subscriptionPlan: 'enterprise',
          subscriptionStatus: 'active'
        }
      });
      
      console.log('✅ Successfully updated existing user to admin!');
      console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
      console.log('║                        ADMIN USER UPDATED                            ║');
      console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
      console.log(`👤 Name:     ${updatedUser.fullName || 'Admin User'}`);
      console.log(`📧 Email:    ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`👑 Role:     ${updatedUser.role}`);
      console.log(`💎 Plan:     ${updatedUser.subscriptionPlan}`);
      console.log(`✨ Status:   ${updatedUser.subscriptionStatus}`);
      
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: 'Immigration AI Admin',
          role: 'admin',
          subscriptionPlan: 'enterprise',
          subscriptionStatus: 'active'
        }
      });
      
      console.log('✅ Successfully created new admin user!');
      console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
      console.log('║                      NEW ADMIN USER CREATED                          ║');
      console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
      console.log(`👤 Name:     ${newUser.fullName}`);
      console.log(`📧 Email:    ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`👑 Role:     ${newUser.role}`);
      console.log(`💎 Plan:     ${newUser.subscriptionPlan}`);
      console.log(`✨ Status:   ${newUser.subscriptionStatus}`);
    }

    console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                         ADMIN ACCESS URLS                            ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
    console.log('🌐 Admin Login (platform admins only):');
    console.log('   https://www.immigrationai.co.za/admin/login');
    console.log('');
    console.log('📊 Admin Dashboard:');
    console.log('   https://www.immigrationai.co.za/admin');
    console.log('');
    console.log('🎯 UTM Analytics (ProConnectSA tracking):');
    console.log('   https://www.immigrationai.co.za/admin/utm-analytics');
    console.log('');
    console.log('💰 Payment Verification:');
    console.log('   https://www.immigrationai.co.za/admin/payments');
    console.log('');

    console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║                        WHAT YOU CAN DO NOW                           ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
    console.log('✅ Monitor ProConnectSA traffic and conversions');
    console.log('✅ Track UTM campaigns and attribution');
    console.log('✅ View user signups by traffic source');
    console.log('✅ Verify and approve payments');
    console.log('✅ Access all admin analytics dashboards');
    console.log('✅ Manage user accounts and subscriptions');
    console.log('');

    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('💡 TIP: Change your password after first login via the dashboard');
    console.log('');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    
    if (error.code === 'P2002') {
      console.error('\n💡 This email is already in use. Try a different email or update the existing user.');
    } else if (error.code === 'P1001') {
      console.error('\n💡 Cannot connect to database. Check your DATABASE_URL in .env file.');
    } else {
      console.error('\n💡 Full error:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments or use defaults
const args = process.argv.slice(2);
let email, password;

if (args.length >= 2) {
  // Custom email and password provided
  email = args[0];
  password = args[1];
} else if (args.length === 0) {
  // Use default credentials (interactive mode)
  console.log('\n⚡ Quick Admin Setup Mode');
  console.log('Creating admin with default credentials...\n');
  
  // Generate a strong default password
  const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
  email = 'admin@immigrationai.co.za';
  password = randomPassword;
} else {
  console.error('\n❌ Invalid arguments!');
  console.error('\nUsage:');
  console.error('  1. Quick setup (auto-generates credentials):');
  console.error('     node create-admin-user.js');
  console.error('');
  console.error('  2. Custom credentials:');
  console.error('     node create-admin-user.js <email> <password>');
  console.error('');
  console.error('Examples:');
  console.error('  node create-admin-user.js');
  console.error('  node create-admin-user.js admin@immigrationai.co.za MySecurePass123');
  console.error('  node create-admin-user.js yourname@example.com YourPassword456\n');
  process.exit(1);
}

// Validate email
if (!email || !email.includes('@')) {
  console.error('\n❌ Invalid email address!');
  process.exit(1);
}

// Validate password
if (!password || password.length < 8) {
  console.error('\n❌ Password must be at least 8 characters long!');
  process.exit(1);
}

// Create the admin user
createAdminUser(email, password);



