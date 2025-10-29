const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'test@immigrationai.com' }
    });
    
    console.log('User found:', user);
    console.log('User ID:', user?.id);
    console.log('User ID length:', user?.id?.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();


