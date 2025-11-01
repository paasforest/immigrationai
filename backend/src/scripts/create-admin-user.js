/**
 * Script to create an admin user
 * Usage: node backend/src/scripts/create-admin-user.js <email> <password>
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin(email, password) {
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user to admin
      await prisma.user.update({
        where: { email },
        data: {
          role: 'admin',
          subscriptionPlan: 'enterprise',
          subscriptionStatus: 'active'
        }
      });
      console.log(`✅ Updated existing user ${email} to admin`);
    } else {
      // Create new admin user
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: 'Admin User',
          role: 'admin',
          subscriptionPlan: 'enterprise',
          subscriptionStatus: 'active'
        }
      });
      console.log(`✅ Created admin user: ${email}`);
    }

    console.log('\n🔑 Admin credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`\n📍 Admin Panel: https://immigrationai.co.za/admin/payments`);
    console.log(`\n⚠️  Save these credentials securely!\n`);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node create-admin-user.js <email> <password>');
  console.error('Example: node create-admin-user.js admin@immigrationai.co.za MySecurePass123');
  process.exit(1);
}

createAdmin(email, password);

