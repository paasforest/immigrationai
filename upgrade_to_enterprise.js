const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'immigration_ai',
  user: 'postgres',
  password: 'password'
});

async function upgradeToEnterprise() {
  try {
    console.log('Connecting to database...');
    
    // Get all users
    const usersResult = await pool.query('SELECT id, email, full_name, subscription_plan FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('Current users:');
    usersResult.rows.forEach(user => {
      console.log(`- ${user.email} (${user.full_name}) - Plan: ${user.subscription_plan}`);
    });
    
    // Update the first user to enterprise plan
    const updateResult = await pool.query(`
      UPDATE users 
      SET subscription_plan = 'enterprise', 
          subscription_status = 'active',
          updated_at = NOW()
      WHERE id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)
      RETURNING id, email, full_name, subscription_plan
    `);
    
    if (updateResult.rows.length > 0) {
      const user = updateResult.rows[0];
      console.log(`\n✅ Successfully upgraded user to Enterprise plan:`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Name: ${user.full_name}`);
      console.log(`- Plan: ${user.subscription_plan}`);
      console.log(`\nYou can now test all enterprise features!`);
    } else {
      console.log('No users found to upgrade');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

upgradeToEnterprise();







