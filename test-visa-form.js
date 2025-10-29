// Test script to simulate visa form submission
const testData = {
  targetCountry: 'ireland',
  visaType: 'stamp_4',
  age: '34',
  relationship: 'spouse',
  sponsorStatus: 'citizen',
  sponsorIncome: '55000',
  maritalStatus: 'married',
  dependents: '0',
  nationality: 'Nigerian'
};

console.log('Testing with data:', JSON.stringify(testData, null, 2));

fetch('http://localhost:4000/api/ai/check-eligibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData),
})
.then(response => response.json())
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});

