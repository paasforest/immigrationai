// Simple test for payment system
const { paymentService } = require('./dist/services/paymentService');

async function testPaymentMethods() {
  try {
    console.log('Testing payment methods...');
    
    const methods = paymentService.getAvailablePaymentMethods();
    console.log('Available payment methods:', methods);
    
    console.log('✅ Payment system test passed!');
  } catch (error) {
    console.error('❌ Payment system test failed:', error.message);
  }
}

testPaymentMethods();

