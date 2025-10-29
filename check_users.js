const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'immigration_ai',
  user: 'postgres',
  password: 'password'
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const result = await pool.query(`
      SELECT id, email, full_name, subscription_plan, subscription_status, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Found ${result.rows.length} users:\n`);
    
    result.rows.forEach((user, index) => {
      const planIcon = user.subscription_plan === 'enterprise' ? '🏢' : 
                      user.subscription_plan === 'professional' ? '💼' : 
                      user.subscription_plan === 'pro' ? '⭐' : '👤';
      
      console.log(`${index + 1}. ${planIcon} ${user.email}`);
      console.log(`   Name: ${user.full_name || 'N/A'}`);
      console.log(`   Plan: ${user.subscription_plan}`);
      console.log(`   Status: ${user.subscription_status}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      console.log('');
    });
    
    // Check for pro/professional/enterprise plans specifically
    const proUsers = result.rows.filter(user => 
      user.subscription_plan === 'pro' || 
      user.subscription_plan === 'professional' || 
      user.subscription_plan === 'enterprise'
    );
    
    if (proUsers.length > 0) {
      console.log('🎯 Users with Pro/Professional/Enterprise plans:');
      proUsers.forEach(user => {
        console.log(`✅ ${user.email} - ${user.subscription_plan} (${user.subscription_status})`);
      });
    } else {
      console.log('❌ No users found with Pro/Professional/Enterprise plans');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();







