#!/usr/bin/env node

/**
 * Assign users to marketing_test subscription plan
 * 
 * Usage:
 *   node assign-marketing-test.js                    # List all users
 *   node assign-marketing-test.js email@example.com  # Assign specific user
 *   node assign-marketing-test.js --all              # Assign all users
 *   node assign-marketing-test.js --list             # List users with marketing_test plan
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  try {
    // List all users with marketing_test plan
    if (args.includes('--list')) {
      console.log('📋 Users with marketing_test plan:');
      console.log('=====================================\n');
      
      const users = await prisma.user.findMany({
        where: {
          subscriptionPlan: 'marketing_test'
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (users.length === 0) {
        console.log('No users found with marketing_test plan.\n');
      } else {
        console.table(users);
        console.log(`\nTotal: ${users.length} user(s)\n`);
      }
      
      await prisma.$disconnect();
      return;
    }
    
    // Assign all users
    if (args.includes('--all')) {
      console.log('🔄 Assigning ALL users to marketing_test plan...\n');
      
      const result = await prisma.user.updateMany({
        where: {},
        data: {
          subscriptionPlan: 'marketing_test',
          subscriptionStatus: 'active'
        }
      });
      
      console.log(`✅ Updated ${result.count} user(s) to marketing_test plan\n`);
      
      // Show updated users
      const users = await prisma.user.findMany({
        where: {
          subscriptionPlan: 'marketing_test'
        },
        select: {
          email: true,
          fullName: true,
          subscriptionPlan: true,
          subscriptionStatus: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.table(users);
      await prisma.$disconnect();
      return;
    }
    
    // Assign specific user by email
    if (args.length > 0 && !args.includes('--all') && !args.includes('--list')) {
      const email = args[0];
      
      console.log(`🔄 Assigning user ${email} to marketing_test plan...\n`);
      
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        console.error(`❌ User with email ${email} not found.\n`);
        await prisma.$disconnect();
        process.exit(1);
      }
      
      const updated = await prisma.user.update({
        where: { email },
        data: {
          subscriptionPlan: 'marketing_test',
          subscriptionStatus: 'active'
        },
        select: {
          email: true,
          fullName: true,
          subscriptionPlan: true,
          subscriptionStatus: true
        }
      });
      
      console.log('✅ User updated successfully:');
      console.table([updated]);
      console.log('');
      
      await prisma.$disconnect();
      return;
    }
    
    // Default: List all users
    console.log('📋 All users in database:');
    console.log('==========================\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (users.length === 0) {
      console.log('No users found in database.\n');
    } else {
      console.table(users);
      console.log(`\nTotal: ${users.length} user(s)\n`);
      console.log('💡 Usage:');
      console.log('  node assign-marketing-test.js email@example.com  # Assign specific user');
      console.log('  node assign-marketing-test.js --all                # Assign all users');
      console.log('  node assign-marketing-test.js --list               # List marketing_test users\n');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
