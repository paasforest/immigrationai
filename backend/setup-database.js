const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Add missing columns
    console.log('🔧 Adding missing columns...');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number VARCHAR(255) UNIQUE');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0');
    console.log('✅ Added account_number and credits columns');
    
    // Generate account numbers for existing users
    console.log('🔢 Generating account numbers...');
    const users = await client.query('SELECT id, email FROM users WHERE account_number IS NULL');
    
    for (const user of users.rows) {
      const accountNumber = 'ACC' + user.id.toString().padStart(6, '0');
      await client.query('UPDATE users SET account_number = $1 WHERE id = $2', [accountNumber, user.id]);
      console.log(`  - ${user.email}: ${accountNumber}`);
    }
    
    // Set credits based on subscription plan
    console.log('💰 Setting credits based on subscription plans...');
    const creditMap = {
      'starter': 3,
      'entry': 10,
      'professional': 50,
      'enterprise': 200
    };
    
    for (const [plan, credits] of Object.entries(creditMap)) {
      await client.query('UPDATE users SET credits = $1 WHERE subscription_plan = $2', [credits, plan]);
      console.log(`  - ${plan}: ${credits} credits`);
    }
    
    // Show final results
    console.log('\n📊 Final user data:');
    const result = await client.query(`
      SELECT email, subscription_plan, account_number, credits 
      FROM users 
      ORDER BY subscription_plan, email
    `);
    
    result.rows.forEach(user => {
      console.log(`  - ${user.email} | ${user.subscription_plan} | ${user.account_number} | ${user.credits} credits`);
    });
    
    console.log('\n✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

setupDatabase();









