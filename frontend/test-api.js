// API Test Script
const http = require('http');

const testData = {
  code: 'H12512',
  name: 'API 테스트 시험',
  grade: 'H1',
  year: 2025,
  month: 12,
  type: '교육청'
};

const options = {
  hostname: 'localhost',
  port: 4003,
  path: '/api/admin/mock-exams',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(JSON.stringify(testData));
req.end();
