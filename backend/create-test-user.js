const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔐 Creating test user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'test@immigrationai.com',
        passwordHash: hashedPassword,
        fullName: 'Test User',
        subscriptionPlan: 'premium',
        subscriptionStatus: 'active'
      }
    });
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@immigrationai.com');
    console.log('🔑 Password: testpassword123');
    console.log('👤 User ID:', user.id);
    console.log('💎 Plan: Premium');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  User already exists with this email');
      console.log('📧 Email: test@immigrationai.com');
      console.log('🔑 Password: testpassword123');
    } else {
      console.error('❌ Error creating user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
