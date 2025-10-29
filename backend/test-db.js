const { Client } = require('pg');
require('dotenv').config();

async function testDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Test basic queries
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log('📊 Users in database:', result.rows[0].count);
    
    // Check subscription tiers
    const tiers = await client.query('SELECT subscription_plan, COUNT(*) FROM users GROUP BY subscription_plan');
    console.log('📈 Subscription tiers:', tiers.rows);
    
    // Check if we need to add credits
    const usersWithoutCredits = await client.query(`
      SELECT id, email, subscription_plan 
      FROM users 
      WHERE account_number IS NULL OR account_number = ''
    `);
    
    if (usersWithoutCredits.rows.length > 0) {
      console.log('⚠️  Users without account numbers:', usersWithoutCredits.rows.length);
    } else {
      console.log('✅ All users have account numbers');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

testDatabase();









