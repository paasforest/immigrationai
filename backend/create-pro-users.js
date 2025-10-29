const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createProUsers() {
  try {
    console.log('🚀 Creating pro users...');

    // Create test users with different subscription plans
    const users = [
      {
        email: 'admin@immigration-ai.com',
        password: 'admin123',
        fullName: 'Admin User',
        companyName: 'Immigration AI',
        subscriptionPlan: 'enterprise',
        subscriptionStatus: 'active'
      },
      {
        email: 'john.doe@example.com',
        password: 'password123',
        fullName: 'John Doe',
        companyName: 'Tech Corp',
        subscriptionPlan: 'professional',
        subscriptionStatus: 'active'
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        fullName: 'Jane Smith',
        companyName: 'Global Solutions',
        subscriptionPlan: 'entry',
        subscriptionStatus: 'active'
      },
      {
        email: 'test@example.com',
        password: 'test123',
        fullName: 'Test User',
        subscriptionPlan: 'starter',
        subscriptionStatus: 'active'
      }
    ];

    for (const userData of users) {
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: passwordHash,
          fullName: userData.fullName,
          companyName: userData.companyName,
          subscriptionPlan: userData.subscriptionPlan,
          subscriptionStatus: userData.subscriptionStatus
        }
      });

      console.log(`✅ Created user: ${user.email} (${user.subscriptionPlan} plan)`);

      // Create subscription record for pro users
      if (['professional', 'enterprise'].includes(userData.subscriptionPlan)) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: userData.subscriptionPlan,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        });
        console.log(`   📋 Created subscription for ${user.email}`);
      }
    }

    console.log('\n🎉 All pro users created successfully!');
    console.log('\n📋 User Accounts:');
    console.log('   Admin: admin@immigration-ai.com / admin123 (Enterprise)');
    console.log('   Pro: john.doe@example.com / password123 (Professional)');
    console.log('   Entry: jane.smith@example.com / password123 (Entry)');
    console.log('   Test: test@example.com / test123 (Starter)');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProUsers();


